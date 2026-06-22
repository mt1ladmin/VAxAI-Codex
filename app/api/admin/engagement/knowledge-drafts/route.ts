import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending_review";
  const limit = parseInt(searchParams.get("limit") || "50");
  const { data, error } = await supabase
    .from("engagement_knowledge_drafts")
    .select("id, created_at, title, category, source_phrase, status, reviewer_notes")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
