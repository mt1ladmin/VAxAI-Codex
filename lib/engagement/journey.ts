/**
 * VAxAI prospect journey — two stages only.
 *
 * Prospect Finder → Prospect Queue
 */

export const PROSPECT_FINDER_LABEL = "Prospect Finder";
export const PROSPECT_QUEUE_LABEL = "Prospect Queue";

/** @deprecated Use PROSPECT_QUEUE_LABEL — client work merged into Prospect Queue */
export const CLIENT_WORK_LABEL = PROSPECT_QUEUE_LABEL;

/** @deprecated Use PROSPECT_FINDER_LABEL */
export const PROSPECT_CATALOG_PAGE_LABEL = PROSPECT_FINDER_LABEL;

/** @deprecated Intermediary stage removed */
export const PROSPECT_WORKFLOW_PAGE_LABEL = PROSPECT_FINDER_LABEL;

export const PROSPECT_QUEUE_PATH = "/admin/engagement/prospect-queue";
export const PROSPECT_FINDER_PATH = "/admin/engagement/prospect-outreach";

export const JOURNEY_STAGES = [
  {
    id: "finder",
    label: PROSPECT_FINDER_LABEL,
    description: "Review researched targets, assign owners, and qualify fit before moving to active engagement.",
    path: PROSPECT_FINDER_PATH,
  },
  {
    id: "queue",
    label: PROSPECT_QUEUE_LABEL,
    description:
      "Active engagement — from first contact through opportunity, onboarding, and ongoing client delivery.",
    path: PROSPECT_QUEUE_PATH,
  },
] as const;

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];

export const PRE_SALES_SIGNAL_STATUSES = [
  "Conversation held",
  "Follow-up required",
] as const;

export const PRE_SALES_STATUS = "Opportunity" as const;

export const ADVANCE_READY_STATUSES = [PRE_SALES_STATUS] as const;

export function canAdvanceToClientWork(status: string): boolean {
  return status === PRE_SALES_STATUS;
}

export function canMoveToPreSales(status: string): boolean {
  return (PRE_SALES_SIGNAL_STATUSES as readonly string[]).includes(status);
}

export const ADVANCE_STATUS_HINT =
  "Set status to Opportunity when there is a confirmed sales opportunity, then move to Prospect Queue for active engagement.";

export const PRE_SALES_SIGNAL_HINT =
  "Positive signal recorded — set status to Opportunity, then move to Prospect Queue when ready.";

export function journeyStageForQueueStatus(status: string): JourneyStageId {
  if (status === "Closed") return "queue";
  if (status === "Opportunity" || status === "In prospect queue") return "queue";
  return "finder";
}

export function journeyStageForEnquiryStatus(status: string): JourneyStageId {
  if (status === "Closed") return "queue";
  if (status === "Opportunity") return "queue";
  return "finder";
}

/** @deprecated Client work is now Prospect Queue */
export const ADVANCE_ACTION_LABEL = "Move to Prospect Queue";
export const ADVANCE_MODAL_TITLE = "Move to Prospect Queue";
export const ADVANCE_MODAL_SUBTITLE =
  "Open the Prospect Queue record for active engagement, tasks, and follow-up.";

export const MOVE_TO_PROSPECT_QUEUE_LABEL = "Move to Prospect Queue";

export function prospectQueueDetailPath(contactId: string, tab?: string): string {
  const base = `${PROSPECT_QUEUE_PATH}/${contactId}`;
  return tab ? `${base}?tab=${tab}` : base;
}