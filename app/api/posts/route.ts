import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "3"), 12);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,description,cover_image_url,content_type,tags,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
