import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/lib/posts/publish-due";
import { bearerAuthorized } from "@/lib/security/validate";
import { createServiceClient } from "@/lib/supabase";

/**
 * Vercel Cron (and manual ops) entry point: publish posts whose
 * scheduled_at has passed.
 *
 * Auth: Authorization: Bearer $CRON_SECRET (or AI_BATCH_SECRET).
 * Outside /api/admin so studio session middleware does not block it.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AI_BATCH_SECRET;
  return bearerAuthorized(req, secret);
}

async function run(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createServiceClient();
    const result = await publishDueScheduledPosts(db);
    return NextResponse.json({
      ok: true,
      published: result.count,
      ids: result.published,
      at: result.now,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Publish due failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Vercel Cron calls GET by default. */
export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
