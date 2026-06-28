import Anthropic from "@anthropic-ai/sdk";
import { SUMMARISE_NOTE_PROMPT } from "@/lib/ai/system-prompt";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const sessionRes = await supabase
    .from("ai_chat_sessions")
    .select("id, summary")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  const session = sessionRes.data;
  if (!session) {
    return NextResponse.json({ error: "No conversation to summarise" }, { status: 404 });
  }

  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("role, content, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (!messages?.length) {
    return NextResponse.json({ error: "No messages in conversation" }, { status: 404 });
  }

  const recent = messages.slice(-12);
  const transcript = recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const prior = session.summary ? `Earlier conversation summary:\n${session.summary}\n\n` : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: [
      { type: "text", text: SUMMARISE_NOTE_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role: "user",
        content: `${prior}Recent messages:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const summary = textBlock && textBlock.type === "text" ? textBlock.text : "";

  return NextResponse.json({
    title: "Conversation summary",
    summary,
  });
}