import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/lib/posts/publish-due";
import { createServiceClient } from "@/lib/supabase";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`posts:${ip}`, { limit: 60, windowMs: 60_000 });
  const headers = rateLimitHeaders(limited);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers });
  }

  const { searchParams } = new URL(req.url);
  const rawLimit = Number(searchParams.get("limit") ?? "3");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 12) : 3;

  const supabase = createServiceClient();

  // Best-effort: go live any posts whose schedule has passed (backup if cron is late)
  try {
    await publishDueScheduledPosts(supabase, { limit: 20 });
  } catch {
    /* non-fatal */
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,description,cover_image_url,content_type,tags,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Failed to load posts" }, { status: 400, headers });
  }
  return NextResponse.json({ data }, { headers });
}
