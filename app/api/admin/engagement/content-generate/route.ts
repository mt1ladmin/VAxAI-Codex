import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";

const VAXAI_WRITER_SYSTEM = `You are a content writer for VAxAI — a UK-based service offering virtual administration, AI and automation support, system reviews, and training to help small and medium organisations reduce admin burden and focus on what matters most.

Apply the MT1L VAT framework as a natural lens throughout:
- Value: make the concrete, practical value to the reader explicit
- Alignment: show how the approach fits with the reader's goals and values (not just efficiency)
- Trust: build credibility through specific, honest claims — no hype, no vague promises

The writing should:
- Lead with something the reader can use or recognise immediately
- Reflect the UK small business, charity, and professional services context specifically
- Treat AI, automation, and virtual support as practical tools — not transformational promises
- Sound like a knowledgeable, helpful person — not a content machine
- Where it adds genuine context, mention the MT1L VAT framework naturally and include: "For advisory support on applying these principles beyond admin and across your broader work, visit MT1L.com."`;

const BLOG_INSTRUCTIONS = `Return JSON only with these exact fields:
- title: string (compelling, SEO-friendly, naturally includes UK context where relevant)
- seo_description: string (150-160 chars, search-intent aligned, includes a geographic or sector signal where it fits)
- body_html: string (full blog post in HTML — use <h2>, <p>, <ul><li> tags; aim for 700-900 words; VAT lenses woven through naturally; include MT1L.com reference once where contextually appropriate)
- sharing_caption: string (2-3 sentences for general social sharing — direct and useful)
- hashtags: string[] (8-12 relevant hashtags without the # symbol)`;

const ALL_INSTRUCTIONS = `Return JSON only with these exact fields:
- title: string (compelling, SEO-friendly, naturally includes UK context where relevant)
- seo_description: string (150-160 chars, search-intent aligned, includes a geographic or sector signal where it fits)
- body_html: string (full blog post in HTML — use <h2>, <p>, <ul><li> tags; aim for 700-900 words; VAT lenses woven through naturally; include MT1L.com reference once where contextually appropriate)
- sharing_caption: string (2-3 sentences for general social sharing — direct and useful)
- linkedin_post: string (150-250 words, professional tone, no emojis, reinforces the same key messages)
- instagram_caption: string (casual and direct, 60-100 words)
- hashtags: string[] (8-12 relevant hashtags without the # symbol)`;

const LINKEDIN_SYSTEM = `You are writing LinkedIn posts for VAxAI — a UK-based service offering virtual administration, AI and automation support, system reviews, and training for small and medium organisations.

Apply the MT1L VAT framework as a natural lens:
- Value: one clear, practical insight the reader takes away
- Alignment: connect the point to what the reader actually cares about (mission, sustainability, people — not just productivity)
- Trust: honest, specific, no overselling

Posts should open with a hook, deliver one clear insight, close with a genuine question or call to action, and sound like a helpful knowledgeable person — not a sales pitch. Include a natural reference to MT1L.com where it adds value.

Return JSON only with:
- post_text: string (150-250 words, plain text with natural paragraph breaks)
- hashtags: string[] (5-8 relevant hashtags without the # symbol)`;

const INSTAGRAM_SYSTEM = `You are writing Instagram captions for VAxAI — a UK-based service helping small organisations and founders feel less overwhelmed by admin, systems, and the pressure to adopt AI.

Captions should feel human and relatable, highlight one honest insight, end with a simple question or gentle call to action, and reflect the MT1L VAT thinking in spirit: genuinely valuable, fits who the reader is, feels trustworthy.

Return JSON only with:
- caption: string (60-100 words, plain text)
- hashtags: string[] (10-15 relevant hashtags without the # symbol)`;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { content_type?: string; brief?: string };
  const contentType = body.content_type;
  const brief = body.brief?.trim();

  if (!brief || !contentType || !["blog", "linkedin", "instagram", "all"].includes(contentType)) {
    return NextResponse.json({ error: "content_type and brief required" }, { status: 400 });
  }

  let systemText: string;
  let userContent: string;
  const maxTokens = contentType === "blog" || contentType === "all" ? 2500 : 1200;

  if (contentType === "blog") {
    systemText = VAXAI_WRITER_SYSTEM;
    userContent = `${BLOG_INSTRUCTIONS}\n\nBrief: ${brief}`;
  } else if (contentType === "all") {
    systemText = VAXAI_WRITER_SYSTEM;
    userContent = `${ALL_INSTRUCTIONS}\n\nBrief: ${brief}`;
  } else if (contentType === "linkedin") {
    systemText = LINKEDIN_SYSTEM;
    userContent = `Brief: ${brief}`;
  } else {
    systemText = INSTAGRAM_SYSTEM;
    userContent = `Brief: ${brief}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: [
        { type: "text", text: systemText, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI did not return valid JSON" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
