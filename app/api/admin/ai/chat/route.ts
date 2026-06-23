import Anthropic from "@anthropic-ai/sdk";
import { extractKnowledgeKeywords } from "@/lib/ai/context-builders";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-8",
];

const MAX_TOKENS: Record<string, number> = {
  "claude-haiku-4-5-20251001": 800,
  "claude-sonnet-4-6": 1400,
  "claude-opus-4-8": 1800,
};

const RECENT_MSG_LIMIT = 10; // messages kept in context per turn
const COMPRESS_AT = 20;      // trigger compression after this many total messages

// ── Knowledge base loading ────────────────────────────────────────────────────

async function loadKnowledgeBase(
  supabase: ReturnType<typeof import("@/lib/supabase").createServiceClient>,
  userMessage: string,
  contextSummary?: string,
) {
  const contextKeywords = contextSummary ? extractKnowledgeKeywords(contextSummary) : [];
  const words = [
    ...contextKeywords,
    ...userMessage
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3),
  ];

  const [painRes, sectorRes, personaRes, vatRes] = await Promise.all([
    supabase
      .from("engagement_pain_points")
      .select("title, category, plain_english_definition, natural_questions")
      .limit(80),
    supabase
      .from("engagement_sector_profiles")
      .select("name, description, common_admin_pressures")
      .limit(25),
    supabase
      .from("engagement_personas")
      .select("persona_name, typical_role, goals, pressures, likely_concerns")
      .limit(20),
    supabase
      .from("engagement_vat_prompts")
      .select("dimension, prompt, context_tags")
      .limit(30),
  ]);

  // Score pain points by keyword relevance; return top 6
  const scoredPains = (painRes.data ?? []).map((pp) => {
    const text = `${pp.title} ${pp.category} ${pp.plain_english_definition ?? ""}`.toLowerCase();
    const score = words.filter((w) => text.includes(w)).length;
    return { ...pp, score };
  });
  scoredPains.sort((a, b) => b.score - a.score);
  const topPains = scoredPains.slice(0, 6);

  // Score sectors
  const scoredSectors = (sectorRes.data ?? []).map((s) => {
    const text = `${s.name} ${s.description ?? ""}`.toLowerCase();
    const score = words.filter((w) => text.includes(w)).length;
    return { ...s, score };
  });
  scoredSectors.sort((a, b) => b.score - a.score);
  const topSectors = scoredSectors.slice(0, 3);

  const painBlock = topPains.length
    ? topPains
        .map(
          (pp) =>
            `• [${pp.category}] ${pp.title}: ${(pp.plain_english_definition as string ?? "").slice(0, 160)}` +
            ((pp.natural_questions as string[] | null)?.[0]
              ? ` | Q: "${(pp.natural_questions as string[])[0]}"`
              : ""),
        )
        .join("\n")
    : "None loaded.";

  const sectorBlock = topSectors.length
    ? topSectors
        .map(
          (s) =>
            `• ${s.name}: ${(s.description as string ?? "").slice(0, 150)}` +
            ((s.common_admin_pressures as string[] | null)?.length
              ? ` | Pressures: ${(s.common_admin_pressures as string[]).slice(0, 2).join(", ")}`
              : ""),
        )
        .join("\n")
    : "None loaded.";

  const personaBlock = (personaRes.data ?? [])
    .slice(0, 4)
    .map(
      (p) =>
        `• ${p.persona_name} (${p.typical_role ?? "—"}): Goals: ${(p.goals as string[] | null)?.slice(0, 2).join("; ") ?? "—"} | Concerns: ${(p.likely_concerns as string[] | null)?.slice(0, 2).join("; ") ?? "—"}`,
    )
    .join("\n");

  const vatBlock = (vatRes.data ?? [])
    .map((v) => `• [${v.dimension}] ${(v.prompt as string).slice(0, 120)}`)
    .join("\n");

  return { painBlock, sectorBlock, personaBlock, vatBlock };
}

// ── Compression (runs synchronously on threshold to avoid being killed) ────────

