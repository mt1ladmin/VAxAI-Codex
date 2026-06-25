import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import {
  isProspectQueueStage,
  PROSPECT_QUEUE_STAGES,
  stagesForQueueFilter,
} from "@/lib/engagement/prospect-queue-stages";

const QUEUE_STAGES = [...PROSPECT_QUEUE_STAGES];

export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { contact_id?: string };
  if (!body.contact_id) {
    return NextResponse.json({ error: "contact_id required" }, { status: 400 });
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("engagement_opportunities")
    .update({ stage: "Lost", updated_at: new Date().toISOString() })
    .eq("primary_contact_id", body.contact_id)
    .in("stage", QUEUE_STAGES);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") || "";

  const grouped = stagesForQueueFilter(stage);
  const stages =
    grouped ??
    (stage && isProspectQueueStage(stage) ? [stage] : QUEUE_STAGES);

  const { data: opps, error: oppError } = await supabase
    .from("engagement_opportunities")
    .select(
      "id, title, stage, indicative_value_low, indicative_value_high, notes, desired_outcomes, recommended_pathway, updated_at, created_at, primary_contact_id, outreach_id, assigned_team_member_id, next_action, assigned:assigned_team_member_id(id, display_name)",
    )
    .in("stage", stages)
    .not("primary_contact_id", "is", null)
    .order("updated_at", { ascending: false });

  if (oppError) return NextResponse.json({ error: oppError.message }, { status: 500 });

  if (!opps || opps.length === 0) {
    return NextResponse.json({
      data: [],
      metrics: {
        total: 0,
        totalTasks: 0,
        overdueTasks: 0,
        pipelineValueAll: { low: 0, high: 0, display: null },
        pipelineValueActive: { low: 0, high: 0, display: null },
      },
    });
  }

  const contactIds = [...new Set(opps.map((o) => o.primary_contact_id as string))];

  const { data: contacts, error: cError } = await supabase
    .from("engagement_contacts")
    .select(
      "id, first_name, last_name, role, professional_email, phone, updated_at, organisation:organisation_id(id, name, industry)",
    )
    .in("id", contactIds)
    .order("updated_at", { ascending: false });

  if (cError) return NextResponse.json({ error: cError.message }, { status: 500 });

  const oppMap: Record<string, typeof opps> = {};
  for (const opp of opps) {
    const cid = opp.primary_contact_id as string;
    if (!oppMap[cid]) oppMap[cid] = [];
    oppMap[cid].push(opp);
  }

  const enriched = (contacts || []).map((c) => ({
    ...c,
    client_opportunities: oppMap[c.id] || [],
    primary_stage: oppMap[c.id]?.[0]?.stage ?? "Identified",
    primary_service: oppMap[c.id]?.[0]?.title ?? null,
    primary_opp_id: oppMap[c.id]?.[0]?.id ?? null,
    primary_next_action: oppMap[c.id]?.[0]?.next_action ?? null,
    assigned_team_member: oppMap[c.id]?.[0]?.assigned ?? null,
    outreach_id: oppMap[c.id]?.[0]?.outreach_id ?? null,
  }));

  const filteredContactIds = enriched.map((c) => c.id);
  const today = new Date().toISOString().split("T")[0];

  let totalTasks = 0;
  let overdueTasks = 0;
  const overdueByContact = new Set<string>();

  if (filteredContactIds.length > 0) {
    const [tasksRes, overdueRes, overdueRows] = await Promise.all([
      supabase
        .from("engagement_tasks")
        .select("id", { count: "exact", head: true })
        .in("contact_id", filteredContactIds)
        .neq("status", "done"),
      supabase
        .from("engagement_tasks")
        .select("id", { count: "exact", head: true })
        .in("contact_id", filteredContactIds)
        .neq("status", "done")
        .not("due_date", "is", null)
        .lte("due_date", today),
      supabase
        .from("engagement_tasks")
        .select("contact_id")
        .in("contact_id", filteredContactIds)
        .neq("status", "done")
        .not("due_date", "is", null)
        .lte("due_date", today),
    ]);
    totalTasks = tasksRes.count ?? 0;
    overdueTasks = overdueRes.count ?? 0;
    for (const row of overdueRows.data ?? []) {
      if (row.contact_id) overdueByContact.add(row.contact_id as string);
    }
  }

  const enrichedWithOverdue = enriched.map((c) => ({
    ...c,
    has_overdue_tasks: overdueByContact.has(c.id),
  }));

  const fmtValue = (low: number, high: number): string | null => {
    if (low === 0 && high === 0) return null;
    const fmt = (n: number) =>
      n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n.toLocaleString()}`;
    if (low && high && low !== high) return `${fmt(low)} – ${fmt(high)}`;
    return fmt(low || high);
  };

  const sumRange = (rows: typeof opps) => {
    let low = 0;
    let high = 0;
    for (const o of rows) {
      low += o.indicative_value_low ?? o.indicative_value_high ?? 0;
      high += o.indicative_value_high ?? o.indicative_value_low ?? 0;
    }
    return { low, high, display: fmtValue(low, high) };
  };

  const activeStages = new Set([
    "Active client",
    "Onboarding in progress",
    "Onboarding",
    "Onboarding planned",
    "Won",
  ]);
  const primaryOpps = enrichedWithOverdue
    .map((c) => oppMap[c.id]?.[0])
    .filter((o): o is (typeof opps)[number] => Boolean(o));
  const activePrimaryOpps = primaryOpps.filter((o) => activeStages.has(o.stage));

  return NextResponse.json({
    data: enrichedWithOverdue,
    metrics: {
      total: enrichedWithOverdue.length,
      totalTasks,
      overdueTasks,
      pipelineValueAll: sumRange(opps),
      pipelineValueActive: sumRange(activePrimaryOpps),
    },
  });
}