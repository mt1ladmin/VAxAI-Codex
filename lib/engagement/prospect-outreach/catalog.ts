import type { ProspectOutreachCatalog } from "./types";
import catalogJson from "./catalog.json";

export const prospectOutreachCatalog = catalogJson as ProspectOutreachCatalog;

export function getProspectById(id: string) {
  return prospectOutreachCatalog.prospects.find((p) => p.id === id);
}