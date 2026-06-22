import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { interactionSummary, nextSteps, contactName, orgName, callType, channel } = await req.json() as {
    interactionSummary: string;
    nextSteps?: string[];
    contactName?: string;
    orgName?: string;
    callType?: string;
    channel?: string; // email, linkedin, etc.
  };

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultant draft a follow-up message after a call.

STRICT RULES — you must follow these:
- Do NOT invent prices, costs, timelines, or commitments not mentioned in the notes
- Do NOT mention services VAxAI doesn't offer or hasn't been approved for this prospect
- Do NOT present pain points as confirmed unless they were explicitly discussed
- Keep tone warm, professional, and genuine — not salesy
- This is a DRAFT — the consultant will edit it before sending
- Do NOT actually send anything

Call details:
Contact: ${contactName || "the prospect"}
Organisation: ${orgName || "their organisation"}
Call type: ${callType || "the call"}
Follow-up channel: ${channel || "email"}

Summary of the interaction:
${interactionSummary}

Agreed next steps:
${nextSteps?.length ? nextSteps.map(s => `- ${s}`).join("\n") : "None explicitly agreed"}

Write a warm, professional follow-up ${channel || "email"} draft. Include:
1. A brief, genuine reference to the conversation
2. Any agreed next steps (only what was actually agreed)
3. A clear, low-pressure call to action
4. A genuine closing

Keep it concise — no more than 150 words. Do not use a subject line, just the body text.

Return as JSON: { "draft": "the full message text", "suggested_subject": "Email subject if applicable" }`
    }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find(b => b.type === "text") as { type: string; text: string } | undefined;

  if (!text?.text) return NextResponse.json({ error: "No content generated" }, { status: 500 });

  try {
    const result = JSON.parse(text.text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
