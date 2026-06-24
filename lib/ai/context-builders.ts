import {
  PROSPECT_CATALOG_PAGE_LABEL,
  PROSPECT_WORKFLOW_PAGE_LABEL,
} from "@/lib/engagement/journey";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { outreachFromQueueEntry } from "@/lib/engagement/prospect-outreach/queue-snapshot";
import type { ProspectQueueEntry, EngagementContact, EngagementOpportunity } from "@/lib/engagement/types";
import { canAdvanceToClientWork } from "@/lib/engagement/journey";

type EnquiryLike = {
  name: string;
  email: string;
  support_type: string;
  details: string;
  status: string;
  telephone?: string | null;
  wants_discovery_call?: boolean;
  admin_notes?: string | null;
  next_action?: string | null;
  last_action?: string | null;
};

export function buildEnquiryContextSummary(
  enquiry: EnquiryLike,
  opportunities?: EngagementOpportunity[],
): string {
  const preSales = opportunities?.find(
    (o) => !["Won", "Onboarding planned", "Onboarding", "Active client", "Lost", "Not suitable"].includes(o.stage),
  );

  return [
    `JOURNEY STAGE: Website enquiry (inbound qualification)`,
    `Status: ${enquiry.status}${enquiry.status === "Opportunity" ? " — pre-sales pipeline active" : ""}`,
    `Contact: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.telephone ? `Phone: ${enquiry.telephone}` : null,
    `Query type: ${enquiry.support_type}`,
    `Details: ${enquiry.details}`,
    enquiry.wants_discovery_call ? `Wants discovery call: yes` : null,
    preSales ? `Pre-sales opportunity: ${preSales.title} | Stage: ${preSales.stage}` : null,
    enquiry.next_action ? `Next action: ${enquiry.next_action}` : null,
    enquiry.last_action ? `Last action: ${enquiry.last_action}` : null,
    enquiry.admin_notes ? `Team notes:\n${enquiry.admin_notes}` : null,
    `YOUR FOCUS: Understand the inbound need, plan qualification and response, suggest pre-sales steps when interest is confirmed, and judge readiness to advance to Prospect/Client work. Use Knowledge Hub for sector-specific language.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOutreachContextSummary(
  record: ProspectOutreachRecord,
  reviewNotes?: string | null,
): string {
  return [
    `JOURNEY STAGE: ${PROSPECT_CATALOG_PAGE_LABEL} (review before outreach workflow)`,
    `Organisation: ${record.organisation_name} (${record.organisation_type})`,
    `Location: ${record.location}, ${record.region}`,
    `Decision maker: ${record.decision_maker_name || "—"} — ${record.decision_maker_role || "—"}`,
    record.email ? `Email: ${record.email}` : null,
    record.phone ? `Phone: ${record.phone}` : null,
    `Need score: ${record.need_score}/5 | Confidence: ${record.data_confidence}`,
    `Admin/AI need: ${record.need_rationale}`,
    record.engagement_approach ? `Approach: ${record.engagement_approach}` : null,
    record.sector_tags.length ? `Sector tags: ${record.sector_tags.join(", ")}` : null,
    record.pain_point_tags.length ? `Pain tags: ${record.pain_point_tags.join(", ")}` : null,
    reviewNotes ? `Reviewer notes: ${reviewNotes}` : null,
    `YOUR FOCUS: Help verify fit, suggest what to check, draft review notes, and assess readiness for ${PROSPECT_WORKFLOW_PAGE_LABEL.toLowerCase()}. Reference Knowledge Hub sectors/personas where relevant.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildProspectContextSummary(entry: ProspectQueueEntry): string {
  const outreach = outreachFromQueueEntry(entry);
  const advanceReady = canAdvanceToClientWork(entry.status);

  return [
    `JOURNEY STAGE: ${PROSPECT_WORKFLOW_PAGE_LABEL} (active outreach & conversion)`,
    `Status: ${entry.status}${advanceReady ? " — pre-sales active, ready to advance to client work when agreed" : ""}`,
    `Organisation: ${entry.raw_org_name || "—"}`,
    `Contact: ${entry.raw_contact_name || "—"}`,
    entry.raw_email ? `Email: ${entry.raw_email}` : null,
    entry.raw_phone ? `Phone: ${entry.raw_phone}` : null,
    entry.raw_industry ? `Industry: ${entry.raw_industry}` : null,
    entry.raw_location ? `Location: ${entry.raw_location}` : null,
    outreach?.need_rationale ? `Admin/AI need: ${outreach.need_rationale}` : null,
    outreach?.engagement_approach ? `Approach: ${outreach.engagement_approach}` : null,
    outreach?.sector_tags.length ? `Sectors: ${outreach.sector_tags.join(", ")}` : null,
    entry.next_action ? `Next action: ${entry.next_action}` : null,
    entry.last_action ? `Last action: ${entry.last_action}` : null,
    entry.raw_notes ? `Team notes:\n${entry.raw_notes}` : null,
    `YOUR FOCUS: Help with contact strategy, meeting prep, follow-ups, and identifying when to advance to Prospect/Client work. Use Knowledge Hub for sector-specific language.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildClientContextSummary(
  contact: EngagementContact,
  opportunities: EngagementOpportunity[],
  linkedQueue?: ProspectQueueEntry | null,
): string {
  const primary = opportunities[0];
  const outreach = linkedQueue ? outreachFromQueueEntry(linkedQueue) : null;

  return [
    `JOURNEY STAGE: Prospect/Client (strategic delivery & onboarding)`,
    `Contact: ${contact.first_name}${contact.last_name ? ` ${contact.last_name}` : ""}`,
    contact.role ? `Role: ${contact.role}` : null,
    contact.professional_email ? `Email: ${contact.professional_email}` : null,
    contact.organisation ? `Organisation: ${(contact.organisation as { name: string }).name}` : null,
    primary ? `Service: ${primary.title} | Stage: ${primary.stage}` : null,
    primary?.desired_outcomes ? `Desired outcomes: ${primary.desired_outcomes}` : null,
    primary?.recommended_pathway ? `Agreed pathway: ${primary.recommended_pathway}` : null,
    outreach?.need_rationale ? `Original admin/AI need: ${outreach.need_rationale}` : null,
    linkedQueue?.raw_notes ? `Pre-client notes:\n${linkedQueue.raw_notes}` : null,
    contact.notes ? `Client notes:\n${contact.notes}` : null,
    `YOUR FOCUS: Summarize the full journey, help with proposals and onboarding, connect to Knowledge Hub, and identify risks or upsell opportunities. Delivery happens offline once agreed.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Extract sector/pain keywords from a context summary for knowledge-base seeding */
export function extractKnowledgeKeywords(summary: string): string[] {
  const tags: string[] = [];
  const sectorMatch = summary.match(/Sector tags?: ([^\n]+)/i);
  const painMatch = summary.match(/Pain tags?: ([^\n]+)/i);
  const sectorsMatch = summary.match(/Sectors: ([^\n]+)/i);
  for (const block of [sectorMatch?.[1], painMatch?.[1], sectorsMatch?.[1]]) {
    if (block) tags.push(...block.split(/,\s*/).map((t) => t.trim().toLowerCase()));
  }
  return tags.filter(Boolean);
}