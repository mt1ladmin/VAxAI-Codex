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
