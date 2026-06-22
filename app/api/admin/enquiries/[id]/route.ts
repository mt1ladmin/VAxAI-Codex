import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import { PROSPECT_QUEUE_STATUSES } from "@/lib/engagement/types";

const VALID_STATUSES = new Set<string>(PROSPECT_QUEUE_STATUSES);

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
      contact_id?: string | null;
      organisation_id?: string | null;
      sector_snapshot?: Record<string, unknown> | null;
      persona_snapshot?: Record<string, unknown> | null;
    };

    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!VALID_STATUSES.has(body.status)) {
        return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
      }
      updates.status = body.status;
      updates.last_action = `Status changed to ${body.status}`;
      updates.last_action_date = new Date().toISOString();
    }
    if (body.next_action !== undefined) updates.next_action = body.next_action;
    if (body.next_action_date !== undefined) updates.next_action_date = body.next_action_date;
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.last_action !== undefined) updates.last_action = body.last_action;
    if (body.last_action_date !== undefined) updates.last_action_date = body.last_action_date;
    if (body.contact_id !== undefined) updates.contact_id = body.contact_id;
    if (body.organisation_id !== undefined) updates.organisation_id = body.organisation_id;
    if (body.sector_snapshot !== undefined) updates.sector_snapshot = body.sector_snapshot;
    if (body.persona_snapshot !== undefined) updates.persona_snapshot = body.persona_snapshot;

    const db = createServiceClient();
    const { data, error } = await db
      .from("enquiries")
      .update(updates)
      .eq("id", id)
      .select("*, posts(id, title, slug)")
      .single();
    if (error) {
      const hint = error.message.includes("last_action") || error.message.includes("next_action")
        ? "Run the Supabase migration supabase/migrations/20260622_enquiry_workflow_fields.sql"
        : error.message.includes("check constraint") || error.message.includes("violates check")
          ? "Run the Supabase migration supabase/migrations/20260626_enquiry_status_constraint_fix.sql"
          : undefined;
      return NextResponse.json({ error: error.message, hint }, { status: 500 });
    }
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