import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  try {
    await assertAuth();
    const status = req.nextUrl.searchParams.get("status");
    const db = createServiceClient();
    let query = db
      .from("posts")
      .select("id,title,slug,description,content_type,tags,status,cover_image_url,created_at,updated_at,published_at,scheduled_at,author_id")
      .order("updated_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
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
      title?: string; description?: string; body_html?: string;
      content_type?: string; tags?: string[]; author_id?: string;
      cover_image_url?: string; status?: string; slug?: string;
      sharing_caption?: string; linkedin_post?: string;
      instagram_caption?: string; social_hashtags?: string[];
    };
    const title = body.title ?? "Untitled";
    const rawSlug = body.slug || slugify(title);
    const db = createServiceClient();
    // ensure unique slug
    let slug = rawSlug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await db.from("posts").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${rawSlug}-${attempt}`;
    }
    const now = new Date().toISOString();
    const { data, error } = await db.from("posts").insert({
      title,
      slug,
      description: body.description ?? "",
      body_html: body.body_html ?? "",
      content_type: body.content_type ?? "Article",
      tags: body.tags ?? [],
      author_id: body.author_id ?? null,
      cover_image_url: body.cover_image_url ?? null,
      status: body.status ?? "draft",
      published_at: body.status === "published" ? now : null,
      scheduled_at: (body as { scheduled_at?: string }).scheduled_at ?? null,
      updated_at: now,
      sharing_caption: body.sharing_caption ?? null,
      linkedin_post: body.linkedin_post ?? null,
      instagram_caption: body.instagram_caption ?? null,
      social_hashtags: body.social_hashtags ?? [],
    }).select().single();
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
    if (!ids?.length) return NextResponse.json({ error: "No IDs" }, { status: 400 });
    const db = createServiceClient();
    const { error } = await db.from("posts").delete().in("id", ids);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
