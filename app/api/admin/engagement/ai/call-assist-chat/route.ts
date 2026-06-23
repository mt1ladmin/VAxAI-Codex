import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { ProspectCallContext } from "@/lib/engagement/call-context";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

type ChatMessage = { role: "user" | "assistant"; content: string };

function compactContext(ctx: ProspectCallContext | null | undefined): string {
  if (!ctx) return "No prospect context loaded.";
  const source =
    ctx.sourceType === "enquiry"
      ? "Website enquiry"
      : ctx.sourceType === "queue"
        ? "Prospect queue"
        : ctx.sourceType === "opportunity"
          ? "Opportunities tracker"
          : "Contact";
  const lines = [
    `Connected source: ${source} (id: ${ctx.sourceId})`,
    ctx.enquiryId ? `Enquiry id: ${ctx.enquiryId}` : null,
    ctx.opportunityId ? `Opportunity id: ${ctx.opportunityId}` : null,
    ctx.queueId ? `Queue id: ${ctx.queueId}` : null,
    `Organisation / contact: ${ctx.orgName}${ctx.contactName ? ` (${ctx.contactName})` : ""}`,
    ctx.email ? `Email: ${ctx.email}` : null,
    ctx.phone ? `Phone: ${ctx.phone}` : null,
    ctx.industry ? `Industry: ${ctx.industry}` : null,
    ctx.nextAction ? `Next action: ${ctx.nextAction}` : null,
    ctx.nextActionDate ? `Next action date: ${ctx.nextActionDate}` : null,
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

async function loadLinkedRecordContext(db: ReturnType<typeof createServiceClient>, ctx: ProspectCallContext | null | undefined): Promise<string> {
  if (!ctx) return "";
  const blocks: string[] = [];

  if (ctx.enquiryId) {
    const { data: e } = await db.from("enquiries").select("name, email, support_type, details, wants_discovery_call, status, next_action, admin_notes").eq("id", ctx.enquiryId).single();
    if (e) {
      blocks.push(
        `WEBSITE ENQUIRY:\nName: ${e.name}\nEmail: ${e.email}\nSupport type: ${e.support_type}\nStatus: ${e.status}\nDiscovery call: ${e.wants_discovery_call ? "Yes" : "No"}\nNext action: ${e.next_action || "—"}\nDetails: ${(e.details as string || "").slice(0, 400)}\nAdmin notes: ${(e.admin_notes as string || "").slice(0, 300)}`,
      );
    }
  }

  if (ctx.opportunityId) {
    const { data: opp } = await db
      .from("engagement_opportunities")
      .select("title, stage, next_action, expected_decision_date, indicative_value_low, indicative_value_high, notes, enquiry_id, queue_id")
      .eq("id", ctx.opportunityId)
      .single();
    if (opp) {
      const value =
        opp.indicative_value_low || opp.indicative_value_high
          ? `£${opp.indicative_value_low ?? 0}–${opp.indicative_value_high ?? opp.indicative_value_low}`
          : "—";
      blocks.push(
        `OPPORTUNITY:\nTitle: ${opp.title}\nStage: ${opp.stage}\nValue: ${value}\nNext action: ${opp.next_action || "—"}\nExpected decision: ${opp.expected_decision_date || "—"}\nNotes: ${(opp.notes as string || "").slice(0, 400)}`,
      );
    }
  }

  if (ctx.sourceType === "queue" && ctx.sourceId && !ctx.sourceId.startsWith("enquiry-")) {
    const { data: q } = await db
      .from("engagement_prospect_queue")
      .select("raw_org_name, raw_contact_name, raw_email, raw_industry, raw_location, status, next_action, raw_notes")
      .eq("id", ctx.sourceId)
      .single();
    if (q) {
      blocks.push(
        `PROSPECT QUEUE:\nOrg: ${q.raw_org_name}\nContact: ${q.raw_contact_name}\nEmail: ${q.raw_email}\nIndustry: ${q.raw_industry}\nStatus: ${q.status}\nNext action: ${q.next_action || "—"}\nNotes: ${(q.raw_notes as string || "").slice(0, 400)}`,
      );
    }
  }

  const orgId = ctx.organisationId;
  const contactId = ctx.contactId;
  if (orgId || contactId) {
    const interactionQuery = db
      .from("engagement_interactions")
      .select("interaction_date, interaction_type, summary")
      .order("interaction_date", { ascending: false })
      .limit(5);
    if (contactId) interactionQuery.eq("contact_id", contactId);
    else if (orgId) interactionQuery.eq("organisation_id", orgId);
    const { data: interactions } = await interactionQuery;
    if (interactions?.length) {
      blocks.push(
        `RECENT INTERACTIONS:\n${interactions.map((i) => `- ${i.interaction_date}: ${i.interaction_type} — ${(i.summary as string || "").slice(0, 120)}`).join("\n")}`,
      );
    }
  }

  return blocks.join("\n\n");
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

  const [painRes, sectorRes, personaRes, vatRes, linkedContext] = await Promise.all([
    db.from("engagement_pain_points").select("title, category, plain_english_definition, natural_questions, what_not_assume, relevant_sectors").limit(40),
    db.from("engagement_sector_profiles").select("name, description, typical_pressures, engagement_approach").limit(20),
    db.from("engagement_personas").select("persona_name, role_context, motivations, concerns, communication_style").limit(15),
    db.from("engagement_vat_prompts").select("dimension, prompt, context_tags").limit(30),
    loadLinkedRecordContext(db, callContext),
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

  const systemPrompt = `You are VAxAI's live call assistant — a knowledgeable, conversational guide during an active ${callType || "discovery"} call${orgName ? ` with ${orgName}` : ""}${contactName ? ` (${contactName})` : ""}.

This call is linked to a CRM record (website enquiry, prospect queue entry, or opportunity). When asked for "context", summarise everything you know from the connected record, prospect preps, and recent interactions below. Never invent client-specific facts beyond what's provided.

You have access to the VAxAI knowledge base. Answer naturally and concisely — like a skilled colleague during a call. Draw on pain points, sectors, personas, and VAT prompts.

PROSPECT CONTEXT:
${compactContext(callContext)}

LINKED RECORD (from database):
${linkedContext || "No additional linked record data."}

PROSPECT PREPS:
${formatPreps(callContext)}

SUBMISSION / CARDS:
${formatCustomCards(callContext) || "None"}

RECENT CALL NOTES (this session):
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
- Be direct and actionable — suggest exact phrases when helpful
- When asked about pain points for a sector, pull from the knowledge above
- Help draft new pain point descriptions when the consultant describes what they heard
- Reference VAT dimensions (value, alignment, trust) when discussing positioning
- Keep responses focused — mid-call brevity, not long reports
- Never invent facts about this specific client beyond what's in context`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
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