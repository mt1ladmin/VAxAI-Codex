import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

import { CLIENT_SERVICE_STAGES, isClientServiceStage } from "@/lib/engagement/client-stages";

const CLIENT_STAGES = [...CLIENT_SERVICE_STAGES];

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") || "";

  const stages = stage && isClientServiceStage(stage) ? [stage] : CLIENT_STAGES;

  // Find all opportunities in client stages
  const { data: opps, error: oppError } = await supabase
    .from("engagement_opportunities")
    .select(
      "id, title, stage, indicative_value_low, indicative_value_high, notes, desired_outcomes, recommended_pathway, updated_at, created_at, primary_contact_id"
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
      "id, first_name, last_name, role, professional_email, phone, updated_at, organisation:organisation_id(id, name, industry)"
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
    primary_stage: oppMap[c.id]?.[0]?.stage ?? "Won",
    primary_service: oppMap[c.id]?.[0]?.title ?? null,
    primary_opp_id: oppMap[c.id]?.[0]?.id ?? null,
  }));

  const filteredContactIds = enriched.map((c) => c.id);
  const today = new Date().toISOString().split("T")[0];

  let totalTasks = 0;
  let overdueTasks = 0;

  if (filteredContactIds.length > 0) {
    const [tasksRes, overdueRes] = await Promise.all([
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
    ]);
    totalTasks = tasksRes.count ?? 0;
    overdueTasks = overdueRes.count ?? 0;
  }

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

  const activeStages = new Set(["Active client", "Onboarding in progress", "Onboarding", "Onboarding planned"]);
  const primaryOpps = enriched
    .map((c) => oppMap[c.id]?.[0])
    .filter((o): o is (typeof opps)[number] => Boolean(o));
  const activePrimaryOpps = primaryOpps.filter((o) => activeStages.has(o.stage));

  return NextResponse.json({
    data: enriched,
    metrics: {
      total: enriched.length,
      totalTasks,
      overdueTasks,
      pipelineValueAll: sumRange(opps),
      pipelineValueActive: sumRange(activePrimaryOpps),
    },
  });
}
