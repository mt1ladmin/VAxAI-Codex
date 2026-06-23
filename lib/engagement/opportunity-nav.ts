export const DEFAULT_OPPORTUNITY_RETURN = "/admin/engagement/pipeline?tab=opportunities";

/** Only allow internal admin paths as return targets. */
export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_OPPORTUNITY_RETURN;
  if (!raw.startsWith("/admin/")) return DEFAULT_OPPORTUNITY_RETURN;
  return raw;
}

export function opportunityDetailPath(
  id: string,
  options?: { returnTo?: string; returnLabel?: string },
): string {
  const params = new URLSearchParams();
  const returnTo = options?.returnTo;
  if (returnTo) params.set("returnTo", returnTo);
  if (options?.returnLabel) params.set("returnLabel", options.returnLabel);
  const q = params.toString();
  return `/admin/engagement/pipeline/opportunities/${id}${q ? `?${q}` : ""}`;
}

export function opportunityReturnLabel(
  returnTo: string | null | undefined,
  returnLabel: string | null | undefined,
): string {
  if (returnLabel) return returnLabel;
  const path = safeReturnTo(returnTo ?? null);
  if (path.includes("/admin/clients/")) return "Client opportunities";
  if (path.includes("/admin/enquiries/")) return "Enquiry opportunities";
  if (path.includes("/admin/engagement/prospect-queue/")) return "Prospect opportunities";
  if (path.includes("tab=opportunities") || path.includes("/pipeline/opportunities")) {
    return "Opportunities";
  }
  return "Back";
}