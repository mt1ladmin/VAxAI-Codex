import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase";
import { CONNECTED_SCHEMA, CONTENT_MODEL, buildConnectedSystem } from "@/lib/ai/content-engine";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function assertAuth() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAuth();
    const { id } = await params;
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      body_text?: string;
    };

    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const bodyText = body.body_text?.trim() ?? "";

    if (!bodyText) {
      return NextResponse.json({ error: "Write some post content first." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
    }

    const userPrompt = [
      `Post id: ${id}`,
      title ? `Title: ${title}` : "No title supplied.",
      description ? `Description: ${description}` : "",
      "",
      "Article content:",
      bodyText.slice(0, 6000),
    ].filter(Boolean).join("\n");

    const response = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 1400,
      system: buildConnectedSystem(),
      output_config: { format: { type: "json_schema", schema: CONNECTED_SCHEMA } },
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI did not return valid JSON" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return NextResponse.json({
      data: {
        sharing_caption: String(data.sharing_caption ?? "").trim(),
        linkedin_post: String(data.linkedin_post ?? "").trim(),
        instagram_caption: String(data.instagram_caption ?? "").trim(),
        hashtags: Array.isArray(data.hashtags)
          ? data.hashtags.map((t) => String(t).trim()).filter(Boolean)
          : [],
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