async function maybeCompress(
  supabase: ReturnType<typeof import("@/lib/supabase").createServiceClient>,
  sessionId: string,
  existingSummary: string | null,
  messageCount: number,
) {
  if (messageCount < COMPRESS_AT || messageCount % RECENT_MSG_LIMIT !== 0) return;

  const { data: all } = await supabase
    .from("ai_chat_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (!all || all.length <= RECENT_MSG_LIMIT) return;

  const toCompress = all.slice(0, all.length - RECENT_MSG_LIMIT);
  const transcript = toCompress
    .map((m: { role: string; content: string }) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const prior = existingSummary ? `Existing summary:\n${existingSummary}\n\nNew messages to incorporate:\n` : "";

  try {
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `${prior}Summarise this conversation into 4–6 concise bullet points. Capture key facts about the account, decisions made, insights shared, and any follow-up items. Be factual and specific — no filler:\n\n${transcript}`,
        },
      ],
    });

    const summary = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    await supabase.from("ai_chat_sessions").update({ summary }).eq("id", sessionId);
  } catch {
    // Non-fatal: compression failure just means next turn carries more tokens
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = (await req.json()) as {
    contextType: string;
    contextId: string;
    message: string;
    model?: string;
    contextSummary: string;
    linkedSummary?: string | null;
  };

  const { contextType, contextId, message, contextSummary, linkedSummary } = body;
  const model =
    ALLOWED_MODELS.includes(body.model ?? "") ? (body.model ?? "claude-haiku-4-5-20251001") : "claude-haiku-4-5-20251001";

  if (!contextType || !contextId || !message?.trim()) {
    return NextResponse.json({ error: "contextType, contextId, and message are required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Load or create session
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

  // Recent messages for context window
  const { data: recentMessages } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("session_id", session.id)
    .order("created_at", { ascending: false })
    .limit(RECENT_MSG_LIMIT);

  const historyForModel = (recentMessages ?? []).reverse();

  // Load knowledge base (keyword-matched)
  const { painBlock, sectorBlock, personaBlock, vatBlock } = await loadKnowledgeBase(
    supabase,
    message,
    contextSummary,
  );

  // ── System prompt ─────────────────────────────────────────────────────────

  const contextTypeLabel: Record<string, string> = {
    outreach: "prospect outreach (pre-queue review)",
    enquiry: "website enquiry",
    prospect: "prospect queue (active outreach)",
    client: "prospect/client (strategic delivery)",
  };
  const stageLabel = contextTypeLabel[contextType] ?? contextType;

  const stageGuidance: Record<string, string> = {
    outreach:
      "STAGE GOAL: Help the reviewer validate fit, suggest checks, draft review notes, and prepare a clean handoff to the prospect queue. Do not discuss closing deals yet.",
    prospect:
      "STAGE GOAL: Help with contact strategy, meeting prep, follow-ups, and judging when to advance to Prospect/Client work. Positive signals include agreed meetings, requested proposals, or explicit interest.",
    client:
      "STAGE GOAL: Help with journey summary, proposals, onboarding planning, Knowledge Hub connections, and strategic next steps. Delivery happens offline once agreed.",
    enquiry:
      "STAGE GOAL: Understand the inbound enquiry and plan qualification — similar to early prospect queue work.",
  };
  const stageRules = stageGuidance[contextType] ?? "";

  const summarySection = session.summary
    ? `\nCONVERSATION HISTORY SUMMARY (previous turns, compressed):\n${session.summary}\n`
    : "";

  const linkedSection = linkedSummary
    ? `\nPRIOR ACCOUNT HISTORY (from before they became a client — use as background context):\n${linkedSummary}\n`
    : "";

  const systemPrompt = `You are the VAxAI AI assistant — an expert business advisor embedded inside VAxAI's internal studio. VAxAI is a virtual assistant service helping small businesses, entrepreneurs, and executives with administration, operations, and business growth.

Your role is to help VAxAI staff with:
• CONVERSION: Understand what prospects and enquiries need, develop personalised strategies to convert them to clients
• CLIENT SUCCESS: Keep client accounts on track, surface opportunities to add more value, ensure services stay aligned with client goals
• STRATEGIC INSIGHT: Apply VAxAI's knowledge base — sectors, personas, pain points, and the VAT framework — to every account
• KNOWLEDGE BUILDING: Identify patterns, insights, and potential new knowledge base items from conversations

VAT FRAMEWORK (VAxAI's positioning approach):
• Value — demonstrate concrete ROI, time savings, and measurable impact
• Alignment — show deep understanding of their industry, role, and specific challenges
• Trust — build credibility through expertise, consistency, and reliability

CURRENT ACCOUNT CONTEXT (${stageLabel}):
${contextSummary}
${stageRules ? `\n${stageRules}\n` : ""}${summarySection}${linkedSection}
RELEVANT KNOWLEDGE BASE — PAIN POINTS:
${painBlock}

RELEVANT KNOWLEDGE BASE — SECTORS:
${sectorBlock}

KNOWLEDGE BASE — PERSONAS:
${personaBlock}

KNOWLEDGE BASE — VAT PROMPTS:
${vatBlock}

OPERATIONAL RULES:
1. You are only here to discuss this specific account and VAxAI's work with them. Do not answer general questions unrelated to this account or VAxAI's services.
2. You can only speak to what you know from the context above. For data not in context (e.g. full call logs, detailed task history), say "I can look that up in more detail — just ask" rather than fabricating.
3. Be concise, direct, and actionable. Use bullet points where useful. This is a working tool, not a report generator.
4. When you identify something worth adding to VAxAI's knowledge base (a new pain point pattern, sector insight, or persona nuance), append a brief [KNOWLEDGE NOTE] at the end of your response.
5. Always think in terms of conversion strategy and client value delivery.
6. When the user asks for a summary (call prep, next actions, account overview, etc.), write a clear structured summary with short headings and bullet points that can be saved directly to account notes after review.`;

  // ── Call Claude ───────────────────────────────────────────────────────────

  let assistantContent = "";
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: MAX_TOKENS[model] ?? 800,
      system: systemPrompt,
      messages: [
        ...historyForModel.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
    });

    assistantContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 });
  }

  // ── Save both turns ───────────────────────────────────────────────────────

  const now = new Date().toISOString();
  const { data: savedMessages } = await supabase
    .from("ai_chat_messages")
    .insert([
      { session_id: session.id, role: "user", content: message, model: null, created_at: now },
      {
        session_id: session.id,
        role: "assistant",
        content: assistantContent,
        model,
        created_at: new Date(Date.now() + 1).toISOString(),
      },
    ])
    .select("id, role, content, model, created_at");

  const newCount = (session.message_count ?? 0) + 2;

  await supabase
    .from("ai_chat_sessions")
    .update({ message_count: newCount, last_message_at: now })
    .eq("id", session.id);

  // Synchronous compression to avoid serverless function kill after response
  await maybeCompress(supabase, session.id, session.summary as string | null, newCount);

  const msgs = savedMessages ?? [];
  const userMsg = msgs.find((m: { role: string }) => m.role === "user");
  const assistantMsg = msgs.find((m: { role: string }) => m.role === "assistant");

  return NextResponse.json({
    data: {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      session: { ...session, message_count: newCount, last_message_at: now },
    },
  });
}
