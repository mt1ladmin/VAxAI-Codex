import Link from "next/link";
import type { MouseEvent } from "react";
import { Inbox, MessageSquare } from "lucide-react";
import type { EngagementOpportunity } from "@/lib/engagement/types";

export function OpportunitySourceBadge({
  opportunity,
  compact = false,
  onClick,
}: {
  opportunity: Pick<EngagementOpportunity, "enquiry_id" | "queue_id">;
  compact?: boolean;
  onClick?: (e: MouseEvent) => void;
}) {
  if (opportunity.enquiry_id) {
    return (
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
    );
  }

  if (opportunity.queue_id) {
    return (
      <Link
        href={`/admin/engagement/prospect-queue/${opportunity.queue_id}`}
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-full bg-violet-50 font-semibold text-violet-700 hover:bg-violet-100 ${
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <Inbox className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Prospect queue
      </Link>
    );
  }

  return null;
}