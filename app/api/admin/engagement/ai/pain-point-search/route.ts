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

  const trimmed = phrase.trim().toLowerCase();
  if (trimmed.length < 6) {
    return NextResponse.json({ matches: [] });
  }

  // Try exact/keyword match first — skip AI call if strong hit found (saves ~1-2s)
  const keywordMatches = painPoints
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

  // Cap at 15 entries — fewer items = faster AI response, good enough for matching
  const limitedPoints = painPoints.slice(0, 15);
  const ppList = limitedPoints.map((pp, i) =>
    `[${i}] ID: ${pp.id}\nTitle: ${pp.title}\nThings they say: ${(pp.what_person_says || []).slice(0, 2).join("; ")}`
  ).join("\n\n");

  // Haiku for all cases in live call — 4× faster than Sonnet, accurate enough for matching
  const modelToUse = "claude-haiku-4-5-20251001";

  try {
    const message = await client.messages.create({
      model: modelToUse,
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Consultant heard: "${phrase}"

Knowledge base entries:
${ppList}

Return ONLY valid JSON — no markdown:
{"matches":[{"id":"exact id","score":85,"why":"one sentence","discovery_question":"follow-up question","suggested_wording":"how to phrase it"}]}

Max 3 matches. Score >= 40 only. If none match, return {"matches":[]}.`
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
