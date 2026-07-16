import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

/** Columns the editor / calendar may send. Unknown keys are dropped. */
const UPDATABLE_COLUMNS = [
  "title",
  "description",
  "body_html",
  "content_type",
  "tags",
  "author_id",
  "cover_image_url",
  "status",
  "slug",
  "scheduled_at",
  "published_at",
  "sharing_caption",
  "linkedin_post",
  "instagram_caption",
  "facebook_post",
  "social_hashtags",
  "linkedin_posted_at",
  "instagram_posted_at",
  "facebook_posted_at",
  "sharing_posted_at",
] as const;

type UpdatableColumn = (typeof UPDATABLE_COLUMNS)[number];

function pickUpdatable(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of UPDATABLE_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

/** PostgREST error when a column is not in the live schema yet. */
function missingColumnName(message: string): string | null {
  const patterns = [
    /Could not find the '([a-z_]+)' column/i,
    /column ["'`]?([a-z_]+)["'`]? of relation/i,
    /column ["'`]?([a-z_]+)["'`]? does not exist/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * Update a post, dropping columns the DB does not have yet (migration lag).
 * Publish must not hard-fail because facebook_post etc. are not migrated.
 */
async function updatePostWithSchemaFallback(
  db: ReturnType<typeof createServiceClient>,
  id: string,
  payload: Record<string, unknown>,
) {
  let update = { ...payload };
  let lastError: { message: string } | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await db
      .from("posts")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (!error) return { data, error: null as null };

    lastError = error;
    const col = missingColumnName(error.message);
    if (!col || !(col in update)) {
      return { data: null, error };
    }
    const next = { ...update };
    delete next[col as UpdatableColumn];
    update = next;
  }

  return { data: null, error: lastError };
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
    const body = (await req.json()) as Record<string, unknown>;
    const picked = pickUpdatable(body);
    const now = new Date().toISOString();
    const update: Record<string, unknown> = { ...picked, updated_at: now };

    const hasExplicitPublishedAt = Object.prototype.hasOwnProperty.call(picked, "published_at");
    const status = typeof picked.status === "string" ? picked.status : undefined;

    if (status === "published") {
      const db = createServiceClient();
      const { data: existing } = await db
        .from("posts")
        .select("published_at,status")
        .eq("id", id)
        .single();
      if (!existing?.published_at && !hasExplicitPublishedAt) {
        update.published_at = now;
      }
    } else if (status === "draft" && !hasExplicitPublishedAt) {
      update.published_at = null;
    }

    // Never send Invalid Date strings through to Postgres
    for (const key of ["published_at", "scheduled_at", "linkedin_posted_at", "instagram_posted_at", "facebook_posted_at", "sharing_posted_at"] as const) {
      if (update[key] === "Invalid Date" || update[key] === "") {
        update[key] = null;
      }
    }

    const db = createServiceClient();
    const { data, error } = await updatePostWithSchemaFallback(db, id, update);
    if (error) {
      const hint = /column|schema/i.test(error.message)
        ? "A posts column may be missing in Supabase — run pending migrations (e.g. facebook_post)."
        : undefined;
      return NextResponse.json(
        { error: error.message, hint },
        { status: 500 },
      );
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
    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
