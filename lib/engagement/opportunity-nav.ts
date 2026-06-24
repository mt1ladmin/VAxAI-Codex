import { prospectQueueDetailPath } from "@/lib/engagement/journey";

export const DEFAULT_OPPORTUNITY_RETURN = "/admin/engagement/pipeline";

/** Only allow internal admin paths as return targets. */
export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_OPPORTUNITY_RETURN;
  if (!raw.startsWith("/admin/")) return DEFAULT_OPPORTUNITY_RETURN;
  return raw;
}

type OpportunityRecordContext = {
  enquiry_id?: string | null;
  outreach_id?: string | null;
  primary_contact_id?: string | null;
  contact_id?: string | null;
};

/**
 * @deprecated Opportunity detail pages were removed. Resolves to the parent enquiry or Prospect Queue record.
 */
export function opportunityDetailPath(
  _id: string,
  context?: OpportunityRecordContext,
): string {
  if (context?.enquiry_id) return `/admin/enquiries/${context.enquiry_id}?tab=overview`;
  const contactId = context?.primary_contact_id ?? context?.contact_id;
  if (contactId) return prospectQueueDetailPath(contactId, "overview");
  return DEFAULT_OPPORTUNITY_RETURN;
}

export function opportunityReturnLabel(
  returnTo: string | null | undefined,
  returnLabel: string | null | undefined,
): string {
  if (returnLabel) return returnLabel;
  const path = safeReturnTo(returnTo ?? null);
  if (path.includes("/admin/engagement/prospect-queue/")) return "Prospect Queue";
  if (path.includes("/admin/enquiries/")) return "Website enquiry";
  if (path.includes("/admin/engagement/pipeline")) return "Tasks Tracker";
  return "Back";
}