import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Do NOT pass apiKey here — let the SDK read ANTHROPIC_API_KEY from process.env at
// request time so Next.js cannot inline an undefined value at build time.
function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY_MISSING");
  return new Anthropic({ apiKey: key });
}

export async function POST(req: NextRequest) {
  const { phrase, orgContext, callType } = await req.json() as {
    phrase: string;
    orgContext?: string;
    callType?: string;
  };

  if (!phrase?.trim() || phrase.trim().length < 6) {
    return NextResponse.json({ error: "Phrase too short" }, { status: 400 });
  }

  // Fetch 3 real pain points from the knowledge base to use as format examples.
  // This teaches Claude the exact style, depth and tone of the existing entries.
  let exampleBlock = "";
  try {
    const db = createServiceClient();
    const { data: examples } = await db
      .from("engagement_pain_points")
      .select("title, plain_english_definition, what_person_says, natural_questions, what_not_assume, recommendation_pathways")
      .limit(3);
    if (examples?.length) {
      exampleBlock = "\n\nEXAMPLES from our knowledge base — match this style and depth:\n" +
        examples.map((pp) =>
          `Title: ${pp.title}\n` +
          `Definition: ${pp.plain_english_definition || ""}\n` +
          `They might say: ${(pp.what_person_says as string[] || []).slice(0, 2).join(" / ")}\n` +
          `Ask: ${(pp.natural_questions as string[] || []).slice(0, 2).join(" / ")}\n` +
          `Don't assume: ${(pp.what_not_assume as string[] || []).slice(0, 1).join("")}\n` +
          `Support: ${(pp.recommendation_pathways as string[] || []).slice(0, 1).join("")}`
        ).join("\n---\n");
    }
  } catch {
    // DB unavailable — continue without examples
  }

  let client: Anthropic;
  try {
    client = getClient();
  } catch {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set in the server environment. Add it to Vercel → Settings → Environment Variables, then redeploy." },
      { status: 500 }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `You are a VAxAI consultant advisor on a live ${callType || "prospecting"} call${orgContext ? ` with ${orgContext}` : ""}. The prospect just said: "${phrase}"

This phrase is not yet in our knowledge base. Generate in-call guidance matching the format and style of our existing entries.${exampleBlock}

Return ONLY valid JSON — no markdown, no commentary:
{"title":"pain point name (max 5 words)","what_this_means":["what this operationally means","second interpretation if relevant"],"natural_questions":["question to ask right now","question to dig deeper","clarifying question"],"what_not_assume":["one thing not to assume yet"],"possible_support":["specific way VA or AI could help with this"]}`,
      }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("quick-pain-point-guidance: no JSON in response:", text.substring(0, 200));
      return NextResponse.json({ error: "AI returned no structured data — check server logs" }, { status: 500 });
    }
    let data: { title?: string };
    try {
      data = JSON.parse(jsonMatch[0]) as { title?: string };
    } catch {
      console.error("quick-pain-point-guidance: invalid JSON in response:", jsonMatch[0].substring(0, 200));
      return NextResponse.json({ error: "AI response could not be parsed — response may have been cut off" }, { status: 500 });
    }
    if (!data.title) {
      return NextResponse.json({ error: "AI returned incomplete guidance — no title in response" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = (error as { status?: number })?.status;
    console.error("quick-pain-point-guidance failed:", status ?? "", msg);
    // Return the raw Anthropic error so it's diagnosable in the UI
    return NextResponse.json(
      { error: `Anthropic error${status ? ` (HTTP ${status})` : ""}: ${msg.substring(0, 200)}` },
      { status: 500 }
    );
  }
}
