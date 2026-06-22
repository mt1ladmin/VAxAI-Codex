import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { ProspectCallContext } from "@/lib/engagement/call-context";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ChatMessage = { role: "user" | "assistant"; content: string };

function compactContext(ctx: ProspectCallContext | null | undefined): string {
  if (!ctx) return "No prospect context loaded.";
  const lines = [
    `Organisation / contact: ${ctx.orgName}${ctx.contactName ? ` (${ctx.contactName})` : ""}`,
    ctx.email ? `Email: ${ctx.email}` : null,
    ctx.phone ? `Phone: ${ctx.phone}` : null,
    ctx.industry ? `Industry: ${ctx.industry}` : null,
    ctx.nextAction ? `Next action: ${ctx.nextAction}` : null,
    ctx.sector ? `Sector: ${ctx.sector.name}` : null,
    ctx.persona ? `Persona: ${ctx.persona.persona_name}` : null,
    ctx.notes ? `Notes: ${ctx.notes.slice(0, 500)}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatPreps(ctx: ProspectCallContext | null | undefined): string {
  if (!ctx?.prospectPreps?.length) return "No prospect preps attached.";
  return ctx.prospectPreps
    .map((p) => {
      const pains = p.relevantPains?.map((pp) => pp.title).join(", ") || "none";
      return `- ${p.name}: ${p.clientType || "general"} | sector: ${p.sector?.name || "—"} | pains: ${pains}`;
    })
    .join("\n");
}

function formatCustomCards(ctx: ProspectCallContext | null | undefined): string {
  if (!ctx?.customCards?.length) return "";
  return ctx.customCards.map((c) => `[${c.title}]\n${c.content}`).join("\n\n");
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const body = await req.json() as {
    messages: ChatMessage[];
    callContext?: ProspectCallContext | null;
    callType?: string;
    orgName?: string;
    contactName?: string;
    recentNotes?: string[];
  };

  const { messages, callContext, callType, orgName, contactName, recentNotes } = body;
  if (!messages?.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const db = createServiceClient();

  const [painRes, sectorRes, personaRes, vatRes] = await Promise.all([
    db.from("engagement_pain_points").select("title, category, plain_english_definition, natural_questions, what_not_assume, relevant_sectors").limit(40),
    db.from("engagement_sector_profiles").select("name, description, typical_pressures, engagement_approach").limit(20),
    db.from("engagement_personas").select("persona_name, role_context, motivations, concerns, communication_style").limit(15),
    db.from("engagement_vat_prompts").select("dimension, prompt, context_tags").limit(30),
  ]);

  const sectorHint = callContext?.sector?.name || callContext?.industry || "";
  const relevantPains = (painRes.data || []).filter((pp) => {
    if (!sectorHint) return true;
    const sectors = (pp.relevant_sectors as string[] | null) || [];
    return sectors.some((s) => s.toLowerCase().includes(sectorHint.toLowerCase())) ||
      (pp.title as string).toLowerCase().includes(sectorHint.toLowerCase());
  }).slice(0, 15);

  const painBlock = relevantPains.length
    ? relevantPains.map((pp) =>
        `• ${pp.title} (${pp.category}): ${(pp.plain_english_definition as string || "").slice(0, 200)}` +
        (pp.natural_questions?.[0] ? ` | Ask: "${pp.natural_questions[0]}"` : ""),
      ).join("\n")
    : (painRes.data || []).slice(0, 10).map((pp) => `• ${pp.title}: ${(pp.plain_english_definition as string || "").slice(0, 150)}`).join("\n");

  const sectorBlock = (sectorRes.data || []).map((s) =>
    `• ${s.name}: ${(s.description as string || "").slice(0, 150)}`,
  ).join("\n");

  const personaBlock = (personaRes.data || []).map((p) =>
    `• ${p.persona_name}: ${(p.role_context as string || "").slice(0, 120)} | Motivations: ${(p.motivations as string[] || []).slice(0, 2).join("; ")}`,
  ).join("\n");

  const vatBlock = (vatRes.data || []).map((v) =>
    `• [${v.dimension}] ${(v.prompt as string).slice(0, 120)}`,
  ).join("\n");

  const systemPrompt = `You are VAxAI's live call assistant — a knowledgeable, conversational guide helping a consultant during an active ${callType || "discovery"} call${orgName ? ` with ${orgName}` : ""}${contactName ? ` (${contactName})` : ""}.

You have access to the VAxAI knowledge base. Answer questions naturally and concisely — like a skilled colleague whispering guidance during a call. Draw on pain points, sectors, personas, and VAT (Value / Alignment / Trust) prompts from the database.

PROSPECT CONTEXT:
${compactContext(callContext)}

PROSPECT PREPS:
${formatPreps(callContext)}

SUBMISSION / CARDS:
${formatCustomCards(callContext) || "None"}

RECENT CALL NOTES:
${recentNotes?.length ? recentNotes.join("\n") : "None yet"}

KNOWLEDGE — PAIN POINTS (relevant subset):
${painBlock}

KNOWLEDGE — SECTORS:
${sectorBlock}

KNOWLEDGE — PERSONAS:
${personaBlock}

KNOWLEDGE — VAT PROMPTS:
${vatBlock}

GUIDELINES:
- Be direct and actionable — suggest exact phrases to say when helpful
- When asked about pain points for a sector, pull from the knowledge above
- When asked to describe a persona, use the persona data
- Reference VAT dimensions (value, alignment, trust) when discussing positioning
- If generating guidance documents, structure clearly with headings
- Keep responses focused — this is mid-call, not a long report
- Never invent facts about this specific client beyond what's in context`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({ data: { content: text } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("call-assist-chat failed:", msg);
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 });
  }
}