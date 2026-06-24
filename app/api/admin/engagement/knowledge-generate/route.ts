import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TEMPLATES: Record<string, string> = {
  persona: `Return JSON only with: persona_name, typical_role, goals (string[]), pressures (string[]), likely_concerns (string[]), useful_questions (string[]), language_to_avoid (string[]), preferred_detail, possible_channels (string[]), status "approved".`,
  sector: `Return JSON only with: name, description, common_admin_pressures (string[]), questions_to_explore (string[]), typical_stakeholders (string[]), status "approved".`,
  pain_point: `Return JSON only with: category, title, plain_english_definition, what_person_says (string[]), what_this_means (string[]), natural_questions (string[]), quick_improvements (string[]), status "approved".`,
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { item_type?: string; brief?: string };
  const itemType = body.item_type;
  const brief = body.brief?.trim();
  if (!itemType || !brief || !TEMPLATES[itemType]) {
    return NextResponse.json({ error: "item_type and brief required" }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `You are authoring a VAxAI Knowledge Hub ${itemType}. Match the tone of existing entries: practical, UK small-business admin focus, plain English.\n\n${TEMPLATES[itemType]}\n\nBrief: ${brief}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AI did not return valid JSON" }, { status: 500 });
  }

  try {
    const data = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}