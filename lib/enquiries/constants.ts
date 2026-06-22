export const ENQUIRY_STATUSES = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "no_reply", label: "No reply" },
  { key: "following_up", label: "Following up" },
  { key: "met", label: "Met" },
  { key: "completed", label: "Completed" },
] as const;

export const ENQUIRY_STATUS_OPTIONS = ENQUIRY_STATUSES.filter((s) => s.key !== "all");

export const ENQUIRY_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  no_reply: "bg-amber-100 text-amber-700",
  following_up: "bg-yellow-100 text-yellow-800",
  met: "bg-teal-100 text-teal-700",
  completed: "bg-[#063b32]/10 text-[#063b32]",
};

export function enquiryStatusLabel(status: string) {
  return ENQUIRY_STATUSES.find((x) => x.key === status)?.label ?? status;
}