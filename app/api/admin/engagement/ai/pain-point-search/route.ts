import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { phrase, painPoints, forceSemantic = false } = await req.json() as {
    phrase: string;
    painPoints: Array<{ id: string; title: string; category: string; plain_english_definition?: string; what_person_says?: string[] }>;
    forceSemantic?: boolean;
  };

  if (!phrase?.trim() || !painPoints?.length) {
    return NextResponse.json({ matches: [] });
  }

  // Usefulness gate + DB pre-filter for "pain-point-search" AI area (high-frequency during live calls)
  const trimmed = phrase.trim().toLowerCase();
  if (trimmed.length < 6) {
    return NextResponse.json({ matches: [] });
  }

  let skipKeywordGate = forceSemantic;

  // Use DB data (passed painPoints) for cheap exact/keyword match first — avoid AI call if possible
  // But for explicit "AI match" in live call, force semantic search
  const keywordMatches = !skipKeywordGate ? painPoints
    .map((pp) => {
      const hay = [
        pp.title || "",
        pp.plain_english_definition || "",
        ...(pp.what_person_says || []),
      ].join(" ").toLowerCase();
      const score = hay.includes(trimmed) ? 90 : (hay.split(" ").some(w => trimmed.includes(w)) ? 60 : 0);
      return { pp, score };
    })
    .filter(m => m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) : [];

  if (!skipKeywordGate && keywordMatches.length > 0 && keywordMatches[0].score > 85) {
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

  // Limit the number of items sent to Claude for better results and lower cost/token usage
  const limitedPpList = ppList.split('\n\n').slice(0, 30).join('\n\n');  // top 30 candidates

  const modelToUse = forceSemantic ? "claude-3-5-sonnet-20241022" : "claude-3-haiku-20240307";

  try {
    const message = await client.messages.create({
      model: modelToUse,
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `You are helping a Virtual Assistant consultant identify pain points during a client call.

The consultant heard or noted this phrase from the prospect:
"${phrase}"

Here are the available pain points in the knowledge library (showing up to 30 most relevant candidates):
${limitedPpList}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "matches": [
    {
      "id": "exact id from the list",
      "score": 85,
      "why": "one sentence explanation of semantic relevance",
      "discovery_question": "natural follow up question",
      "suggested_wording": "how to mention it to the prospect"
    }
  ]
}

Return at most 3 matches. Only include matches with score >= 40. If no good semantic matches, return "matches": [] .`
      }],
    });

    const content = message.content[0];
    if (!content || content.type !== 'text') {
      console.error('Unexpected Claude response structure in pain-point-search');
      return NextResponse.json({ matches: [] });
    }

    const text = content.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Claude response for pain-point-search:', text.substring(0, 200));
      return NextResponse.json({ matches: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { matches?: any[] };
    return NextResponse.json({ matches: parsed.matches || [] });

  } catch (error) {
    console.error('Claude call failed in pain-point-search:', error);
    // Return empty so UI doesn't break; check Vercel logs for the real error
    return NextResponse.json({ matches: [] });
  }
}
