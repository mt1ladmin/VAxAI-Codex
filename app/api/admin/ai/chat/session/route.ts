import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("context_type");
  const contextId = searchParams.get("context_id");

  if (!contextType || !contextId) {
    return NextResponse.json({ error: "context_type and context_id required" }, { status: 400 });
  }

  // Find existing session or create one
  let { data: session } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (!session) {
    const { data: created, error } = await supabase
      .from("ai_chat_sessions")
      .insert({ context_type: contextType, context_id: contextId })
      .select()
      .single();
    if (error || !created) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    session = created;
  }

  // Load last 40 messages (full history for the tab view)
  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, model, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })
    .limit(40);

  // If there's a linked prior session (e.g. enquiry → client), load its summary
  let linkedSummary: string | null = null;
  if (session.linked_context_type && session.linked_context_id) {
    const { data: linked } = await supabase
      .from("ai_chat_sessions")
      .select("summary")
      .eq("context_type", session.linked_context_type)
      .eq("context_id", session.linked_context_id)
      .maybeSingle();
    linkedSummary = linked?.summary ?? null;
  }

  return NextResponse.json({
    data: { session, messages: messages ?? [], linkedSummary },
  });
}
