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
    const includeClosed = req.nextUrl.searchParams.get("include_closed") === "true";
    const db = createServiceClient();
    let query = db
      .from("enquiries")
      .select("*, posts(id, title, slug), organisation:organisation_id(id, name)")
      .order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
    else if (!contactId && !includeClosed) query = query.neq("status", "Closed");
    if (contactId) query = query.eq("contact_id", contactId);
    const { data, error } = await query;
    if (error) throw error;
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
    };
    const { name, email, support_type, details, preferred_contact, telephone, wants_discovery_call } = body;
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
        status: "Needs review",
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
