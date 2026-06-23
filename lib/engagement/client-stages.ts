/** Stages used once a tentative agreement to offer services exists (client record). */
export const CLIENT_SERVICE_STAGES = [
  "Won",
  "Onboarding planned",
  "Contract sent",
  "Invoices sent",
  "Onboarding in progress",
  "Onboarding",
  "Active client",
  "Paused",
] as const;

export type ClientServiceStage = (typeof CLIENT_SERVICE_STAGES)[number];

export const CONVERTED_SOURCE_STATUS = "Closed";

export function isClientServiceStage(stage: string): boolean {
  return (CLIENT_SERVICE_STAGES as readonly string[]).includes(stage);
}