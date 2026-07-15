import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { publicReadClient } from "@/lib/security/public-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`posts:${ip}`, { limit: 60, windowMs: 60_000 });
  const headers = rateLimitHeaders(limited);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  const { searchParams } = new URL(req.url);
  const rawLimit = Number(searchParams.get("limit") ?? "3");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 12) : 3;

  const supabase = publicReadClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers });
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
