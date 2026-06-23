import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("context_type");
  const contextId = searchParams.get("context_id");

  if (!contextType || !contextId) {
    return NextResponse.json({ error: "context_type and context_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("ai_chat_activity_snapshots")
    .select("id, session_id, context_type, context_id, title, message_count, ended_at, created_at")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .order("ended_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}