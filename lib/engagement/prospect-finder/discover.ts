import Anthropic from "@anthropic-ai/sdk";
import { HAIKU_MODEL, PROSPECT_DISCOVER_MAX_TOKENS } from "@/lib/ai/research-config";
import { createServiceClient } from "@/lib/supabase";
import { reassessProspectRecord } from "@/lib/engagement/service-fit/assess";
import {
  formatHubContextForPrompt,
  loadHubContextForTags,
  needsExternalResearch,
} from "@/lib/engagement/service-fit/knowledge-enrich";
import { STUDIO_SERVICE_POSITIONING } from "@/lib/engagement/service-fit/positioning";
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

async function loadExistingNames(supabase: ReturnType<typeof createServiceClient>): Promise<string[]> {
  const names = new Set<string>();

  const [{ data: orgs }, { data: catalogOrgs }] = await Promise.all([
    supabase.from("engagement_organisations").select("name").limit(300),
    supabase.from("prospect_outreach_catalog").select("organisation_name").limit(400),
  ]);

  for (const o of orgs ?? []) if (o.name) names.add(normName(o.name as string));
  for (const p of catalogOrgs ?? []) if (p.organisation_name) names.add(normName(p.organisation_name as string));

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
        ? "Similar organisation already in Prospect Outreach"
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
  const supabase = createServiceClient();
  const count = Math.min(Math.max(input.count ?? 1, 1), 3);

  const [existingNames, { data: sampleRecords }] = await Promise.all([
    loadExistingNames(supabase),
    supabase
      .from("prospect_outreach_catalog")
      .select("organisation_name, organisation_type, region, need_score, need_rationale")
      .order("need_score", { ascending: false })
      .limit(3),
  ]);

  const queueNames = existingNames.slice(0, 200);

  const sampleBrief = (sampleRecords ?? [])
    .map(
      (p) =>
        `${p.organisation_name as string} (${p.organisation_type as string}, ${p.region as string}, need ${p.need_score as number}): ${((p.need_rationale as string) || "").slice(0, 120)}`,
    )
    .join("\n");

  const supabase = createServiceClient();
  const briefKeywords = input.brief
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const hub = await loadHubContextForTags(
    supabase,
    [input.industry, input.orgType, input.region].filter(Boolean) as string[],
    [],
    briefKeywords,
  );
  const hubPrompt = formatHubContextForPrompt(hub);

  const webContext = needsExternalResearch(input.brief)
    ? await tavilySearch(
        [
          input.brief,
          input.region,
          input.industry,
          input.orgType,
          "UK charity OR small business admin automation",
        ]
          .filter(Boolean)
          .join(" "),
      )
    : "";

  const today = new Date().toISOString().slice(0, 10);
  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: PROSPECT_DISCOVER_MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: `You are a UK prospect researcher for VAxAI.

${STUDIO_SERVICE_POSITIONING}

METHODOLOGY (match existing catalog):
- Target charities and SMBs with admin burden, manual processes, or workflow friction — not greenfield system builds
- Score need 2-5 (5 = strong admin/ops pain where wraparound review, training, and virtual assistance could help)
- Prefer Norfolk, Suffolk, Cambridgeshire, Greater Manchester, Merseyside
- Use realistic UK data; mark confidence Low if inferred
- need_rationale must describe evidence of admin pressure, not generic AI hype
- engagement_approach should suggest realistic first contact — usually workflow review or discovery, not a platform pitch
- Align sector_tags and pain_point_tags with Knowledge Hub entries when provided
- Draw on web research only when supplied — otherwise use brief, catalog patterns, and Knowledge Hub
- NEVER return organisations from the exclusion list or duplicates

EXISTING ORGANISATIONS (do not repeat — ${existingNames.length} known names):
${existingNames.slice(0, 80).join(", ")}

SAMPLE CATALOG ENTRIES:
${sampleBrief}

${hubPrompt ? `KNOWLEDGE HUB (use for tags, rationale, and engagement approach):\n${hubPrompt}\n` : ""}
${webContext ? `WEB RESEARCH (verification only — prefer catalog patterns if thin):\n${webContext}\n` : ""}

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

  return Promise.all(
    prospects.map(async (p) => {
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

      const recordHub = await loadHubContextForTags(
        supabase,
        record.sector_tags,
        record.pain_point_tags,
      );
      const prospect = reassessProspectRecord(record, recordHub);
      const duplicates = findDuplicates(prospect, existingNames, queueNames);
      return {
        prospect,
        duplicates,
        isLikelyDuplicate: duplicates.some((d) => d.score >= 85),
      };
    }),
  );
}