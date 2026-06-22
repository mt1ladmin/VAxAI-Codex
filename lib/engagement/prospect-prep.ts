import type { PainPoint, Persona, SectorProfile, VatPrompt } from "./types";

export type ProspectPrepClient = {
  id: string;
  name: string;
  clientType: string;
  prepNotes: string;
  sector: SectorProfile | null;
  persona: Persona | null;
  relevantPains: PainPoint[];
  relevantVats: VatPrompt[];
  keywords: string[];
  createdAt: string;
  updatedAt?: string;
  enquiryId?: string | null;
  contactId?: string | null;
  organisationId?: string | null;
  queueId?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
};

export type ProspectPrepRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  client_type: string | null;
  prep_notes: string | null;
  sector_snapshot: SectorProfile | null;
  persona_snapshot: Persona | null;
  relevant_pains: PainPoint[];
  relevant_vats: VatPrompt[];
  keywords: string[] | null;
  content_fingerprint: string;
  enquiry_id?: string | null;
  contact_id?: string | null;
  organisation_id?: string | null;
  queue_id?: string | null;
  source_type?: string | null;
  source_label?: string | null;
};

export function prepFingerprint(prep: {
  clientType?: string;
  prepNotes?: string;
  sector?: { id?: string } | null;
  persona?: { id?: string } | null;
  relevantPains?: { id: string }[];
  relevantVats?: { id: string }[];
}): string {
  return JSON.stringify({
    clientType: (prep.clientType || "").trim().toLowerCase(),
    sectorId: prep.sector?.id || "",
    personaId: prep.persona?.id || "",
    prepNotes: (prep.prepNotes || "").trim().toLowerCase(),
    painIds: (prep.relevantPains || []).map((p) => p.id).sort(),
    vatIds: (prep.relevantVats || []).map((v) => v.id).sort(),
  });
}

export function rowToClient(row: ProspectPrepRow): ProspectPrepClient {
  return {
    id: row.id,
    name: row.name,
    clientType: row.client_type || "",
    prepNotes: row.prep_notes || "",
    sector: row.sector_snapshot,
    persona: row.persona_snapshot,
    relevantPains: row.relevant_pains || [],
    relevantVats: row.relevant_vats || [],
    keywords: row.keywords || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    enquiryId: row.enquiry_id,
    contactId: row.contact_id,
    organisationId: row.organisation_id,
    queueId: row.queue_id,
    sourceType: row.source_type,
    sourceLabel: row.source_label,
  };
}

export type ProspectPrepSource = {
  enquiryId?: string | null;
  contactId?: string | null;
  organisationId?: string | null;
  queueId?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
};

export function buildPrepInsertPayload(
  prep: {
    clientType: string;
    prepNotes: string;
    sector: SectorProfile | null;
    persona: Persona | null;
    relevantPains: PainPoint[];
    relevantVats: VatPrompt[];
    keywords: string[];
  },
  name: string,
  source?: ProspectPrepSource,
) {
  const content_fingerprint = prepFingerprint(prep);
  return {
    name: name.slice(0, 80),
    client_type: prep.clientType || null,
    prep_notes: prep.prepNotes || null,
    sector_snapshot: prep.sector,
    persona_snapshot: prep.persona,
    relevant_pains: prep.relevantPains,
    relevant_vats: prep.relevantVats,
    keywords: prep.keywords,
    content_fingerprint,
    enquiry_id: source?.enquiryId || null,
    contact_id: source?.contactId || null,
    organisation_id: source?.organisationId || null,
    queue_id: source?.queueId || null,
    source_type: source?.sourceType || null,
    source_label: source?.sourceLabel || null,
  };
}