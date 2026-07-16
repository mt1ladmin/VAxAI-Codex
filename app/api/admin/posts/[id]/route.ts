import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";

async function assertAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

function pickUpdatable(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of UPDATABLE_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/** Coerce client payload into DB-safe values. */
function normalizeUpdate(raw: Record<string, unknown>): Record<string, unknown> {
  const update = { ...raw };

  if ("author_id" in update) {
    const a = update.author_id;
    if (a == null || a === "" || (typeof a === "string" && !isUuid(a))) {
      update.author_id = null;
    }
  }

  if ("tags" in update) {
    update.tags = Array.isArray(update.tags)
      ? (update.tags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : [];
  }

  if ("social_hashtags" in update) {
    update.social_hashtags = Array.isArray(update.social_hashtags)
      ? (update.social_hashtags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : [];
  }

  for (const key of [
    "published_at",
    "scheduled_at",
    "linkedin_posted_at",
    "instagram_posted_at",
    "facebook_posted_at",
    "sharing_posted_at",
  ] as const) {
    if (!(key in update)) continue;
    const v = update[key];
    if (v === "Invalid Date" || v === "" || v === undefined) {
      update[key] = null;
      continue;
    }
    if (typeof v === "string") {
      const d = new Date(v);
      update[key] = Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
  }

  if ("status" in update && typeof update.status === "string") {
    const s = update.status.trim().toLowerCase();
    if (s === "published" || s === "draft" || s === "scheduled") {
      update.status = s;
    }
  }

  if ("slug" in update && typeof update.slug === "string") {
    update.slug = update.slug
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "untitled";
  }

  return update;
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

type DbError = { message: string; code?: string; details?: string; hint?: string };

/**
 * Update a post with retries for:
 * - missing columns (migration lag)
 * - invalid author_id FK
 * - slug unique conflicts
 * - last-resort core publish payload
 */
async function updatePostWithFallback(
  db: ReturnType<typeof createServiceClient>,
  id: string,
  payload: Record<string, unknown>,
) {
  let update = { ...payload };
  let lastError: DbError | null = null;
  let triedMinimal = false;

  for (let attempt = 0; attempt < 12; attempt++) {
    const { data, error } = await db
      .from("posts")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (!error) return { data, error: null as null };

    lastError = error;
    const msg = error.message || "";

    // Missing column → drop it and retry
    const col = missingColumnName(msg);
    if (col && col in update) {
      const next = { ...update };
      delete next[col];
      update = next;
      continue;
    }

    // Bad / missing author → clear FK and retry
    if (/author_id|foreign key/i.test(msg) && "author_id" in update && update.author_id != null) {
      update = { ...update, author_id: null };
      continue;
    }

    // Slug taken → uniquify and retry
    if (
      (/duplicate key|unique constraint|already exists/i.test(msg) || error.code === "23505") &&
      typeof update.slug === "string"
    ) {
      const base = String(update.slug).replace(/-\d+$/, "").slice(0, 70) || "post";
      update = { ...update, slug: `${base}-${Date.now().toString(36).slice(-5)}` };
      continue;
    }

    // Publish still failing → try a minimal status-only update once
    if (
      !triedMinimal &&
      update.status === "published" &&
      !/unauthorized|jwt|permission|rls/i.test(msg)
    ) {
      triedMinimal = true;
      update = {
        status: "published",
        published_at: update.published_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(typeof update.title === "string" ? { title: update.title } : {}),
        ...(typeof update.slug === "string" ? { slug: update.slug } : {}),
        ...(typeof update.body_html === "string" ? { body_html: update.body_html } : {}),
        ...(typeof update.description === "string" ? { description: update.description } : {}),
      };
      continue;
    }

    return { data: null, error };
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

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const picked = normalizeUpdate(pickUpdatable(body));
    const now = new Date().toISOString();
    const update: Record<string, unknown> = { ...picked, updated_at: now };

    const hasExplicitPublishedAt = Object.prototype.hasOwnProperty.call(picked, "published_at");
    const status = typeof picked.status === "string" ? picked.status : undefined;

    const db = createServiceClient();

    if (status === "published") {
      const { data: existing, error: existingErr } = await db
        .from("posts")
        .select("published_at,status,slug")
        .eq("id", id)
        .maybeSingle();

      if (existingErr) {
        return NextResponse.json(
          { error: existingErr.message, hint: "Could not load post before publish." },
          { status: 500 },
        );
      }
      if (!existing) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      if (!existing.published_at && !hasExplicitPublishedAt) {
        update.published_at = now;
      }
      // Publishing now → clear future schedule so calendar/status stay consistent
      if (!Object.prototype.hasOwnProperty.call(picked, "scheduled_at")) {
        update.scheduled_at = null;
      }
    } else if (status === "scheduled") {
      // Must have a go-live time; otherwise refuse so cron can never miss it
      const scheduledAt = update.scheduled_at;
      if (!scheduledAt || typeof scheduledAt !== "string") {
        return NextResponse.json(
          { error: "scheduled_at is required when status is scheduled" },
          { status: 400 },
        );
      }
      // Stay unpublished until cron (or publish-due) flips status
      if (!hasExplicitPublishedAt) {
        update.published_at = null;
      }
    } else if (status === "draft" && !hasExplicitPublishedAt) {
      update.published_at = null;
    }

    const { data, error } = await updatePostWithFallback(db, id, update);
    if (error) {
      const message = error.message || "Update failed";
      const hint = /column|schema/i.test(message)
        ? "A posts column may be missing in Supabase — check recent migrations."
        : /duplicate|unique/i.test(message)
          ? "Another post already uses this URL slug — try a different slug."
          : /foreign key|author/i.test(message)
            ? "Author link is invalid — try clearing the author and publishing again."
            : error.hint || undefined;
      return NextResponse.json(
        { error: message, hint, details: error.details, code: error.code },
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
