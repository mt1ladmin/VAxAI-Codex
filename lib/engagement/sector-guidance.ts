import type { SectorProfile } from "@/lib/engagement/types";

const TAG_HINTS: Record<string, string[]> = {
  housing: ["housing", "homelessness"],
  homelessness: ["housing", "homelessness"],
  "mental health": ["mental health"],
  hospice: ["hospice", "health"],
  carers: ["carers", "care"],
  care: ["care", "domiciliary"],
  "domestic abuse": ["domestic abuse", "safeguarding"],
  legal: ["legal"],
  youth: ["youth", "children"],
  refugees: ["refugee", "asylum", "migration"],
  food: ["food"],
  disability: ["disability"],
  "learning disability": ["disability", "learning"],
  infrastructure: ["infrastructure", "voluntary"],
  accountancy: ["professional"],
  "care homes": ["care", "domiciliary"],
};

function tagMatchesSector(tag: string, sectorName: string): boolean {
  const t = tag.toLowerCase().trim();
  const n = sectorName.toLowerCase();
  if (!t || !n) return false;
  if (n.includes(t) || t.includes(n.split(" ")[0])) return true;
  const hints = TAG_HINTS[t] ?? [t];
  return hints.some((h) => n.includes(h));
}

export function matchSectorIds(
  sectorTags: string[],
  sectors: Pick<SectorProfile, "id" | "name">[],
): string[] {
  const ids = new Set<string>();
  for (const tag of sectorTags) {
    for (const sector of sectors) {
      if (tagMatchesSector(tag, sector.name)) ids.add(sector.id);
    }
  }
  return [...ids];
}

export function sectorGuidancePath(
  sectorTags: string[],
  sectors: Pick<SectorProfile, "id" | "name">[],
): string {
  const highlight = matchSectorIds(sectorTags, sectors);
  const params = new URLSearchParams({ tab: "sectors" });
  if (highlight.length) params.set("highlight", highlight.join(","));
  if (sectorTags.length) params.set("tags", sectorTags.join(","));
  return `/admin/engagement/knowledge?${params.toString()}`;
}