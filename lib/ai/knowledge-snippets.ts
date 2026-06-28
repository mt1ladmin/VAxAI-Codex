import type { ChatIntent } from "@/lib/ai/intent";
import type { KnowledgeLinkIds } from "@/lib/engagement/knowledge-links";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

const NEEDS_PERSONAS: ChatIntent[] = ["meeting_prep", "draft", "analysis"];

/** Outreach hub tabs — load Knowledge Hub only when the task needs it (cost control). */
export function shouldLoadKnowledgeSnippets(
  contextType: string,
  intent: ChatIntent,
  message: string,
): boolean {
  if (contextType !== "outreach") return true;

  if (["meeting_prep", "draft", "analysis"].includes(intent)) return true;

  return /\b(knowledge hub|sector|persona|pain point|support|engagement|research|approach|fit|verify|boundar|guide|prep|draft)\b/i.test(
    message,
  );
}

export async function loadKnowledgeSnippets(
  supabase: Supabase,
  opts: {
    keywords: string[];
    attached?: KnowledgeLinkIds | null;
    intent: ChatIntent;
  },
): Promise<string | null> {
  const lines: string[] = [];

  if (opts.attached) {
    const { sector_ids, persona_ids, pain_point_ids } = opts.attached;

    const queries: PromiseLike<void>[] = [];

    if (pain_point_ids.length) {
      queries.push(
        supabase
          .from("engagement_pain_points")
          .select("title, category, plain_english_definition")
          .in("id", pain_point_ids.slice(0, 4))
          .then(({ data }) => {
            for (const pp of data ?? []) {
              lines.push(
                `Pain: [${pp.category}] ${pp.title} — ${String(pp.plain_english_definition ?? "").slice(0, 120)}`,
              );
            }
          }),
      );
    }

    if (sector_ids.length) {
      queries.push(
        supabase
          .from("engagement_sector_profiles")
          .select("name, description")
          .in("id", sector_ids.slice(0, 2))
          .then(({ data }) => {
            for (const s of data ?? []) {
              lines.push(`Sector: ${s.name} — ${String(s.description ?? "").slice(0, 120)}`);
            }
          }),
      );
    }

    if (persona_ids.length && NEEDS_PERSONAS.includes(opts.intent)) {
      queries.push(
        supabase
          .from("engagement_personas")
          .select("persona_name, typical_role, likely_concerns")
          .in("id", persona_ids.slice(0, 2))
          .then(({ data }) => {
            for (const p of data ?? []) {
              const concerns = (p.likely_concerns as string[] | null)?.slice(0, 2).join("; ") ?? "";
              lines.push(`Persona: ${p.persona_name} (${p.typical_role ?? "—"}) — concerns: ${concerns}`);
            }
          }),
      );
    }

    await Promise.all(queries);
    if (lines.length) return lines.join("\n");
  }

  // Keyword-based fallback: filter at the DB level using ilike instead of loading all rows
  if (opts.keywords.length > 0) {
    const words = [...new Set(opts.keywords.map((w) => w.toLowerCase()).filter((w) => w.length > 3))].slice(0, 6);

    if (words.length === 0) return null;

    // Build OR filter: title ilike any keyword
    const painFilter = words.map((w) => `title.ilike.%${w}%`).join(",");
    const sectorFilter = words.map((w) => `name.ilike.%${w}%`).join(",");

    const [painRes, sectorRes] = await Promise.all([
      supabase
        .from("engagement_pain_points")
        .select("title, category, plain_english_definition")
        .or(painFilter)
        .limit(3),
      supabase
        .from("engagement_sector_profiles")
        .select("name, description")
        .or(sectorFilter)
        .limit(1),
    ]);

    for (const pp of painRes.data ?? []) {
      lines.push(
        `Pain: [${pp.category}] ${pp.title} — ${String(pp.plain_english_definition ?? "").slice(0, 100)}`,
      );
    }

    for (const s of sectorRes.data ?? []) {
      lines.push(`Sector: ${s.name} — ${String(s.description ?? "").slice(0, 100)}`);
    }
  }

  return lines.length ? lines.join("\n") : null;
}
