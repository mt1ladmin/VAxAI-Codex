import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { phrase, painPoints } = await req.json() as {
    phrase: string;
    painPoints: Array<{ id: string; title: string; category: string; plain_english_definition?: string; what_person_says?: string[] }>;
  };

  if (!phrase?.trim() || !painPoints?.length) {
    return NextResponse.json({ matches: [] });
  }

  const ppList = painPoints.map((pp, i) =>
    `[${i}] ID: ${pp.id}\nTitle: ${pp.title}\nCategory: ${pp.category}\nDefinition: ${pp.plain_english_definition || ""}\nThings they say: ${(pp.what_person_says || []).slice(0, 3).join("; ")}`
  ).join("\n\n");

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultant identify pain points during a client call.

The consultant heard or noted this phrase from the prospect:
"${phrase}"

Here are the available pain points in the knowledge library:
${ppList}

Return the top 3 most semantically relevant matches (fewer if there are no relevant ones). For each match, provide:
- The pain point ID
- A relevance score (0-100)
- A one-sentence explanation of why this is relevant to what they said
- One suggested discovery question to explore this further (natural, conversational)
- One suggested way to phrase/mention this to the prospect

Return as JSON: { "matches": [ { "id": "...", "score": 85, "why": "...", "discovery_question": "...", "suggested_wording": "..." } ] }

Only return pain points with score >= 40. If none match well, return empty matches array.`
    }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}") as { matches?: unknown[] };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
