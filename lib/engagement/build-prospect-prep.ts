import type { PainPoint, Persona, SectorProfile, VatPrompt } from "./types";

export type BuiltProspectPrep = {
  sector: SectorProfile | null;
  persona: Persona | null;
  relevantPains: PainPoint[];
  relevantVats: VatPrompt[];
  clientType: string;
  prepNotes: string;
  keywords: string[];
};

export function buildProspectPrepMatch(input: {
  clientType: string;
  prepNotes: string;
  sector: SectorProfile | null;
  persona: Persona | null;
  painPoints: PainPoint[];
  vatPrompts: VatPrompt[];
  knownPainPoints?: PainPoint[];
}): BuiltProspectPrep {
  const { clientType, prepNotes, sector, persona, painPoints, vatPrompts, knownPainPoints = [] } = input;
  const keywords = (clientType + " " + prepNotes)
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const knownIds = new Set(knownPainPoints.map((pp) => pp.id));
  const autoPains = painPoints
    .filter((pp) => {
      if (knownIds.has(pp.id)) return false;
      const text = [pp.title, pp.plain_english_definition, ...(pp.what_person_says || [])]
        .join(" ")
        .toLowerCase();
      const sectorMatch =
        sector &&
        pp.relevant_sectors &&
        pp.relevant_sectors.some((rs: string) =>
          rs.toLowerCase().includes(sector.name.toLowerCase()),
        );
      const keywordMatch = keywords.some((k) => text.includes(k));
      return sectorMatch || keywordMatch;
    })
    .slice(0, 5);
  const relevantPains = [...knownPainPoints, ...autoPains].slice(0, 8);

  const relevantVats = vatPrompts
    .filter((v) => {
      const text = [v.prompt, ...(v.context_tags || [])].join(" ").toLowerCase();
      const sectorMatch =
        sector &&
        v.context_tags &&
        v.context_tags.some((t: string) => t.toLowerCase().includes(sector.name.toLowerCase()));
      const keywordMatch = keywords.some((k) => text.includes(k));
      return sectorMatch || keywordMatch;
    })
    .slice(0, 5);

  return { sector, persona, relevantPains, relevantVats, clientType, prepNotes, keywords };
}