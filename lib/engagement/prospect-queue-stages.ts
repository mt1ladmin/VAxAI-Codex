import { OPPORTUNITY_STAGES } from "@/lib/engagement/types";

/** Stages excluded from the unified Prospect Queue list (closed / parked). */
const EXCLUDED_STAGES = new Set(["Lost", "Not suitable"]);

/** All active engagement stages shown in Prospect Queue (pre-sales through delivery). */
export const PROSPECT_QUEUE_STAGES = OPPORTUNITY_STAGES.filter(
  (stage) => !EXCLUDED_STAGES.has(stage),
);

export function isProspectQueueStage(stage: string): boolean {
  return (PROSPECT_QUEUE_STAGES as readonly string[]).includes(stage);
}

/** Group labels for stage filters on the Prospect Queue list. */
export const PROSPECT_QUEUE_STAGE_GROUPS = [
  { value: "", label: "All in queue" },
  { value: "Identified", label: "Identified" },
  { value: "Ready to contact", label: "Ready to contact" },
  { value: "Contacted", label: "Contacted" },
  { value: "Discovery booked", label: "Discovery booked" },
  { value: "Proposal sent", label: "Proposal sent" },
  { value: "Decision pending", label: "Decision pending" },
  { value: "Won", label: "Won" },
  { value: "Onboarding planned", label: "Onboarding planned" },
  { value: "Onboarding in progress", label: "Onboarding" },
  { value: "Active client", label: "Active clients" },
] as const;