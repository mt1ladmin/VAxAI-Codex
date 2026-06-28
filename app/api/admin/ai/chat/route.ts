import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import { assembleContextPackage } from "@/lib/ai/assemble-context-package";
import { detectIntent, resolveModelAndTokens } from "@/lib/ai/intent";
import {
  HAIKU_MODEL,
  OUTREACH_CHAT_DEFAULT_MAX_TOKENS,
  OUTREACH_CHAT_MAX_TOKENS,
} from "@/lib/ai/research-config";
import { loadKnowledgeSnippets, shouldLoadKnowledgeSnippets } from "@/lib/ai/knowledge-snippets";
import { buildSystemBlocks } from "@/lib/ai/system-prompt";
import { logChatUsage } from "@/lib/ai/usage-log";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RECENT_MSG_LIMIT = 6;
const COMPRESS_AT = 18;

async function maybeCompress(
  supabase: ReturnType<typeof createServiceClient>,
  sessionId: string,
  existingSummary: string | null,
  messageCount: number,
) {
  if (messageCount < COMPRESS_AT || messageCount % 12 !== 0) return;

  const { data: all } = await supabase
    .from("ai_chat_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (!all || all.length <= RECENT_MSG_LIMIT) return;

  const toCompress = all.slice(0, all.length - RECENT_MSG_LIMIT);
  const transcript = toCompress
    .map((m: { role: string; content: string }) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
    )
    .join("\n\n");

  const prior = existingSummary
    ? `Existing summary:\n${existingSummary}\n\nNew messages:\n`
    : "";

  try {
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: [
        {
          type: "text",
          text: "Compress conversation history into 4–5 plain-text bullet points. Facts, decisions, and follow-ups only. No filler.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: `${prior}${transcript}` }],
    });

    const summary = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    await supabase.from("ai_chat_sessions").update({ summary }).eq("id", sessionId);
  } catch {
    /* non-fatal */
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = (await req.json()) as {
    contextType: string;
    contextId: string;
    message: string;
    model?: string;
  };

  const { contextType, contextId, message } = body;

  if (!contextType || !contextId || !message?.trim()) {
    return NextResponse.json({ error: "contextType, contextId, and message are required" }, { status: 400 });
  }

  const intent = detectIntent(message);
  const isOutreachResearch = contextType === "outreach";
  const { model: routedModel, maxTokens: routedMax } = resolveModelAndTokens(intent, body.model);
  const model = isOutreachResearch ? HAIKU_MODEL : routedModel;
  const maxTokens = isOutreachResearch
    ? (OUTREACH_CHAT_MAX_TOKENS[intent] ?? OUTREACH_CHAT_DEFAULT_MAX_TOKENS)
    : routedMax;

  const supabase = createServiceClient();

  let { data: session } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (!session) {
    const { data: created } = await supabase
      .from("ai_chat_sessions")
      .insert({ context_type: contextType, context_id: contextId })
      .select()
      .single();
    session = created;
  }

  if (!session) {
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }

  const [assembled, recentMessages] = await Promise.all([
    assembleContextPackage(supabase, contextType, contextId),
    supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .limit(RECENT_MSG_LIMIT),
  ]);

  const historyForModel = (recentMessages.data ?? []).reverse();

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

  const knowledgeSnippets = shouldLoadKnowledgeSnippets(contextType, intent, message)
    ? await loadKnowledgeSnippets(supabase, {
        keywords: [...assembled.keywords, ...message.toLowerCase().split(/\W+/).filter((w) => w.length > 3)],
        attached: assembled.attachments,
        intent,
      })
    : null;

  const system = buildSystemBlocks(contextType, intent, assembled.package, {
    conversationSummary: session.summary as string | null,
    linkedSummary,
    knowledgeSnippets,
  });

  // Stream the response so the user sees tokens immediately
  const encoder = new TextEncoder();
  const sessionSnapshot = session;
  const priorSummary = session.summary as string | null;

  const stream = new ReadableStream({
    async start(controller) {
      let assistantContent = "";
      let usageStats: {
        input_tokens?: number | null;
        output_tokens?: number | null;
        cache_read_input_tokens?: number | null;
        cache_creation_input_tokens?: number | null;
      } | null = null;

      try {
        const anthropicStream = anthropic.messages.stream({
          model,
          max_tokens: maxTokens,
          system,
          messages: [
            ...historyForModel.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: message },
          ],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            assistantContent += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
        }

        const finalMsg = await anthropicStream.finalMessage();
        usageStats = finalMsg.usage ?? null;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg.slice(0, 200) })}\n\n`),
        );
        controller.close();
        return;
      }

      // Save to DB after streaming completes
      const now = new Date().toISOString();
      const { data: savedMessages } = await supabase
        .from("ai_chat_messages")
        .insert([
          { session_id: sessionSnapshot.id, role: "user", content: message, model: null, created_at: now },
          {
            session_id: sessionSnapshot.id,
            role: "assistant",
            content: assistantContent,
            model,
            created_at: new Date(Date.now() + 1).toISOString(),
          },
        ])
        .select("id, role, content, model, created_at");

      const newCount = (sessionSnapshot.message_count ?? 0) + 2;
      await supabase
        .from("ai_chat_sessions")
        .update({ message_count: newCount, last_message_at: now })
        .eq("id", sessionSnapshot.id);

      const msgs = savedMessages ?? [];
      const userMsg = msgs.find((m: { role: string }) => m.role === "user");
      const assistantMsg = msgs.find((m: { role: string }) => m.role === "assistant");

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            done: true,
            userMessage: userMsg,
            assistantMessage: assistantMsg,
            session: { ...sessionSnapshot, message_count: newCount, last_message_at: now },
            meta: { intent, model, maxTokens },
          })}\n\n`,
        ),
      );
      controller.close();

      after(async () => {
        if (usageStats) {
          await logChatUsage(supabase, {
            sessionId: sessionSnapshot.id,
            contextType,
            contextId,
            intent,
            model,
            input_tokens: usageStats.input_tokens,
            output_tokens: usageStats.output_tokens,
            cache_read_input_tokens: usageStats.cache_read_input_tokens,
            cache_creation_input_tokens: usageStats.cache_creation_input_tokens,
          });
        }
        await maybeCompress(supabase, sessionSnapshot.id, priorSummary, newCount);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
