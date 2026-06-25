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

    if (pain_point_ids.length) {
      const { data } = await supabase
        .from("engagement_pain_points")
        .select("title, category, plain_english_definition")
        .in("id", pain_point_ids.slice(0, 4));
      for (const pp of data ?? []) {
        lines.push(
          `Pain: [${pp.category}] ${pp.title} — ${String(pp.plain_english_definition ?? "").slice(0, 120)}`,
        );
      }
    }

    if (sector_ids.length) {
      const { data } = await supabase
        .from("engagement_sector_profiles")
        .select("name, description")
        .in("id", sector_ids.slice(0, 2));
      for (const s of data ?? []) {
        lines.push(`Sector: ${s.name} — ${String(s.description ?? "").slice(0, 120)}`);
      }
    }

    if (persona_ids.length && NEEDS_PERSONAS.includes(opts.intent)) {
      const { data } = await supabase
        .from("engagement_personas")
        .select("persona_name, typical_role, likely_concerns")
        .in("id", persona_ids.slice(0, 2));
      for (const p of data ?? []) {
        const concerns = (p.likely_concerns as string[] | null)?.slice(0, 2).join("; ") ?? "";
        lines.push(`Persona: ${p.persona_name} (${p.typical_role ?? "—"}) — concerns: ${concerns}`);
      }
    }

    if (lines.length) return lines.join("\n");
  }

  if (lines.length === 0 && opts.keywords.length > 0) {
    const words = [...new Set(opts.keywords.map((w) => w.toLowerCase()).filter((w) => w.length > 3))].slice(
      0,
      12,
    );

    const { data: pains } = await supabase
      .from("engagement_pain_points")
      .select("title, category, plain_english_definition")
      .limit(40);

    const scored = (pains ?? [])
      .map((pp) => {
        const text = `${pp.title} ${pp.category} ${pp.plain_english_definition ?? ""}`.toLowerCase();
        const score = words.filter((w) => text.includes(w)).length;
        return { pp, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const { pp } of scored) {
      lines.push(
        `Pain: [${pp.category}] ${pp.title} — ${String(pp.plain_english_definition ?? "").slice(0, 100)}`,
      );
    }

    if (words.length > 0) {
      const { data: sectors } = await supabase
        .from("engagement_sector_profiles")
        .select("name, description")
        .limit(20);

      const topSector = (sectors ?? [])
        .map((s) => {
          const text = `${s.name} ${s.description ?? ""}`.toLowerCase();
          const score = words.filter((w) => text.includes(w)).length;
          return { s, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)[0];

      if (topSector) {
        lines.push(
          `Sector: ${topSector.s.name} — ${String(topSector.s.description ?? "").slice(0, 100)}`,
        );
      }
    }
  }

  return lines.length ? lines.join("\n") : null;
}