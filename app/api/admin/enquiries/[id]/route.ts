import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db
      .from("enquiries")
      .select("*, posts(id, title, slug)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const body = await req.json() as {
      status?: string;
      next_action?: string | null;
      next_action_date?: string | null;
      admin_notes?: string | null;
      last_action?: string | null;
      last_action_date?: string | null;
    };

    const updates: Record<string, string | null> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.next_action !== undefined) updates.next_action = body.next_action;
    if (body.next_action_date !== undefined) updates.next_action_date = body.next_action_date;
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.last_action !== undefined) updates.last_action = body.last_action;
    if (body.last_action_date !== undefined) updates.last_action_date = body.last_action_date;

    const db = createServiceClient();
    const { data, error } = await db
      .from("enquiries")
      .update(updates)
      .eq("id", id)
      .select("*, posts(id, title, slug)")
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();
    const { error } = await db.from("enquiries").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}