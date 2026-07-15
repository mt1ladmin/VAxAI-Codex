import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import {
  isVaApplicationStatus,
  type VaApplicationStatus,
} from "@/lib/va-applications/constants";

async function assertAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db.from("va_applications").select("*").eq("id", id).single();
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
    const body = (await req.json()) as {
      status?: string;
      admin_notes?: string | null;
      photo_url?: string | null;
      availability_hours_per_week?: string | null;
      availability_notes?: string | null;
      last_action?: string | null;
      profile_extras?: Record<string, unknown> | null;
      specialisms?: string[];
    };

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      if (!isVaApplicationStatus(body.status)) {
        return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
      }
      updates.status = body.status as VaApplicationStatus;
      updates.last_action = `Status changed to ${body.status}`;
      updates.last_action_date = new Date().toISOString();
    }
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.photo_url !== undefined) updates.photo_url = body.photo_url;
    if (body.availability_hours_per_week !== undefined) {
      updates.availability_hours_per_week = body.availability_hours_per_week;
    }
    if (body.availability_notes !== undefined) updates.availability_notes = body.availability_notes;
    if (body.last_action !== undefined) {
      updates.last_action = body.last_action;
      updates.last_action_date = new Date().toISOString();
    }
    if (body.profile_extras !== undefined) updates.profile_extras = body.profile_extras ?? {};
    if (body.specialisms !== undefined) updates.specialisms = body.specialisms;

    const db = createServiceClient();
    const { data, error } = await db
      .from("va_applications")
      .update(updates)
      .eq("id", id)
      .select("*")
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
    const { data: row } = await db.from("va_applications").select("cv_path").eq("id", id).single();
    const { error } = await db.from("va_applications").delete().eq("id", id);
    if (error) throw error;
    if (row?.cv_path) {
      await db.storage.from("vaxai-studio").remove([row.cv_path as string]).catch(() => undefined);
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
