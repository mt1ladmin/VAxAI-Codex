import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { organisationId, contactId, callType } = await req.json() as {
    organisationId?: string;
    contactId?: string;
    callType?: string;
  };

  const supabase = createServiceClient();

  let org = null, contact = null;
  const interactions: Array<{ interaction_date: string; interaction_type: string; summary?: string; outcome?: string; pain_point_ids?: string[] }> = [];
  const painPoints: Array<{ id: string; title: string; category: string; plain_english_definition?: string }> = [];

  if (organisationId) {
    const { data } = await supabase.from("engagement_organisations").select("*").eq("id", organisationId).single();
    org = data;

    const { data: ixns } = await supabase.from("engagement_interactions")
      .select("interaction_date, interaction_type, summary, outcome, pain_point_ids")
      .eq("organisation_id", organisationId)
      .order("interaction_date", { ascending: false })
      .limit(5);
    if (ixns) interactions.push(...ixns);

    if (org?.known_pain_points?.length) {
      const { data: pps } = await supabase.from("engagement_pain_points")
        .select("id, title, category, plain_english_definition")
        .in("id", org.known_pain_points)
        .limit(5);
      if (pps) painPoints.push(...pps);
    }
  }

  if (contactId) {
    const { data } = await supabase.from("engagement_contacts").select("*").eq("id", contactId).single();
    contact = data;
  }

  // Usefulness gate + DB leverage for "call-preparation" AI area (pre live call)
  // Leverage DB data already fetched (interactions, known pain points) — no extra API needed.
  const hasData = !!org || interactions.length > 0 || painPoints.length > 0;
  if (!hasData && !callType) {
    return NextResponse.json({ data: {
      what_we_know: ["Limited CRM data available for this prospect"],
      to_confirm: ["Basic context and goals"],
      previous_engagement_summary: "No previous contact recorded",
      sector_considerations: [],
      pain_points_to_explore: [],
      discovery_questions: ["What brings you here today?"],
      suggested_opening: "Hi, thanks for your time today.",
      key_cautions: ["Gather primary details before making assumptions"]
    }});
  }

  // Sonnet good for synthesizing history into actionable prep card. Cache the result keyed by org+contact in future calls if same context.
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultant prepare for a call with a prospect or client.

IMPORTANT RULES:
- Clearly separate confirmed information (from CRM data) from things to explore (possible but unconfirmed)
- Never present hypothetical pain points as confirmed facts
- Use language like "worth exploring", "ask whether...", "do not assume this applies"
- Be honest about what you don't know

CRM data available:
${org ? `Organisation: ${org.name}
Industry: ${org.industry || "unknown"}
Size: ${org.size || "unknown"}
Digital maturity: ${org.digital_maturity || "unknown"}
AI confidence: ${org.ai_confidence || "unknown"}
Known pain points: ${painPoints.map(p => p.title).join(", ") || "none recorded"}
Notes: ${org.notes || "none"}` : "No organisation selected"}

${contact ? `Contact: ${contact.first_name} ${contact.last_name || ""}
Role: ${contact.role || "unknown"}
Notes: ${contact.notes || "none"}` : "No specific contact selected"}

Previous interactions (${interactions.length}):
${interactions.map(i => `- ${i.interaction_date?.split("T")[0]}: ${i.interaction_type} — ${i.summary || "no summary"} (outcome: ${i.outcome || "unrecorded"})`).join("\n") || "None recorded"}

Call type: ${callType || "not specified"}

Create a concise pre-call preparation card. Return as JSON:
{
  "what_we_know": ["confirmed fact from CRM 1", "fact 2"],
  "to_confirm": ["info that may be outdated or needs confirming 1", "item 2"],
  "previous_engagement_summary": "1-2 sentence summary of previous contact, or 'No previous contact recorded'",
  "sector_considerations": ["relevant sector consideration 1", "consideration 2"],
  "pain_points_to_explore": [{"title": "...", "why": "worth exploring because...", "caution": "do not assume..."}],
  "discovery_questions": ["natural discovery question 1", "question 2", "question 3"],
  "suggested_opening": "A suggested natural opening line or approach for this call",
  "key_cautions": ["important caution 1", "caution 2"]
}`
    }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find(b => b.type === "text") as { type: string; text: string } | undefined;

  if (!text?.text) return NextResponse.json({ error: "No content generated" }, { status: 500 });

  try {
    const prep = JSON.parse(text.text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return NextResponse.json({ data: prep });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
