import { matchSectorIds } from "@/lib/engagement/sector-guidance";
import type { PainPoint, Persona, SectorProfile } from "@/lib/engagement/types";
import type { createServiceClient } from "@/lib/supabase";
import type { ServiceFitFields } from "./types";

type Supabase = ReturnType<typeof createServiceClient>;

export type HubContext = {
  sectors: Pick<SectorProfile, "name" | "starting_language" | "questions_to_explore" | "common_admin_pressures">[];
  painPoints: Pick<PainPoint, "title" | "quick_improvements" | "natural_questions" | "human_va_responsibilities">[];
  personas: Pick<Persona, "persona_name" | "useful_questions" | "language_to_avoid" | "likely_concerns">[];
};

function normTag(tag: string) {
  return tag.toLowerCase().trim();
}

function scoreByTags(text: string, tags: string[]): number {
  const lower = text.toLowerCase();
  return tags.reduce((n, tag) => (lower.includes(normTag(tag)) ? n + 1 : n), 0);
}

function uniqueLines(items: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
}

export async function loadHubContextForTags(
  supabase: Supabase,
  sectorTags: string[],
  painPointTags: string[],
  extraKeywords: string[] = [],
): Promise<HubContext> {
  const tags = [...new Set([...sectorTags, ...painPointTags, ...extraKeywords].map(normTag).filter((t) => t.length > 2))];
  if (!tags.length) {
    return { sectors: [], painPoints: [], personas: [] };
  }

  const [sectorsRes, painsRes, personasRes] = await Promise.all([
    supabase
      .from("engagement_sector_profiles")
      .select("id, name, starting_language, questions_to_explore, common_admin_pressures")
      .eq("status", "approved")
      .limit(40),
    supabase
      .from("engagement_pain_points")
      .select("title, quick_improvements, natural_questions, human_va_responsibilities, relevant_sectors")
      .eq("status", "approved")
      .limit(60),
    supabase
      .from("engagement_personas")
      .select("persona_name, useful_questions, language_to_avoid, likely_concerns")
      .eq("status", "approved")
      .limit(25),
  ]);

  const sectorIds = matchSectorIds(
    sectorTags,
    (sectorsRes.data ?? []).map((s) => ({ id: s.id as string, name: s.name as string })),
  );

  const sectors = (sectorsRes.data ?? [])
    .map((s) => {
      const text = `${s.name} ${(s.common_admin_pressures as string[] | null)?.join(" ") ?? ""}`;
      const idBoost = sectorIds.includes(s.id as string) ? 3 : 0;
      return { s, score: idBoost + scoreByTags(text, tags) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ s }) => ({
      name: s.name as string,
      starting_language: s.starting_language as string | null,
      questions_to_explore: s.questions_to_explore as string[] | null,
      common_admin_pressures: s.common_admin_pressures as string[] | null,
    }));

  const painPoints = (painsRes.data ?? [])
    .map((pp) => {
      const text = `${pp.title} ${(pp.relevant_sectors as string[] | null)?.join(" ") ?? ""}`;
      const tagHit = painPointTags.some((t) => normTag(pp.title as string).includes(normTag(t)));
      return { pp, score: (tagHit ? 3 : 0) + scoreByTags(text, tags) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ pp }) => ({
      title: pp.title as string,
      quick_improvements: pp.quick_improvements as string[] | null,
      natural_questions: pp.natural_questions as string[] | null,
      human_va_responsibilities: pp.human_va_responsibilities as string[] | null,
    }));

  const personas = (personasRes.data ?? [])
    .map((p) => {
      const text = `${p.persona_name} ${(p.likely_concerns as string[] | null)?.join(" ") ?? ""}`;
      return { p, score: scoreByTags(text, tags) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(({ p }) => ({
      persona_name: p.persona_name as string,
      useful_questions: p.useful_questions as string[] | null,
      language_to_avoid: p.language_to_avoid as string[] | null,
      likely_concerns: p.likely_concerns as string[] | null,
    }));

  return { sectors, painPoints, personas };
}

export function formatHubContextForPrompt(hub: HubContext): string {
  const lines: string[] = [];
  for (const s of hub.sectors) {
    const qs = s.questions_to_explore?.slice(0, 2).join("; ");
    lines.push(`Sector ${s.name}${qs ? ` — explore: ${qs}` : ""}`);
  }
  for (const pp of hub.painPoints) {
    const qi = pp.quick_improvements?.slice(0, 2).join("; ");
    lines.push(`Pain: ${pp.title}${qi ? ` — improvements: ${qi}` : ""}`);
  }
  for (const p of hub.personas) {
    const qs = p.useful_questions?.slice(0, 2).join("; ");
    lines.push(`Persona ${p.persona_name}${qs ? ` — questions: ${qs}` : ""}`);
  }
  return lines.join("\n");
}

export function enrichServiceFitWithHub(
  fit: ServiceFitFields & { need_score: number },
  hub: HubContext | null,
): ServiceFitFields & { need_score: number } {
  if (!hub || (!hub.sectors.length && !hub.painPoints.length && !hub.personas.length)) {
    return fit;
  }

  const hubQuestions = uniqueLines(
    [
      ...(hub.sectors.flatMap((s) => s.questions_to_explore ?? [])),
      ...(hub.painPoints.flatMap((pp) => pp.natural_questions ?? [])),
      ...(hub.personas.flatMap((p) => p.useful_questions ?? [])),
    ],
    4,
  );

  const open_questions = uniqueLines([...(fit.open_questions ?? []), ...hubQuestions], 5);

  const vaFromHub = hub.painPoints.flatMap((pp) => pp.human_va_responsibilities ?? []).slice(0, 2);
  const vaxai_direct_support = vaFromHub.length
    ? uniqueLines([...(fit.vaxai_direct_support ?? []), ...vaFromHub], 6)
    : fit.vaxai_direct_support;

  const sectorOpener = hub.sectors[0]?.starting_language?.trim();
  const recommended_engagement = sectorOpener
    ? `${sectorOpener} ${fit.recommended_engagement}`.slice(0, 600)
    : fit.recommended_engagement;

  return {
    ...fit,
    open_questions,
    vaxai_direct_support,
    recommended_engagement,
  };
}

export function buildEngagementApproachFromHub(
  existing: string | null | undefined,
  fit: Pick<ServiceFitFields, "recommended_engagement">,
  hub: HubContext | null,
): string {
  if (existing?.trim() && !existing.includes("Charity Commission register expansion batch")) {
    return existing.trim();
  }

  const parts: string[] = [];
  if (hub?.sectors[0]?.starting_language) {
    parts.push(hub.sectors[0].starting_language.trim());
  }
  if (hub?.personas[0]?.useful_questions?.length) {
    parts.push(`Ask: ${hub.personas[0].useful_questions.slice(0, 3).join("; ")}.`);
  }
  if (hub?.sectors[0]?.questions_to_explore?.length) {
    parts.push(`Confirm: ${hub.sectors[0].questions_to_explore.slice(0, 2).join("; ")}.`);
  }
  parts.push(fit.recommended_engagement);
  if (hub?.personas[0]?.language_to_avoid?.length) {
    parts.push(`Avoid: ${hub.personas[0].language_to_avoid.slice(0, 2).join(", ")}.`);
  }
  return parts.join(" ").slice(0, 900);
}

/** Web research is only worth the cost when the brief needs external verification. */
export function needsExternalResearch(brief: string): boolean {
  const b = brief.toLowerCase();
  return (
    /\b(verify|validate|find|search|lookup|website|contact|email|phone|latest|news|named|specific|charity number|company number|companies house|charity commission)\b/.test(
      b,
    ) || brief.length > 140
  );
}