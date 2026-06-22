import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { phrase, orgContext, callType } = await req.json() as {
    phrase: string;
    orgContext?: string;
    callType?: string;
  };

  if (!phrase?.trim() || phrase.trim().length < 8) {
    return NextResponse.json({ error: "Phrase too short" }, { status: 400 });
  }

  // Haiku for speed — consultant is on a live call and needs this NOW.
  // Prompt is tight and output is capped so response should come in under 5 seconds.
  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: `A Virtual Assistant consultant is on a live call. The prospect just said or implied something that isn't in the knowledge base:

"${phrase}"

${orgContext ? `Organisation context: ${orgContext}` : ""}
${callType ? `Call type: ${callType}` : ""}

Generate INSTANT practical guidance the consultant can use RIGHT NOW — what questions to ask, what this likely means, what NOT to assume.

Return ONLY valid JSON (no markdown):
{
  "title": "Short name for this issue (max 6 words)",
  "what_this_means": ["what this likely means operationally", "second interpretation if relevant"],
  "natural_questions": ["Follow-up question to ask now", "Second natural question", "Third question"],
  "what_not_assume": ["Important caution — do not assume this"],
  "possible_support": ["How VAxAI/VA support might help here"]
}`
    }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find(b => b.type === "text") as { type: string; text: string } | undefined;

  if (!text?.text) return NextResponse.json({ error: "No content generated" }, { status: 500 });

  try {
    const data = JSON.parse(text.text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
