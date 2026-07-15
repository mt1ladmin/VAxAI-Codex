/**
 * Knowledge Hub repositioning assistant.
 *
 * Proposes (and, once you approve, applies) rewrites of Knowledge Hub content
 * to VAxAI's current positioning: human-led operational administration support
 * and AI readiness, the free Admin Review, foundations first and AI second.
 *
 * Usage (from the repo root, with .env.local or the shell providing
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY):
 *
 *   node scripts/knowledge-hub-rewrite.mjs propose
 *     -> writes knowledge-hub-rewrites.md (review this) and
 *        knowledge-hub-rewrites.json (the exact updates)
 *
 *   node scripts/knowledge-hub-rewrite.mjs apply --yes
 *     -> applies every entry left in knowledge-hub-rewrites.json
 *        (delete any entry from the JSON to skip it)
 *
 * Pricing bands are intentionally excluded: numbers are yours, not the AI's.
 */

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const MODEL = "claude-haiku-4-5-20251001";
const PROPOSALS_JSON = "knowledge-hub-rewrites.json";
const PROPOSALS_MD = "knowledge-hub-rewrites.md";
const CONCURRENCY = 3;

/* ---------------------------------------------------------------- */
/* Environment                                                       */
/* ---------------------------------------------------------------- */

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

/* ---------------------------------------------------------------- */
/* Positioning brief — keep in sync with                             */
/* lib/engagement/service-fit/positioning.ts                         */
/* ---------------------------------------------------------------- */

const POSITIONING = `VAxAI is a UK-based, human-led operational administration support and AI readiness service. Brand line: "Reduce admin. Keep the human in the loop." Four connected service areas: backlog recovery, AI and automation readiness (organised information, clean data, documented processes), ongoing operational administration, and monitoring and maintenance. The journey is Prepare, then Support, then Maintain. Strong administrative foundations first, AI and automation second; never position AI as the hero.

Everything starts with the free Admin Review: a structured review of the organisation's administrative operations to understand what is going on and recommend the right support. Further work is scoped properly and always tested on a small scale first, with costs agreed before any work begins. There are no fixed project prices; pricing depends on scope, complexity, timeframe and how much hands-on support is needed. Ongoing day-to-day support is hourly (£25 for solo founders, £35 for organisations) as monthly or quarterly arrangements.

VAxAI does not build or sell AI; complex or enterprise builds go to trusted external partners. Prefer improving what the client already has. Primary audience: founders and entrepreneurs, SMEs, charities and non-profits, and public sector organisations.`;

const REWRITE_RULES = `You are repositioning internal Knowledge Hub content for the VAxAI team. For the record below, return updated values for the listed fields so they reflect the current positioning.

Rules:
- This is a repositioning pass, not a rewrite for its own sake. Keep the substance, structure and length of each field close to the original. If a field already fits the positioning, return it unchanged.
- Replace old framing (admin support with AI/VA as "the tools", AI opportunity assessments, workflow reviews as the offer, "Admin Health Check") with the current framing: the free Admin Review as the entry point, backlog recovery, AI and automation readiness groundwork, ongoing operational administration, monitoring and maintenance.
- Never invent facts, statistics, client names, results or experience that the original does not contain. Never quote fixed project prices.
- Keep any placeholders exactly as written (for example {{first_name}}, [organisation], <link>).
- UK English. No em dashes. Practical, calm, human; no hype and no anti-AI framing.
- Return every listed field. For array fields return the full updated array (or the original array unchanged). Set no_change_needed to true only if every field is returned unchanged.`;

/* ---------------------------------------------------------------- */
/* What gets rewritten                                               */
/* ---------------------------------------------------------------- */

const TARGETS = [
  {
    table: "engagement_sector_profiles",
    labelField: "name",
    kind: "Sector profile",
    stringFields: ["description", "common_operating_model", "starting_language"],
    arrayFields: [
      "common_admin_pressures",
      "relevant_risk_areas",
      "questions_to_explore",
      "common_objections",
      "potential_pathways",
    ],
  },
  {
    table: "engagement_personas",
    labelField: "persona_name",
    kind: "Persona",
    stringFields: [],
    arrayFields: [
      "goals",
      "pressures",
      "likely_concerns",
      "information_needed",
      "useful_questions",
      "language_to_avoid",
    ],
  },
  {
    table: "engagement_pain_points",
    labelField: "title",
    kind: "Pain point",
    stringFields: ["plain_english_definition", "explanation_to_prospect"],
    arrayFields: [
      "what_this_means",
      "natural_questions",
      "quick_improvements",
      "existing_tool_opps",
      "integration_opps",
      "possible_automation",
      "possible_ai",
      "human_va_responsibilities",
      "tasks_remain_human",
      "common_objections",
      "recommendation_pathways",
    ],
  },
  {
    table: "engagement_vat_prompts",
    labelField: "prompt",
    kind: "VAT prompt",
    stringFields: ["prompt"],
    arrayFields: [],
  },
  {
    table: "engagement_scripts",
    labelField: "title",
    kind: "Script / block",
    stringFields: ["title", "content"],
    arrayFields: [],
  },
  {
    table: "engagement_objections",
    labelField: "objection",
    kind: "Objection response",
    // The objection itself is what prospects say; only the response is ours.
    stringFields: ["response"],
    arrayFields: [],
  },
];

/* ---------------------------------------------------------------- */
/* Structured output schema per target                               */
/* ---------------------------------------------------------------- */

