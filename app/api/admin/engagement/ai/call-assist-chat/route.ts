import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { ProspectCallContext } from "@/lib/engagement/call-context";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

type ChatMessage = { role: "user" | "assistant"; content: string };

function compactContext(ctx: ProspectCallContext): string {
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

function formatPreps(ctx: ProspectCallContext): string {
  if (!ctx.prospectPreps?.length) return "No prospect preps attached.";
  return ctx.prospectPreps
    .map((p) => {
      const pains = p.relevantPains?.map((pp) => pp.title).join(", ") || "none";
      return `- ${p.name}: ${p.clientType || "general"} | sector: ${p.sector?.name || "—"} | pains: ${pains}`;
    })
    .join("\n");
}

function formatCustomCards(ctx: ProspectCallContext): string {
  if (!ctx.customCards?.length) return "";
  return ctx.customCards.map((c) => `[${c.title}]\n${c.content}`).join("\n\n");
}

async function loadAccountContext(db: ReturnType<typeof createServiceClient>, ctx: ProspectCallContext): Promise<string> {
  const blocks: string[] = [];

  if (ctx.sourceType === "enquiry" && ctx.enquiryId) {
    const { data: e } = await db
      .from("enquiries")
      .select("name, email, support_type, details, wants_discovery_call, status, next_action, admin_notes, preferred_contact, telephone")
      .eq("id", ctx.enquiryId)
      .single();
    if (e) {
      blocks.push(
        `WEBSITE ENQUIRY:\nName: ${e.name}\nEmail: ${e.email}\nPhone: ${e.telephone || "—"}\nSupport type: ${e.support_type}\nStatus: ${e.status}\nDiscovery call: ${e.wants_discovery_call ? "Yes" : "No"}\nNext action: ${e.next_action || "—"}\nDetails: ${(e.details as string || "").slice(0, 500)}\nAdmin notes: ${(e.admin_notes as string || "").slice(0, 400)}`,
      );
    }
  } else if (ctx.sourceType === "queue" && ctx.sourceId) {
    const { data: q } = await db
      .from("prospect_queue")
      .select("raw_org_name, raw_contact_name, raw_email, raw_phone, raw_website, raw_industry, raw_location, status, next_action, raw_notes")
      .eq("id", ctx.sourceId)
      .single();
    if (q) {
      blocks.push(
        `PROSPECT QUEUE:\nOrg: ${q.raw_org_name}\nContact: ${q.raw_contact_name}\nEmail: ${q.raw_email}\nPhone: ${q.raw_phone || "—"}\nIndustry: ${q.raw_industry}\nStatus: ${q.status}\nNext action: ${q.next_action || "—"}\nNotes: ${(q.raw_notes as string || "").slice(0, 500)}`,
      );
    }
  } else if (ctx.sourceType === "opportunity" && ctx.opportunityId) {
    const { data: opp } = await db
      .from("engagement_opportunities")
      .select("title, stage, next_action, expected_decision_date, indicative_value_low, indicative_value_high, notes")
      .eq("id", ctx.opportunityId)
      .single();
    if (opp) {
      const value =
        opp.indicative_value_low || opp.indicative_value_high
          ? `£${opp.indicative_value_low ?? 0}–${opp.indicative_value_high ?? opp.indicative_value_low}`
          : "—";
      blocks.push(
        `OPPORTUNITY:\nTitle: ${opp.title}\nStage: ${opp.stage}\nValue: ${value}\nNext action: ${opp.next_action || "—"}\nExpected decision: ${opp.expected_decision_date || "—"}\nNotes: ${(opp.notes as string || "").slice(0, 500)}`,
      );
    }
  }

  if (ctx.organisationId) {
    const { data: org } = await db
      .from("engagement_organisations")
      .select("name, industry, size, website, notes")
      .eq("id", ctx.organisationId)
      .single();
    if (org) {
      blocks.push(
        `ORGANISATION:\nName: ${org.name}\nIndustry: ${org.industry || "—"}\nSize: ${org.size || "—"}\nWebsite: ${org.website || "—"}\nNotes: ${(org.notes as string || "").slice(0, 300)}`,
      );
    }
  }

  if (ctx.contactId) {
    const { data: contact } = await db
      .from("engagement_contacts")
      .select("first_name, last_name, role, professional_email, phone, notes")
      .eq("id", ctx.contactId)
      .single();
    if (contact) {
      blocks.push(
        `CONTACT:\nName: ${contact.first_name} ${contact.last_name || ""}\nRole: ${contact.role || "—"}\nEmail: ${contact.professional_email || "—"}\nPhone: ${contact.phone || "—"}\nNotes: ${(contact.notes as string || "").slice(0, 300)}`,
      );
    }
  }

  let interactionQuery = db
    .from("engagement_interactions")
    .select("interaction_date, interaction_type, summary, channel")
    .order("interaction_date", { ascending: false })
    .limit(8);

  if (ctx.enquiryId) interactionQuery = interactionQuery.eq("enquiry_id", ctx.enquiryId);
  else if (ctx.opportunityId) interactionQuery = interactionQuery.eq("opportunity_id", ctx.opportunityId);
  else if (ctx.contactId) interactionQuery = interactionQuery.eq("contact_id", ctx.contactId);
  else if (ctx.organisationId) interactionQuery = interactionQuery.eq("organisation_id", ctx.organisationId);

  const { data: interactions } = await interactionQuery;
  if (interactions?.length) {
    blocks.push(
      `RECENT INTERACTIONS (this account only):\n${interactions.map((i) => `- ${i.interaction_date}: ${i.interaction_type} (${i.channel}) — ${(i.summary as string || "").slice(0, 150)}`).join("\n")}`,
    );
  }

  if (ctx.opportunityId) {
    const { data: tasks } = await db
      .from("engagement_tasks")
      .select("title, status, due_date, priority")
      .eq("opportunity_id", ctx.opportunityId)
      .neq("status", "done")
      .limit(10);
    if (tasks?.length) {
      blocks.push(
        `OPEN TASKS (this opportunity):\n${tasks.map((t) => `- ${t.title} (${t.status}, due ${t.due_date || "—"})`).join("\n")}`,
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
  if (!callContext?.sourceId) {
    return NextResponse.json({ error: "Call must be linked to a record before using the assistant." }, { status: 400 });
  }

  const db = createServiceClient();
  const sectorHint = callContext.sector?.name || callContext.industry || "";
  const personaHint = callContext.persona?.persona_name || "";

  const painQuery = db.from("engagement_pain_points").select("title, category, plain_english_definition, natural_questions, what_not_assume, relevant_sectors").limit(40);
  const sectorQuery = sectorHint
    ? db.from("engagement_sector_profiles").select("name, description, typical_pressures, engagement_approach").ilike("name", `%${sectorHint}%`).limit(3)
    : db.from("engagement_sector_profiles").select("name, description, typical_pressures, engagement_approach").limit(0);
  const personaQuery = personaHint
    ? db.from("engagement_personas").select("persona_name, role_context, motivations, concerns, communication_style").ilike("persona_name", `%${personaHint}%`).limit(2)
    : db.from("engagement_personas").select("persona_name, role_context, motivations, concerns, communication_style").limit(0);

  const [painRes, sectorRes, personaRes, vatRes, accountContext] = await Promise.all([
    painQuery,
    sectorQuery,
    personaQuery,
    db.from("engagement_vat_prompts").select("dimension, prompt, context_tags").limit(20),
    loadAccountContext(db, callContext),
  ]);

  const relevantPains = (painRes.data || []).filter((pp) => {
    if (!sectorHint) return false;
    const sectors = (pp.relevant_sectors as string[] | null) || [];
    return sectors.some((s) => s.toLowerCase().includes(sectorHint.toLowerCase())) ||
      (pp.title as string).toLowerCase().includes(sectorHint.toLowerCase());
  }).slice(0, 12);

  const painBlock = relevantPains.length
    ? relevantPains.map((pp) =>
        `• ${pp.title} (${pp.category}): ${(pp.plain_english_definition as string || "").slice(0, 200)}` +
        (pp.natural_questions?.[0] ? ` | Ask: "${pp.natural_questions[0]}"` : ""),
      ).join("\n")
    : "No sector-specific pain points loaded — use general knowledge hub guidance only if asked.";

  const sectorBlock = (sectorRes.data || []).map((s) =>
    `• ${s.name}: ${(s.description as string || "").slice(0, 200)}`,
  ).join("\n") || "No sector profile for this account.";

  const personaBlock = (personaRes.data || []).map((p) =>
    `• ${p.persona_name}: ${(p.role_context as string || "").slice(0, 150)}`,
  ).join("\n") || "No persona profile for this account.";

  const vatBlock = (vatRes.data || []).map((v) =>
    `• [${v.dimension}] ${(v.prompt as string).slice(0, 120)}`,
  ).join("\n");

  const accountName = orgName || callContext.orgName;

  const systemPrompt = `You are VAxAI's live call assistant during an active ${callType || "discovery"} call with ${accountName}${contactName || callContext.contactName ? ` (${contactName || callContext.contactName})` : ""}.

CRITICAL: This call is linked to ONE specific account only. You must ONLY discuss information about ${accountName} from the context below. Never reference, infer, or discuss other clients, enquiries, prospects, or opportunities. If asked about another account, say you only have context for the linked record.

When asked for "context", summarise everything below about this linked account.

PROSPECT CONTEXT:
${compactContext(callContext)}

ACCOUNT DATA (this linked record only):
${accountContext}

PROSPECT PREPS (attached to this call):
${formatPreps(callContext)}

CARDS:
${formatCustomCards(callContext) || "None"}

RECENT CALL NOTES (this session):
${recentNotes?.length ? recentNotes.join("\n") : "None yet"}

KNOWLEDGE HUB — PAIN POINTS (sector-relevant for this account):
${painBlock}

KNOWLEDGE HUB — SECTOR (this account):
${sectorBlock}

KNOWLEDGE HUB — PERSONA (this account):
${personaBlock}

KNOWLEDGE HUB — VAT PROMPTS:
${vatBlock}

GUIDELINES:
- Be direct and actionable — suggest exact phrases when helpful
- Help draft pain points from what the consultant heard about THIS account only
- Keep responses focused — mid-call brevity
- Never invent facts about this client beyond what's in context`;

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