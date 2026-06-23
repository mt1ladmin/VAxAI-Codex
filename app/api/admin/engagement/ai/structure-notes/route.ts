import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { rawNotes, chatMessages, callContext } = await req.json() as {
    rawNotes?: string;
    chatMessages?: Array<{ role: string; content: string }>;
    callContext?: {
      contactName?: string;
      orgName?: string;
      callType?: string;
      duration?: string;
    };
  };

  const transcript = chatMessages?.length
    ? chatMessages
        .map((m) => `${m.role === "user" ? "Consultant" : "Assistant"}: ${m.content}`)
        .join("\n\n")
    : rawNotes?.trim() || "";

  if (!transcript) return NextResponse.json({ error: "No conversation or notes provided" }, { status: 400 });

  const noteLen = transcript.length;
  if (noteLen < 30) {
    return NextResponse.json({ data: {
      call_summary: transcript,
      captured_notes: [],
      client_commitments: [],
      open_questions: [],
      confirmed_pain_points: [],
      possible_pain_points: [],
      current_tools_mentioned: [],
      admin_pressures_mentioned: [],
      desired_outcomes: [],
      agreed_next_steps: [],
      follow_up_tasks: [],
      possible_vaxai_support: [],
      trust_concerns: [],
      questions_raised: [],
    }});
  }

  // Haiku is sufficient and far cheaper for structuring notes. Sonnet only if very complex reasoning needed.
  // Natural live call flow: consultant wants quick organized summary without high cost.
  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultant structure a live call conversation into an accurate record.

CRITICAL RULES:
- The full conversation transcript is preserved separately — your job is to extract and organise
- Never convert uncertain things into confirmed facts
- Distinguish clearly between: general notes, commitments the client/prospect made, and open questions
- Consultant messages often contain live notes — treat those as primary source for commitments and questions
- Do not invent facts beyond the transcript

Call context:
Contact: ${callContext?.contactName || "not recorded"}
Organisation: ${callContext?.orgName || "not recorded"}
Call type: ${callContext?.callType || "not specified"}
Duration: ${callContext?.duration || "not recorded"}

Call conversation:
"""
${transcript}
"""

Return as JSON:
{
  "call_summary": "2-4 sentence summary of the call",
  "captured_notes": ["factual notes and observations from the call"],
  "client_commitments": ["commitments or agreements made by the client/prospect"],
  "open_questions": ["questions raised that remain unanswered"],
  "confirmed_pain_points": ["pain points explicitly discussed"],
  "possible_pain_points": [{"topic": "...", "note": "worth exploring"}],
  "current_tools_mentioned": [],
  "admin_pressures_mentioned": [],
  "desired_outcomes": [],
  "agreed_next_steps": ["next steps agreed during the call"],
  "follow_up_tasks": ["tasks for the consultant after the call"],
  "possible_vaxai_support": [],
  "trust_concerns": [],
  "questions_raised": []
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
