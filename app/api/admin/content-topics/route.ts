import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import { CONTENT_TOPICS } from "@/lib/content-topic-library";

async function assertAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

/** Ensure seed topics exist (active if never used). Does not revive used seeds. */
async function ensureSeedTopics(db: ReturnType<typeof createServiceClient>) {
  const { data: existing } = await db.from("studio_content_topics").select("id, status");
  const byId = new Map((existing ?? []).map((r) => [r.id as string, r.status as string]));

  const today = new Date().toISOString().slice(0, 10);
  const toInsert = CONTENT_TOPICS.filter((t) => !byId.has(t.id)).map((t) => ({
    id: t.id,
    category: t.category,
    title: t.title,
    angle: t.angle,
    formats: t.formats,
    source: "seed",
    status: "active",
    live_as_of: today,
  }));

  if (toInsert.length) {
    await db.from("studio_content_topics").insert(toInsert);
  }
}

export async function GET(req: NextRequest) {
  try {
    await assertAuth();
    const status = req.nextUrl.searchParams.get("status") ?? "active";
    const db = createServiceClient();

    try {
      await ensureSeedTopics(db);
    } catch (e) {
      // Table may not exist yet — fall back to in-memory seed for UI
      console.warn("content-topics seed:", e);
      if (status === "active" || status === "all") {
        return NextResponse.json({
          data: CONTENT_TOPICS.map((t) => ({
            ...t,
            source: "seed",
            status: "active",
            research_note: null,
            used_at: null,
          })),
          fallback: true,
        });
      }
      // No persisted used/archived topics without the table
      if (status === "inactive" || status === "used" || status === "archived") {
        return NextResponse.json({ data: [], fallback: true });
      }
    }

    // inactive = used + archived (archive library view)
    // active keeps newest-created first; inactive prefers recently used
    let query = db.from("studio_content_topics").select("*");

    if (status === "inactive") {
      query = query
        .in("status", ["used", "archived"])
        .order("used_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false });
    } else if (status === "active") {
      query = query.eq("status", "active").order("created_at", { ascending: false });
    } else if (status !== "all") {
      query = query.eq("status", status).order("updated_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

/** Mark topics as used/archived after content is generated, or restore to active. */
export async function PATCH(req: NextRequest) {
  try {
    await assertAuth();
    const body = (await req.json()) as {
      ids?: string[];
      action?: "use" | "archive" | "restore";
    };
    const ids = body.ids?.filter(Boolean) ?? [];
    if (!ids.length) {
      return NextResponse.json({ error: "ids required" }, { status: 400 });
    }

    const db = createServiceClient();
    const action = body.action ?? "use";
    const now = new Date().toISOString();

    const update =
      action === "restore"
        ? { status: "active", used_at: null, updated_at: now }
        : {
            status: action === "archive" ? "archived" : "used",
            used_at: now,
            updated_at: now,
          };

    const { error } = await db
      .from("studio_content_topics")
      .update(update)
      .in("id", ids);

    if (error) throw error;
    return NextResponse.json({
      success: true,
      status: update.status,
      ids,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
