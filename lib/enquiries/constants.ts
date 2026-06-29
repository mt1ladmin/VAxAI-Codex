import { PROSPECT_QUEUE_STATUSES, PROSPECT_QUEUE_STATUS_COLORS } from "@/lib/engagement/types";

export const ENQUIRY_DEFAULT_STATUS = "";

export const ENQUIRY_STATUSES = [
  { key: "all", label: "All" },
  ...PROSPECT_QUEUE_STATUSES.map((s) => ({ key: s, label: s })),
] as const;

export const ENQUIRY_STATUS_OPTIONS = PROSPECT_QUEUE_STATUSES.map((s) => ({ key: s, label: s }));

export const ENQUIRY_STATUS_COLORS: Record<string, string> = PROSPECT_QUEUE_STATUS_COLORS;

export function enquiryStatusLabel(status: string) {
  return status || ENQUIRY_DEFAULT_STATUS;
}