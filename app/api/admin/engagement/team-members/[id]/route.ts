import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.display_name !== undefined) {
    const name = String(body.display_name).trim();
    if (!name) return NextResponse.json({ error: "display_name cannot be empty" }, { status: 400 });
    updates.display_name = name;
  }
  if (body.user_email !== undefined) updates.user_email = body.user_email?.trim() || null;
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);

  const { data, error } = await supabase
    .from("studio_team_members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}