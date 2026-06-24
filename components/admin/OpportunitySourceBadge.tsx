import Link from "next/link";
import { PROSPECT_WORKFLOW_PAGE_LABEL } from "@/lib/engagement/journey";
import type { MouseEvent } from "react";
import { Inbox, MessageSquare } from "lucide-react";
import type { EngagementOpportunity } from "@/lib/engagement/types";

export function formatOpportunityPartyNames(
  opportunity: Pick<EngagementOpportunity, "organisation" | "primary_contact">,
): { contactName: string | null; organisationName: string | null } {
  const contactName = opportunity.primary_contact
    ? `${opportunity.primary_contact.first_name} ${opportunity.primary_contact.last_name ?? ""}`.trim()
    : null;
  const organisationName = opportunity.organisation?.name ?? null;
  return { contactName: contactName || null, organisationName };
}

export function OpportunitySourceBadge({
  opportunity,
  compact = false,
  onClick,
  contactName,
  organisationName,
  showNames = false,
}: {
  opportunity: Pick<EngagementOpportunity, "enquiry_id" | "queue_id" | "organisation" | "primary_contact">;
  compact?: boolean;
  onClick?: (e: MouseEvent) => void;
  contactName?: string | null;
  organisationName?: string | null;
  showNames?: boolean;
}) {
  const derived = formatOpportunityPartyNames(opportunity);
  const resolvedContact = contactName ?? derived.contactName;
  const resolvedOrg = organisationName ?? derived.organisationName;
  const partyLine = [resolvedContact, resolvedOrg].filter(Boolean).join(" · ");

  const badge = opportunity.enquiry_id ? (
    <Link
      href={`/admin/enquiries/${opportunity.enquiry_id}`}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <MessageSquare className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Website enquiry
    </Link>
  ) : opportunity.queue_id ? (
    <Link
      href={`/admin/engagement/prospect-queue/${opportunity.queue_id}`}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full bg-violet-50 font-semibold text-violet-700 hover:bg-violet-100 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <Inbox className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {PROSPECT_WORKFLOW_PAGE_LABEL}
    </Link>
  ) : null;

  if (!badge) return null;

  if (!showNames || !partyLine) return badge;

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      {badge}
      <p className={`text-[#6f6b62] ${compact ? "text-[10px] leading-snug" : "text-sm"}`}>{partyLine}</p>
    </div>
  );
}