import { PROSPECT_QUEUE_STATUSES, PROSPECT_QUEUE_STATUS_COLORS } from "@/lib/engagement/types";

export const ENQUIRY_DEFAULT_STATUS = "";

export const ENQUIRY_STATUSES = [
  { key: "all", label: "All" },
  { key: "needs_review", label: "Needs review" },
  ...PROSPECT_QUEUE_STATUSES.map((s) => ({ key: s, label: s })),
] as const;

export const ENQUIRY_STATUS_OPTIONS = PROSPECT_QUEUE_STATUSES.map((s) => ({ key: s, label: s }));

export const ENQUIRY_STATUS_COLORS: Record<string, string> = {
  ...PROSPECT_QUEUE_STATUS_COLORS,
  "": "bg-slate-100 text-slate-600",
  needs_review: "bg-slate-100 text-slate-600",
};

const KNOWN_STATUSES = new Set<string>(PROSPECT_QUEUE_STATUSES);

export function enquiryStatusLabel(status: string): string {
  if (!status || !KNOWN_STATUSES.has(status)) return "Needs review";
  return status;
}

export function isUnreviewedEnquiry(status: string): boolean {
  return !status || !KNOWN_STATUSES.has(status);
}