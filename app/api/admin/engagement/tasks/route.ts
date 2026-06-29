import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const org = searchParams.get("organisation_id") || "";
  const contact = searchParams.get("contact_id") || "";
  const opp = searchParams.get("opportunity_id") || "";
  const enquiryId = searchParams.get("enquiry_id") || "";
  const due = searchParams.get("due_today") === "true";
  const assignee = searchParams.get("assigned_team_member_id") || "";
  const myTasks = searchParams.get("my_tasks") === "true";
  const userEmail = searchParams.get("user_email") || "";
  const limit = parseInt(searchParams.get("limit") || "500");

  let assigneeId = assignee;
  if (myTasks && userEmail) {
    const { data: member } = await supabase
      .from("studio_team_members")
      .select("id")
      .ilike("user_email", userEmail)
      .maybeSingle();
    if (!member?.id) {
      const { data: byName } = await supabase
        .from("studio_team_members")
        .select("id")
        .ilike("display_name", userEmail.split("@")[0])
        .maybeSingle();
      assigneeId = byName?.id || "";
    } else {
      assigneeId = member.id;
    }
  }

  let query = supabase
    .from("engagement_tasks")
    .select(
      `*, organisation:organisation_id(id, name), contact:contact_id(id, first_name, last_name), opportunity:opportunity_id(id, title, stage, enquiry_id, outreach_id), assignee:assigned_team_member_id(id, display_name)`,
      { count: "exact" },
    )
    .order("due_date", { ascending: true })
    .limit(limit);

  if (status) query = query.eq("status", status);
  else query = query.neq("status", "done");
  if (priority) query = query.eq("priority", priority);
  if (org) query = query.eq("organisation_id", org);
  if (contact) query = query.eq("contact_id", contact);
  if (opp) query = query.eq("opportunity_id", opp);
  if (enquiryId) query = query.eq("enquiry_id", enquiryId);
  if (due) {
    const today = new Date().toISOString().split("T")[0];
    query = query.lte("due_date", today);
  }
  if (assigneeId) query = query.eq("assigned_team_member_id", assigneeId);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("engagement_tasks")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
