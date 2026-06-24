/**
 * VAxAI prospect-to-client journey stages.
 *
 * Prospect Finder → Prospect Queue → Client Work
 */

export const PROSPECT_FINDER_LABEL = "Prospect Finder";
export const PROSPECT_QUEUE_LABEL = "Prospect Queue";
export const CLIENT_WORK_LABEL = "Client Work";

/** @deprecated Use PROSPECT_FINDER_LABEL */
export const PROSPECT_CATALOG_PAGE_LABEL = PROSPECT_FINDER_LABEL;

/** @deprecated Intermediary stage removed */
export const PROSPECT_WORKFLOW_PAGE_LABEL = PROSPECT_FINDER_LABEL;

export const JOURNEY_STAGES = [
  {
    id: "finder",
    label: PROSPECT_FINDER_LABEL,
    description: "Review researched targets, assign owners, and qualify fit before moving to the active pipeline.",
    path: "/admin/engagement/prospect-outreach",
  },
  {
    id: "queue",
    label: PROSPECT_QUEUE_LABEL,
    description: "Active opportunities the team is engaging — track stage, tasks, and readiness for client work.",
    path: "/admin/clients",
  },
  {
    id: "client",
    label: CLIENT_WORK_LABEL,
    description: "Strategic delivery — onboarding, proposals, and ongoing client services.",
    path: "/admin/client-work",
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
  "Set status to Opportunity when there is a confirmed sales opportunity (meeting held, interest confirmed, or proposal in progress). Advance to client work once you have agreement to proceed.";

export const PRE_SALES_SIGNAL_HINT =
  "Positive signal recorded — set status to Opportunity to open the pre-sales pipeline when ready.";

export function journeyStageForQueueStatus(status: string): JourneyStageId {
  if (status === "Closed") return "client";
  if (status === "Opportunity" || status === "In prospect queue") return "queue";
  return "finder";
}

export function journeyStageForEnquiryStatus(status: string): JourneyStageId {
  if (status === "Closed") return "client";
  if (status === "Opportunity") return "queue";
  return "finder";
}

export const ADVANCE_ACTION_LABEL = "Advance to client work";
export const ADVANCE_MODAL_TITLE = "Advance to client work";
export const ADVANCE_MODAL_SUBTITLE =
  "Create the client work record for strategic follow-up, proposals, and onboarding.";

export const MOVE_TO_PROSPECT_QUEUE_LABEL = "Move to Prospect Queue";