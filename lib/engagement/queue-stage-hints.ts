import { isClientServiceStage } from "@/lib/engagement/client-stages";
import type { OpportunityStage } from "@/lib/engagement/types";

const PRE_SALES_HINTS: Partial<Record<OpportunityStage, string>> = {
  Identified:
    "Confirm contact details, review source research, and set the first outreach task.",
  Researching: "Gather evidence on fit and pain points before first contact.",
  "Ready to contact": "Draft outreach using Knowledge Hub guidance and schedule the first touch.",
  Contacted: "Log the outcome, set follow-up date, and capture objections in notes.",
  "Response received": "Qualify the need and book discovery if there is genuine interest.",
  "Discovery booked": "Prepare sector notes and discovery questions before the call.",
  "Discovery completed": "Summarise findings and propose the next commercial step.",
  "Workflow review proposed": "Align internal scope before sending a formal proposal.",
  "Proposal sent": "Track decision timeline and plan a check-in before it goes cold.",
  "Decision pending": "Confirm blockers, update indicative value, and set a decision date.",
  Won: "Move to onboarding — confirm scope, fees, and delivery owner.",
  Nurture: "Set a nurture date and light-touch follow-up task.",
  Paused: "Record why paused and when to revisit.",
};

const DELIVERY_HINTS: Partial<Record<string, string>> = {
  "Onboarding planned": "Confirm contract, onboarding checklist, and kick-off date.",
  "Contract sent": "Chase signature and prepare onboarding materials.",
  "Invoices sent": "Confirm payment terms and onboarding start.",
  "Onboarding in progress": "Track onboarding tasks and first delivery milestones.",
  Onboarding: "Complete onboarding checklist and hand over to delivery rhythm.",
  "Active client": "Maintain cadence — review tasks, notes, and agreed outcomes.",
  Paused: "Document pause reason and agreed restart conditions.",
};

export function queueStageHint(stage: string): string {
  if (isClientServiceStage(stage)) {
    return DELIVERY_HINTS[stage] ?? "Track delivery tasks and keep notes up to date.";
  }
  return (
    PRE_SALES_HINTS[stage as OpportunityStage] ??
    "Update pipeline stage as engagement progresses and keep next action current."
  );
}

export function queueStageLabel(stage: string): string {
  return isClientServiceStage(stage) ? "Delivery stage" : "Pipeline stage";
}