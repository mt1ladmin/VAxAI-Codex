import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { rawNotes, callContext } = await req.json() as {
    rawNotes: string;
    callContext?: {
      contactName?: string;
      orgName?: string;
      callType?: string;
      duration?: string;
    };
  };

  if (!rawNotes?.trim()) return NextResponse.json({ error: "No notes provided" }, { status: 400 });

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    thinking: { type: "adaptive" },
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultant structure rough notes taken during a call.

CRITICAL RULES:
- Original notes are ALWAYS preserved (the user keeps them)
- Never convert uncertain or possible things into confirmed facts
- Clearly mark anything as "possible" or "mentioned, not confirmed" unless it was explicitly stated as fact
- Do not invent, assume, or extrapolate beyond what the notes say
- Use hedged language: "they mentioned...", "it sounds like...", "worth confirming whether..."

Call context:
Contact: ${callContext?.contactName || "not recorded"}
Organisation: ${callContext?.orgName || "not recorded"}
Call type: ${callContext?.callType || "not specified"}
Duration: ${callContext?.duration || "not recorded"}

Raw notes from the call:
"""
${rawNotes}
"""

Structure these notes into a useful call summary. Return as JSON:
{
  "call_summary": "2-3 sentence plain summary of what was discussed",
  "confirmed_pain_points": ["pain points explicitly discussed and acknowledged"],
  "possible_pain_points": [{"topic": "...", "note": "worth exploring — they mentioned..."}],
  "current_tools_mentioned": ["tools or systems they mentioned"],
  "admin_pressures_mentioned": ["admin pressures they mentioned"],
  "desired_outcomes": ["outcomes or goals they expressed"],
  "agreed_next_steps": ["steps explicitly agreed during the call"],
  "follow_up_tasks": ["tasks to do after this call"],
  "possible_vaxai_support": ["areas where VA/AI support might help — NOT confirmed, worth discussing"],
  "trust_concerns": ["any concerns about data, privacy, or AI they expressed"],
  "questions_raised": ["questions they asked or things left unanswered"]
}`
    }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find(b => b.type === "text") as { type: string; text: string } | undefined;

  if (!text?.text) return NextResponse.json({ error: "No content generated" }, { status: 500 });

  try {
    const structured = JSON.parse(text.text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return NextResponse.json({ data: structured });
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
