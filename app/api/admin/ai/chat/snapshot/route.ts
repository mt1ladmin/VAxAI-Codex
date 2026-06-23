import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    contextType?: string;
    contextId?: string;
    sessionId?: string;
    messageCount?: number;
  };

  const { contextType, contextId, sessionId, messageCount } = body;

  if (!contextType || !contextId || !sessionId || !messageCount || messageCount <= 0) {
    return NextResponse.json({ error: "Invalid snapshot payload" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: latest } = await supabase
    .from("ai_chat_activity_snapshots")
    .select("message_count")
    .eq("session_id", sessionId)
    .order("ended_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest && latest.message_count >= messageCount) {
    return NextResponse.json({ data: { skipped: true } });
  }

  const title = `VAxAI Assistant chat (${messageCount} message${messageCount === 1 ? "" : "s"})`;

  const { data, error } = await supabase
    .from("ai_chat_activity_snapshots")
    .insert({
      session_id: sessionId,
      context_type: contextType,
      context_id: contextId,
      title,
      message_count: messageCount,
      ended_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}