function schemaFor(target) {
  const properties = {
    no_change_needed: { type: "boolean" },
    change_summary: {
      type: "string",
      description:
        "One or two sentences on what changed and why, or why nothing needed to change.",
    },
  };
  for (const field of target.stringFields) {
    properties[field] = { type: "string" };
  }
  for (const field of target.arrayFields) {
    properties[field] = { type: "array", items: { type: "string" } };
  }
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

function pickFields(target, row) {
  const current = {};
  for (const field of [...target.stringFields, ...target.arrayFields]) {
    current[field] = row[field] ?? (target.arrayFields.includes(field) ? [] : "");
  }
  return current;
}

function normalise(value) {
  return JSON.stringify(value ?? null);
}

/* ---------------------------------------------------------------- */
/* Propose                                                           */
/* ---------------------------------------------------------------- */

async function propose() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  if (!ANTHROPIC_KEY) {
    console.error("Missing ANTHROPIC_API_KEY.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const proposals = [];
  const unchanged = [];
  const jobs = [];

  for (const target of TARGETS) {
    const { data, error } = await supabase.from(target.table).select("*");
    if (error) {
      console.error(`Failed to read ${target.table}: ${error.message}`);
      process.exit(1);
    }
    console.log(`${target.table}: ${data.length} entries`);
    for (const row of data) {
      jobs.push({ target, row });
    }
  }

  let done = 0;
  async function worker() {
    while (jobs.length > 0) {
      const { target, row } = jobs.shift();
      const label = String(row[target.labelField] ?? row.id).slice(0, 90);
      const current = pickFields(target, row);
      try {
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 6000,
          system: `${POSITIONING}\n\n${REWRITE_RULES}`,
          output_config: { format: { type: "json_schema", schema: schemaFor(target) } },
          messages: [
            {
              role: "user",
              content: `Record type: ${target.kind}\nRecord (current values):\n${JSON.stringify(
                { label, ...current },
                null,
                2,
              )}`,
            },
          ],
        });
        const text = response.content.find((b) => b.type === "text")?.text ?? "";
        const result = JSON.parse(text.slice(text.indexOf("{")));

        const updates = {};
        for (const field of [...target.stringFields, ...target.arrayFields]) {
          if (normalise(result[field]) !== normalise(current[field])) {
            updates[field] = result[field];
          }
        }
        if (Object.keys(updates).length === 0) {
          unchanged.push({ table: target.table, kind: target.kind, id: row.id, label });
        } else {
          proposals.push({
            table: target.table,
            kind: target.kind,
            id: row.id,
            label,
            change_summary: result.change_summary,
            current: Object.fromEntries(Object.keys(updates).map((f) => [f, current[f]])),
            updates,
          });
        }
      } catch (e) {
        console.error(`  FAILED ${target.table} "${label}": ${e.message}`);
      }
      done += 1;
      process.stdout.write(`\rReviewed ${done} entries…`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log("\n");

  fs.writeFileSync(
    PROPOSALS_JSON,
    JSON.stringify(
      proposals.map(({ current: _current, ...rest }) => rest),
      null,
      2,
    ),
  );

  const md = ["# Knowledge Hub rewrite proposals", ""];
  md.push(
    `Reviewed ${done} entries. ${proposals.length} have proposed changes; ${unchanged.length} already fit the positioning.`,
    "",
    `To apply: review below, delete any unwanted entries from ${PROPOSALS_JSON}, then run:`,
    "",
    "    node scripts/knowledge-hub-rewrite.mjs apply --yes",
    "",
  );
  let lastTable = "";
  for (const p of proposals) {
    if (p.table !== lastTable) {
      md.push(`## ${p.kind}s (${p.table})`, "");
      lastTable = p.table;
    }
    md.push(`### ${p.label}`, "", `_${p.change_summary}_`, "");
    for (const [field, newValue] of Object.entries(p.updates)) {
      md.push(`**${field}**`, "");
      md.push("Before:", "```", formatValue(p.current[field]), "```");
      md.push("After:", "```", formatValue(newValue), "```", "");
    }
  }
  if (unchanged.length > 0) {
    md.push("## No change needed", "");
    for (const u of unchanged) md.push(`- ${u.kind}: ${u.label}`);
    md.push("");
  }
  fs.writeFileSync(PROPOSALS_MD, md.join("\n"));

  console.log(`Wrote ${PROPOSALS_MD} (review this) and ${PROPOSALS_JSON} (the updates).`);
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map((v) => `- ${v}`).join("\n");
  return String(value ?? "");
}

/* ---------------------------------------------------------------- */
/* Apply                                                             */
/* ---------------------------------------------------------------- */

async function apply(confirmed) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  if (!fs.existsSync(PROPOSALS_JSON)) {
    console.error(`${PROPOSALS_JSON} not found. Run 'propose' first.`);
    process.exit(1);
  }
  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_JSON, "utf8"));
  console.log(`${proposals.length} entries queued for update.`);
  if (!confirmed) {
    console.log("Dry run. Re-run with --yes to write these updates to the database.");
    for (const p of proposals) {
      console.log(`- ${p.kind}: ${p.label} (${Object.keys(p.updates).join(", ")})`);
    }
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let ok = 0;
  for (const p of proposals) {
    const { error } = await supabase.from(p.table).update(p.updates).eq("id", p.id);
    if (error) {
      console.error(`FAILED ${p.kind} "${p.label}": ${error.message}`);
    } else {
      ok += 1;
      console.log(`Updated ${p.kind}: ${p.label}`);
    }
  }
  console.log(`\nDone. ${ok}/${proposals.length} entries updated.`);
}

/* ---------------------------------------------------------------- */

const mode = process.argv[2];
if (mode === "propose") {
  await propose();
} else if (mode === "apply") {
  await apply(process.argv.includes("--yes"));
} else {
  console.log("Usage: node scripts/knowledge-hub-rewrite.mjs <propose|apply [--yes]>");
  process.exit(1);
}
