export type KnowledgeLinkIds = {
  sector_ids: string[];
  persona_ids: string[];
  pain_point_ids: string[];
};

export const EMPTY_KNOWLEDGE_LINKS: KnowledgeLinkIds = {
  sector_ids: [],
  persona_ids: [],
  pain_point_ids: [],
};

export type KnowledgeAttachmentRecord = KnowledgeLinkIds & {
  id: string;
  outreach_id: string | null;
  queue_id: string | null;
  enquiry_id: string | null;
  contact_id: string | null;
  updated_at: string;
};

export function hasKnowledgeLinks(links: KnowledgeLinkIds): boolean {
  return (
    links.sector_ids.length > 0 ||
    links.persona_ids.length > 0 ||
    links.pain_point_ids.length > 0
  );
}

export async function fetchKnowledgeAttachments(query: {
  outreachId?: string;
  queueId?: string;
  enquiryId?: string;
  contactId?: string;
}): Promise<KnowledgeAttachmentRecord | null> {
  const params = new URLSearchParams();
  if (query.outreachId) params.set("outreach_id", query.outreachId);
  if (query.queueId) params.set("queue_id", query.queueId);
  if (query.enquiryId) params.set("enquiry_id", query.enquiryId);
  if (query.contactId) params.set("contact_id", query.contactId);
  const res = await fetch(`/api/admin/engagement/knowledge-attachments?${params}`);
  if (!res.ok) return null;
  const j = (await res.json()) as { data: KnowledgeAttachmentRecord | null };
  return j.data ?? null;
}