import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const snapshotId = searchParams.get("snapshot_id");

  if (!sessionId && !snapshotId) {
    return NextResponse.json({ error: "session_id or snapshot_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (snapshotId) {
    const { data, error } = await supabase
      .from("ai_chat_snapshot_messages")
      .select("id, role, content, model, created_at")
      .eq("snapshot_id", snapshotId)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  }

  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, model, created_at")
    .eq("session_id", sessionId!)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}