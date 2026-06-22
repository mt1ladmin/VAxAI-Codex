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

  // Usefulness gate + DB pre-filter for "pain-point-search" AI area (high-frequency during live calls)
  const trimmed = phrase.trim().toLowerCase();
  if (trimmed.length < 6) {
    return NextResponse.json({ matches: [] });
  }

  // Use DB data (passed painPoints) for cheap exact/keyword match first — avoid AI call if possible
  const keywordMatches = painPoints
    .map((pp, idx) => {
      const hay = [
        pp.title || "",
        pp.plain_english_definition || "",
        ...(pp.what_person_says || []),
      ].join(" ").toLowerCase();
      const score = hay.includes(trimmed) ? 90 : (hay.split(" ").some(w => trimmed.includes(w)) ? 60 : 0);
      return { pp, idx, score };
    })
    .filter(m => m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (keywordMatches.length > 0 && keywordMatches[0].score > 85) {
    // Strong DB match — no need for AI semantic call (cost + speed win)
    return NextResponse.json({
      matches: keywordMatches.slice(0, 3).map(m => ({
        id: m.pp.id,
        score: m.score,
        why: "Direct match from existing knowledge base",
        discovery_question: `Can you tell me more about ${m.pp.title.toLowerCase()}?`,
        suggested_wording: m.pp.title,
      }))
    });
  }

  const ppList = painPoints.map((pp, i) =>
    `[${i}] ID: ${pp.id}\nTitle: ${pp.title}\nCategory: ${pp.category}\nDefinition: ${pp.plain_english_definition || ""}\nThings they say: ${(pp.what_person_says || []).slice(0, 3).join("; ")}`
  ).join("\n\n");

  // Haiku is better here: fast, cheap semantic matching for live call support. Sonnet/Opus overkill.
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
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
