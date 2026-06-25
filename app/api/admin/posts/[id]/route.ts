import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import { sendPostNotification } from "@/lib/email";

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
    const { data, error } = await db.from("posts").select("*").eq("id", id).single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAuth();
    const { id } = await params;
    const body = await req.json() as {
      title?: string; description?: string; body_html?: string;
      content_type?: string; tags?: string[]; author_id?: string | null;
      cover_image_url?: string | null; status?: string; slug?: string;
      scheduled_at?: string | null;
    };
    const now = new Date().toISOString();
    const update: Record<string, unknown> = { ...body, updated_at: now };
    if (body.status === "published") {
      const db = createServiceClient();
      const { data: existing } = await db.from("posts").select("published_at,status").eq("id", id).single();
      if (!existing?.published_at) update.published_at = now;
    } else if (body.status === "draft") {
      update.published_at = null;
    }
    const db = createServiceClient();
    const { data, error } = await db.from("posts").update(update).eq("id", id).select().single();
    if (error) throw error;
    const action = data.status === "published" && update.published_at === now
      ? "published"
      : data.status === "scheduled"
        ? "scheduled"
        : "updated";
    sendPostNotification({
      action,
      title: data.title,
      contentType: data.content_type,
      status: data.status,
      postId: data.id,
      slug: data.slug,
    }).catch(() => {});
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
    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
