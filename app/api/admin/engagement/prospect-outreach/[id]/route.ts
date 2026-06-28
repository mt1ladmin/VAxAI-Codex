import {
  buildFinderWorkflow,
  priorityLabel,
  sectorLabel,
} from "@/lib/engagement/prospect-finder/workflow";
import { mergeProspectRecord } from "@/lib/engagement/prospect-outreach/snapshot";
import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import { loadTeamMembers } from "@/lib/engagement/prospect-finder/load-catalog";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch only what we need for this single prospect — no full catalog load
  const [catalogRes, overrideRes, members] = await Promise.all([
    supabase.from("prospect_outreach_catalog").select("*").eq("id", id).maybeSingle(),
    supabase.from("prospect_outreach_overrides").select("*").eq("outreach_id", id).maybeSingle(),
    loadTeamMembers(supabase),
  ]);

  if (!catalogRes.data) {
    console.error(`[prospect GET] not found: id=${id}, db_error=${catalogRes.error?.message ?? "no row"}`);
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const base = catalogRes.data as unknown as ProspectOutreachRecord;
  const overrideRow = overrideRes.data ?? undefined;
  const overrides = (overrideRow?.overrides as Record<string, unknown>) ?? {};

  const merged = mergeProspectRecord(base, overrides);
  const workflow = buildFinderWorkflow(overrideRow, members);

  const record = {
    ...merged,
    ...workflow,
    sector_label: sectorLabel(merged),
    priority_label: priorityLabel(merged.need_score),
    review_notes: overrideRow?.review_notes ?? null,
  };

  const [tasksRes, opportunityRes] = await Promise.all([
    supabase
      .from("engagement_tasks")
      .select("*, organisation:organisation_id(id, name), contact:contact_id(id, first_name, last_name)")
      .eq("outreach_id", id)
      .order("due_date", { ascending: true }),
    record.opportunity_id
      ? supabase.from("engagement_opportunities").select("*").eq("id", record.opportunity_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    data: record,
    opportunity: opportunityRes.data,
    tasks: tasksRes.data || [],
    team_members: members.filter((m) => m.is_active),
  });
}
