import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { prospectOutreachCatalog } from "@/lib/engagement/prospect-outreach/catalog";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { OUTREACH_REGIONS } from "@/lib/engagement/prospect-outreach/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ProspectFinderRequest = {
  brief: string;
  region?: string;
  orgType?: string;
  industry?: string;
  count?: number;
};

export type ProspectFinderDuplicate = {
  source: "queue" | "catalog" | "crm";
  name: string;
  reason: string;
  score: number;
};

export type ProspectFinderResult = {
  prospect: ProspectOutreachRecord;
  duplicates: ProspectFinderDuplicate[];
  isLikelyDuplicate: boolean;
};

function normName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(ltd|limited|the|charity|cic)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadExistingNames(): Promise<string[]> {
  const supabase = createServiceClient();
  const names = new Set<string>();

  const { data: queueRows } = await supabase
    .from("prospect_queue")
    .select("raw_org_name, organisation:organisation_id(name)")
    .limit(500);

  for (const row of queueRows ?? []) {
    const org = row.raw_org_name || (row.organisation as { name?: string } | null)?.name;
    if (org) names.add(normName(org));
  }

  const { data: orgs } = await supabase
    .from("engagement_organisations")
    .select("name")
    .limit(300);
  for (const o of orgs ?? []) {
    if (o.name) names.add(normName(o.name));
  }

  for (const p of prospectOutreachCatalog.prospects.slice(0, 400)) {
    names.add(normName(p.organisation_name));
  }

  return [...names];
}

async function tavilySearch(query: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return "";

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
      }),
    });
    if (!res.ok) return "";
    const json = (await res.json()) as {
      answer?: string;
      results?: Array<{ title: string; url: string; content: string }>;
    };
    const snippets = (json.results ?? [])
      .map((r) => `- ${r.title} (${r.url}): ${r.content?.slice(0, 280)}`)
      .join("\n");
    return [json.answer, snippets].filter(Boolean).join("\n\n");
  } catch {
    return "";
  }
}

