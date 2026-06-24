import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BLOG_PROMPT = (brief: string) => `You are a content writer for VAxAI — a virtual administration and AI support business helping small and medium UK organisations reduce admin burden, delegate routine workflows, and focus on what matters most.

Create a blog post based on the brief below. The writing should:
- Lead with concrete, practical value the reader can use immediately
- Reflect the UK small business, charity, or professional services context
- Build credibility through specific, honest claims — no hype or vague promises
- Naturally convey that great admin and intelligent support frees people to do their best work
- Feel like it was written by a knowledgeable, helpful person who understands the reader's situation

Return JSON only with these exact fields:
- title: string (compelling, SEO-friendly, naturally includes a UK context where relevant)
- seo_description: string (150-160 chars, search-intent aligned, includes a geographic or sector signal where it fits naturally)
- body_html: string (full blog post in HTML — use <h2>, <p>, <ul><li> tags; aim for 650-900 words; benefits, relevance to the reader, and trustworthy specific detail should flow naturally through the whole piece)
- sharing_caption: string (2-3 sentences for general social sharing — direct and useful)
- linkedin_post: string (150-250 words LinkedIn post reinforcing the same key messages, professional tone, no emojis)
- instagram_caption: string (casual and direct, 60-100 words)
- hashtags: string[] (8-12 relevant hashtags without the # symbol)

Brief: ${brief}`;

const LINKEDIN_PROMPT = (brief: string) => `You are writing a LinkedIn post for VAxAI — a virtual administration and AI support business helping UK small businesses, charities, and professional services reduce admin burden and focus on meaningful work.

The post should:
- Open with a hook that speaks directly to the reader's situation
- Deliver one clear, practical insight within the post itself
- Close with a genuine question or clear call to action
- Sound like a knowledgeable, helpful person — not a sales pitch or a list of bullet points

Return JSON only with:
- post_text: string (150-250 words, plain text with natural paragraph breaks)
- hashtags: string[] (5-8 relevant hashtags without the # symbol)

Brief: ${brief}`;

const INSTAGRAM_PROMPT = (brief: string) => `You are writing an Instagram caption for VAxAI — a virtual administration and AI support business helping UK small businesses and organisations feel less overwhelmed by admin and systems.

The caption should:
- Feel human and relatable — short, punchy, real
- Highlight one clear benefit or honest insight
- End with a simple call to action or question

Return JSON only with:
- caption: string (60-100 words, plain text)
- hashtags: string[] (10-15 relevant hashtags without the # symbol)

Brief: ${brief}`;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { content_type?: string; brief?: string };
  const contentType = body.content_type;
  const brief = body.brief?.trim();

  if (!brief || !contentType || !["blog", "linkedin", "instagram"].includes(contentType)) {
    return NextResponse.json({ error: "content_type and brief required" }, { status: 400 });
  }

  const isBlog = contentType === "blog";
  const prompt = isBlog
    ? BLOG_PROMPT(brief)
    : contentType === "linkedin"
    ? LINKEDIN_PROMPT(brief)
    : INSTAGRAM_PROMPT(brief);

  const response = await anthropic.messages.create({
    model: isBlog ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
    max_tokens: isBlog ? 3000 : 1500,
    messages: [{ role: "user", content: prompt }],
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
