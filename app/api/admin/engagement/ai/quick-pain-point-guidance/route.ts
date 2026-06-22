import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { phrase, orgContext, callType } = await req.json() as {
    phrase: string;
    orgContext?: string;
    callType?: string;
  };

  if (!phrase?.trim() || phrase.trim().length < 6) {
    return NextResponse.json({ error: "Phrase too short" }, { status: 400 });
  }

  try {
    // Non-streaming + Haiku + tight token cap = fastest possible response (~1-2s).
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Live call. Prospect said: "${phrase}"${orgContext ? ` [${orgContext}]` : ""}${callType ? ` [${callType} call]` : ""}

Return ONLY valid JSON, no markdown:
{"title":"short name (max 5 words)","what_this_means":["likely operational meaning"],"natural_questions":["ask now","ask next","third question"],"what_not_assume":["do not assume this"],"possible_support":["how VA/AI could help"]}`
      }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const data = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return NextResponse.json({ data });
  } catch (error) {
    console.error("quick-pain-point-guidance failed:", error);
    return NextResponse.json({ error: "Guidance generation failed" }, { status: 500 });
  }
}
