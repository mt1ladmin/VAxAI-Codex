import { OpportunitySourceBadge } from "@/components/admin/OpportunitySourceBadge";
import type { EngagementOpportunity } from "@/lib/engagement/types";

export function OpportunityCreatedFrom({
  opportunity,
  contactName,
  organisationName,
}: {
  opportunity: EngagementOpportunity;
  contactName?: string | null;
  organisationName?: string | null;
}) {
  if (!opportunity.enquiry_id && !opportunity.queue_id) return null;

  const resolvedContact =
    contactName ??
    (opportunity.primary_contact
      ? `${opportunity.primary_contact.first_name} ${opportunity.primary_contact.last_name ?? ""}`.trim()
      : null);
  const resolvedOrg = organisationName ?? opportunity.organisation?.name ?? null;
  const nameLine = [resolvedContact, resolvedOrg].filter(Boolean).join(" · ");

  return (
    <div className="space-y-2">
      <OpportunitySourceBadge opportunity={opportunity} />
      {nameLine ? <p className="text-sm text-[#111111]">{nameLine}</p> : null}
    </div>
  );
}