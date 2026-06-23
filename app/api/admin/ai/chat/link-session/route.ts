import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/** Link a new client chat session to prior prospect/enquiry conversation history */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    contextType?: string;
    contextId?: string;
    linkedContextType?: string;
    linkedContextId?: string;
  };

  const { contextType, contextId, linkedContextType, linkedContextId } = body;

  if (!contextType || !contextId || !linkedContextType || !linkedContextId) {
    return NextResponse.json({ error: "All context fields required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: priorSession } = await supabase
    .from("ai_chat_sessions")
    .select("summary")
    .eq("context_type", linkedContextType)
    .eq("context_id", linkedContextId)
    .maybeSingle();

  let { data: session } = await supabase
    .from("ai_chat_sessions")
    .select("id")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (!session) {
    const { data: created } = await supabase
      .from("ai_chat_sessions")
      .insert({
        context_type: contextType,
        context_id: contextId,
        linked_context_type: linkedContextType,
        linked_context_id: linkedContextId,
        summary: priorSession?.summary ?? null,
      })
      .select("id")
      .single();
    session = created;
  } else {
    await supabase
      .from("ai_chat_sessions")
      .update({
        linked_context_type: linkedContextType,
        linked_context_id: linkedContextId,
      })
      .eq("id", session.id);
  }

  return NextResponse.json({ data: { linked: true, sessionId: session?.id } });
}