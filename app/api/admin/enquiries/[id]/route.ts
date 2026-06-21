import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const body = await req.json() as { status: string };
    const db = createServiceClient();
    const { error } = await db.from("enquiries").update({ status: body.status }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
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
