import { logActivity } from "@/lib/engagement/activity-log";
import { CLIENT_SERVICE_STAGES } from "@/lib/engagement/client-stages";
import type { EngagementOpportunity, OpportunityStage } from "@/lib/engagement/types";
import type { createServiceClient } from "@/lib/supabase";

type ServiceClient = ReturnType<typeof createServiceClient>;

export const PRE_SALES_ENTRY_STAGE: Record<"outreach" | "enquiry", OpportunityStage> = {
  outreach: "Discovery booked",
  enquiry: "Response received",
};

const CLOSED_STAGES = new Set<string>(["Lost", "Not suitable", ...CLIENT_SERVICE_STAGES]);

/** Pipeline stages before a client service record exists */
export function isPreSalesStage(stage: string): boolean {
  return !CLOSED_STAGES.has(stage);
}

export async function ensurePreSalesOpportunity(
  supabase: ServiceClient,
  opts: {
    source: "outreach" | "enquiry";
    sourceId: string;
    title: string;
    notes?: string | null;
    desiredOutcomes?: string | null;
    organisationId?: string | null;
    contactId?: string | null;
    nextAction?: string | null;
  },
): Promise<{ data: EngagementOpportunity | null; created: boolean }> {
  const linkCol = opts.source === "outreach" ? "outreach_id" : "enquiry_id";

  const { data: existing } = await supabase
    .from("engagement_opportunities")
    .select("*")
    .eq(linkCol, opts.sourceId)
    .order("updated_at", { ascending: false });

  const preSales = (existing ?? []).find((o) => isPreSalesStage(o.stage as string));
  if (preSales) {
    return { data: preSales as EngagementOpportunity, created: false };
  }

  const stage = PRE_SALES_ENTRY_STAGE[opts.source];
  const insertPayload: Record<string, unknown> = {
    title: opts.title.slice(0, 120),
    stage,
    notes: opts.notes ?? null,
    desired_outcomes: opts.desiredOutcomes ?? null,
    organisation_id: opts.organisationId ?? null,
    primary_contact_id: opts.contactId ?? null,
    next_action: opts.nextAction ?? null,
    [linkCol]: opts.sourceId,
  };

  const { data, error } = await supabase
    .from("engagement_opportunities")
    .insert(insertPayload)
    .select()
    .single();

  if (error || !data) {
    console.error("pre-sales opportunity failed:", error?.message);
    return { data: null, created: false };
  }

  await logActivity(supabase, {
    event_type: "opportunity_created",
    title: "Pre-sales pipeline opened",
    detail: `Stage: ${stage}`,
    opportunity_id: data.id,
    outreach_id: opts.source === "outreach" ? opts.sourceId : null,
    enquiry_id: opts.source === "enquiry" ? opts.sourceId : null,
    contact_id: opts.contactId ?? null,
    metadata: { auto_created: true, stage },
  });

  return { data: data as EngagementOpportunity, created: true };
}