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

/** Compact stage filters grouped by journey phase. */
export const PROSPECT_QUEUE_STAGE_GROUPS = [
  { value: "", label: "All engagements" },
  { value: "__pre_sales__", label: "Pre-sales", stages: [
    "Identified", "Researching", "Ready to contact", "Contacted", "Response received",
    "Discovery booked", "Discovery completed", "Workflow review proposed", "Proposal sent", "Decision pending",
  ] },
  { value: "__closing__", label: "Closing", stages: ["Won", "Nurture", "Paused"] },
  { value: "__delivery__", label: "Delivery", stages: [
    "Onboarding planned", "Contract sent", "Invoices sent", "Onboarding in progress", "Onboarding", "Active client",
  ] },
] as const;

export type ProspectQueueStageFilter = (typeof PROSPECT_QUEUE_STAGE_GROUPS)[number]["value"];

export function stagesForQueueFilter(filter: string): string[] | null {
  if (!filter) return null;
  const group = PROSPECT_QUEUE_STAGE_GROUPS.find((g) => g.value === filter);
  if (!group || !("stages" in group)) return filter ? [filter] : null;
  return [...group.stages];
}