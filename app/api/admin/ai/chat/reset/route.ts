import { createServiceClient } from "@/lib/supabase";
import { createChatSnapshotWithArchive } from "@/lib/engagement/chat-archive";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    context_type?: string;
    context_id?: string;
  };

  const contextType = body.context_type;
  const contextId = body.context_id;

  if (!contextType || !contextId) {
    return NextResponse.json({ error: "context_type and context_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: chatSession } = await supabase
    .from("ai_chat_sessions")
    .select("id")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (!chatSession) {
    return NextResponse.json({ ok: true, reset: true });
  }

  const { count } = await supabase
    .from("ai_chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", chatSession.id);

  const messageCount = count ?? 0;

  if (messageCount > 0) {
    await createChatSnapshotWithArchive(supabase, {
      sessionId: chatSession.id,
      contextType,
      contextId,
      messageCount,
      logToActivity: true,
    });
  }

  await supabase.from("ai_chat_messages").delete().eq("session_id", chatSession.id);

  return NextResponse.json({ ok: true, reset: true });
}