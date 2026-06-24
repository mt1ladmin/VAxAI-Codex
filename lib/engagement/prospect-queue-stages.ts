import { CLIENT_SERVICE_STAGES } from "@/lib/engagement/client-stages";
import { OPPORTUNITY_STAGES } from "@/lib/engagement/types";

const CLIENT_STAGE_SET = new Set<string>(CLIENT_SERVICE_STAGES);

/** Stages shown on the Prospect Queue pipeline page */
export const PROSPECT_QUEUE_STAGES = OPPORTUNITY_STAGES.filter(
  (stage) => !CLIENT_STAGE_SET.has(stage),
);

export function isProspectQueueStage(stage: string): boolean {
  return (PROSPECT_QUEUE_STAGES as readonly string[]).includes(stage);
}