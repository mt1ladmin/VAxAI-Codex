import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET(req: NextRequest) {
  try {
    await assertAuth();
    const status = req.nextUrl.searchParams.get("status");
    const contactId = req.nextUrl.searchParams.get("contact_id");
    const db = createServiceClient();
    let query = db
      .from("enquiries")
      .select("*, posts(id, title, slug), organisation:organisation_id(id, name)")
      .order("created_at", { ascending: false });
    if (status === "needs_review") query = query.eq("status", "");
    else if (status && status !== "all") query = query.eq("status", status);
    if (contactId) query = query.eq("contact_id", contactId);

    const [enquiriesRes, tasksRes, membersRes] = await Promise.all([
      query,
      db
        .from("engagement_tasks")
        .select("enquiry_id, title")
        .eq("task_type", "follow_up")
        .neq("status", "done")
        .not("enquiry_id", "is", null)
        .order("due_date", { ascending: true, nullsFirst: false }),
      db.from("studio_team_members").select("id, display_name").eq("is_active", true),
    ]);

    if (enquiriesRes.error) throw enquiriesRes.error;

    const followUpTitles = new Map<string, string>();
    for (const t of tasksRes.data ?? []) {
      if (t.enquiry_id && !followUpTitles.has(t.enquiry_id as string)) {
        followUpTitles.set(t.enquiry_id as string, t.title as string);
      }
    }
    const memberNames = new Map<string, string>();
    for (const m of membersRes.data ?? []) {
      memberNames.set(m.id as string, m.display_name as string);
    }

    const data = (enquiriesRes.data ?? []).map((e) => ({
      ...e,
      follow_up_task_title: followUpTitles.get(e.id as string) ?? null,
      assigned_team_member_name: e.assigned_team_member_id
        ? (memberNames.get(e.assigned_team_member_id as string) ?? null)
        : null,
    }));

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAuth();
    const body = await req.json() as {
      name?: string;
      email?: string;
      support_type?: string;
      details?: string;
      preferred_contact?: string;
      telephone?: string | null;
      wants_discovery_call?: boolean;
      source?: string | null;
    };
    const { name, email, support_type, details, preferred_contact, telephone, wants_discovery_call, source } = body;
    if (!name?.trim() || !email?.trim() || !support_type?.trim() || !details?.trim()) {
      return NextResponse.json({ error: "name, email, support_type, and details are required" }, { status: 400 });
    }
    const db = createServiceClient();
    const { data, error } = await db
      .from("enquiries")
      .insert({
        name: name.trim(),
        email: email.trim(),
        support_type: support_type.trim(),
        details: details.trim(),
        preferred_contact: preferred_contact ?? "Email",
        telephone: telephone?.trim() || null,
        wants_discovery_call: wants_discovery_call === true,
        status: "",
        source: source?.trim() || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAuth();
    const { ids } = await req.json() as { ids: string[] };
    if (!ids?.length) return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    const db = createServiceClient();
    const { error } = await db.from("enquiries").delete().in("id", ids);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