function findDuplicates(
  prospect: ProspectOutreachRecord,
  existingNames: string[],
  queueNames: string[],
): ProspectFinderDuplicate[] {
  const target = normName(prospect.organisation_name);
  const hits: ProspectFinderDuplicate[] = [];

  for (const name of existingNames) {
    if (!name || name.length < 3) continue;
    const overlap =
      target.includes(name) ||
      name.includes(target) ||
      target.split(" ").filter((w) => w.length > 3 && name.includes(w)).length >= 2;
    if (!overlap) continue;

    const inQueue = queueNames.some((q) => q === name || q.includes(name) || name.includes(q));
    hits.push({
      source: inQueue ? "queue" : "catalog",
      name,
      reason: inQueue
        ? "Similar organisation already in Prospect Finder"
        : "Similar name in researched catalog or CRM",
      score: target === name ? 95 : 70,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 3);
}

const RECORD_SCHEMA = `{
  "organisation_name": string,
  "organisation_type": "Charity" | "Business" | "Social enterprise" | "Other",
  "location": string,
  "region": one of ${JSON.stringify(OUTREACH_REGIONS)},
  "website": string,
  "employees": number | null,
  "annual_revenue_gbp": number | null,
  "revenue_basis": string,
  "need_score": 2-5,
  "need_rationale": string,
  "decision_maker_name": string,
  "decision_maker_role": string,
  "email": string,
  "phone": string,
  "financial_source_url": string,
  "contact_source_url": string,
  "data_confidence": "High" | "Medium" | "Low",
  "sector_tags": string[],
  "pain_point_tags": string[],
  "engagement_approach": string,
  "research_date": "YYYY-MM-DD",
  "priority_region": "primary" | "secondary" | "deprioritized"
}`;

export async function discoverProspects(
  input: ProspectFinderRequest,
): Promise<ProspectFinderResult[]> {
  const count = Math.min(Math.max(input.count ?? 1, 1), 3);
  const existingNames = await loadExistingNames();
  const queueNames = existingNames.slice(0, 200);

  const sampleBrief = prospectOutreachCatalog.prospects
    .slice(0, 3)
    .map(
      (p) =>
        `${p.organisation_name} (${p.organisation_type}, ${p.region}, need ${p.need_score}): ${p.need_rationale.slice(0, 120)}`,
    )
    .join("\n");

  const searchQuery = [
    input.brief,
    input.region,
    input.industry,
    input.orgType,
    "UK charity OR small business admin automation",
  ]
    .filter(Boolean)
    .join(" ");
  const webContext = await tavilySearch(searchQuery);

  const today = new Date().toISOString().slice(0, 10);
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a UK prospect researcher for VAxAI (virtual admin / AI training for charities and SMBs).

METHODOLOGY (match existing catalog):
- Target charities and SMBs with admin burden, manual processes, or growth friction
- Score need 2-5 (5 = urgent admin/ops pain, strong fit for VAxAI)
- Prefer Norfolk, Suffolk, Cambridgeshire, Greater Manchester, Merseyside
- Use realistic UK data; mark confidence Low if inferred
- NEVER return organisations from the exclusion list or duplicates

EXISTING ORGANISATIONS (do not repeat — ${existingNames.length} known names):
${existingNames.slice(0, 80).join(", ")}

SAMPLE CATALOG ENTRIES:
${sampleBrief}

${webContext ? `WEB RESEARCH:\n${webContext}\n` : ""}

USER BRIEF: ${input.brief}
REGION PREFERENCE: ${input.region || "any priority region"}
ORG TYPE: ${input.orgType || "Charity or Business"}
INDUSTRY/SECTOR: ${input.industry || "any"}

Return JSON only: { "prospects": [ ${RECORD_SCHEMA} ] }
Generate exactly ${count} distinct, realistic NEW prospects not matching existing names.
Use research_date "${today}". Generate stable id as slug from org name (lowercase, hyphens).`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  const parsed = JSON.parse(jsonMatch[0]) as { prospects?: Array<Record<string, unknown>> };
  const prospects = (parsed.prospects ?? []).slice(0, count);

  return prospects.map((p) => {
    const record = {
      id: String(p.id ?? p.organisation_name ?? "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      organisation_name: String(p.organisation_name ?? ""),
      organisation_type: (p.organisation_type as ProspectOutreachRecord["organisation_type"]) ?? "Business",
      location: String(p.location ?? ""),
      region: String(p.region ?? input.region ?? "East of England (other)"),
      website: String(p.website ?? ""),
      employees: typeof p.employees === "number" ? p.employees : null,
      annual_revenue_gbp: typeof p.annual_revenue_gbp === "number" ? p.annual_revenue_gbp : null,
      revenue_basis: String(p.revenue_basis ?? ""),
      need_score: Math.min(5, Math.max(2, Number(p.need_score) || 3)),
      need_rationale: String(p.need_rationale ?? ""),
      decision_maker_name: String(p.decision_maker_name ?? ""),
      decision_maker_role: String(p.decision_maker_role ?? ""),
      email: String(p.email ?? ""),
      phone: String(p.phone ?? ""),
      financial_source_url: String(p.financial_source_url ?? ""),
      contact_source_url: String(p.contact_source_url ?? ""),
      data_confidence: (p.data_confidence as ProspectOutreachRecord["data_confidence"]) ?? "Medium",
      sector_tags: Array.isArray(p.sector_tags) ? (p.sector_tags as string[]) : [],
      pain_point_tags: Array.isArray(p.pain_point_tags) ? (p.pain_point_tags as string[]) : [],
      engagement_approach: String(p.engagement_approach ?? ""),
      research_date: String(p.research_date ?? today),
      priority_region: (p.priority_region as ProspectOutreachRecord["priority_region"]) ?? "primary",
    } satisfies ProspectOutreachRecord;

    const duplicates = findDuplicates(record, existingNames, queueNames);
    return {
      prospect: record,
      duplicates,
      isLikelyDuplicate: duplicates.some((d) => d.score >= 85),
    };
  });
}