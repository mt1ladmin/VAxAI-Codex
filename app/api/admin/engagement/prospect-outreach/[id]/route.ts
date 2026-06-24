import {
  getFinderRecord,
  loadOverrideMaps,
  loadTeamMembers,
} from "@/lib/engagement/prospect-finder/load-catalog";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const [overrideMaps, members] = await Promise.all([
    loadOverrideMaps(supabase),
    loadTeamMembers(supabase),
  ]);

  const record = getFinderRecord(id, overrideMaps.rows, overrideMaps.overrides, members);
  if (!record) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const { data: tasks } = await supabase
    .from("engagement_tasks")
    .select("*, organisation:organisation_id(id, name), contact:contact_id(id, first_name, last_name)")
    .eq("outreach_id", id)
    .order("due_date", { ascending: true });

  let opportunity = null;
  if (record.opportunity_id) {
    const { data } = await supabase
      .from("engagement_opportunities")
      .select("*")
      .eq("id", record.opportunity_id)
      .maybeSingle();
    opportunity = data;
  }

  return NextResponse.json({
    data: record,
    opportunity,
    tasks: tasks || [],
    team_members: members.filter((m) => m.is_active),
  });
}