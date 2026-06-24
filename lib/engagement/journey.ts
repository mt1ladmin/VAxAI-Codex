/**
 * VAxAI prospect-to-client journey stages and workflow helpers.
 *
 * Prospect Queue (catalog) → Prospect Finder (workflow) → Prospect/Client
 */

/** Research catalog at /prospect-outreach */
export const PROSPECT_CATALOG_PAGE_LABEL = "Prospect Queue";
/** Active prospect workflow at /prospect-queue */
export const PROSPECT_WORKFLOW_PAGE_LABEL = "Prospect Finder";

export const JOURNEY_STAGES = [
  {
    id: "outreach",
    label: PROSPECT_CATALOG_PAGE_LABEL,
    description: "Review researched targets, verify fit, add notes, push to Prospect Finder.",
    path: "/admin/engagement/prospect-outreach",
  },
  {
    id: "queue",
    label: PROSPECT_WORKFLOW_PAGE_LABEL,
    description: "Find, add, and work prospects — make contact, book meetings, and advance when there is a positive signal.",
    path: "/admin/engagement/prospect-queue",
  },
  {
    id: "pre_sales",
    label: "Pre-sales pipeline",
    description: "Discovery, proposals, and decision — track the opportunity before client onboarding.",
    path: "/admin/engagement/pipeline",
  },
  {
    id: "client",
    label: "Prospect/Client",
    description: "Strategic work — proposals, onboarding, delivery planning. Work continues offline once agreed.",
    path: "/admin/clients",
  },
] as const;

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];

/** Positive signals during outreach — move to Opportunity to open pre-sales */
export const PRE_SALES_SIGNAL_STATUSES = [
  "Conversation held",
  "Follow-up required",
] as const;

/** Queue/enquiry status that opens the pre-sales pipeline */
export const PRE_SALES_STATUS = "Opportunity" as const;

/** Only advance to Prospect/Client work once pre-sales is active */
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
  if (status === "Opportunity") return "pre_sales";
  return "queue";
}

export function journeyStageForEnquiryStatus(status: string): JourneyStageId {
  if (status === "Closed") return "client";
  if (status === "Opportunity") return "pre_sales";
  return "queue";
}

export const ADVANCE_ACTION_LABEL = "Advance to client work";
export const ADVANCE_MODAL_TITLE = "Advance to client work";
export const ADVANCE_MODAL_SUBTITLE =
  "Create the Prospect/Client record for strategic follow-up, proposals, and onboarding.";