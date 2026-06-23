/**
 * VAxAI prospect-to-client journey stages and workflow helpers.
 *
 * Outreach → Prospect Queue → Prospect/Client (strategic delivery)
 */

export const JOURNEY_STAGES = [
  {
    id: "outreach",
    label: "Prospect outreach",
    description: "Review researched targets, verify fit, add notes, push to queue.",
    path: "/admin/engagement/prospect-outreach",
  },
  {
    id: "queue",
    label: "Prospect queue",
    description: "Make contact, book meetings, gauge interest, advance when there is a positive signal.",
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

/** Statuses indicating a warm lead ready to advance to Prospect/Client work */
export const ADVANCE_READY_STATUSES = [
  "Conversation held",
  "Follow-up required",
  "Opportunity",
] as const;

export function canAdvanceToClientWork(status: string): boolean {
  return (ADVANCE_READY_STATUSES as readonly string[]).includes(status);
}

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