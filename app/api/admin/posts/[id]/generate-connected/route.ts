import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase";
import {
  CONNECTED_PLATFORM_SCHEMAS,
  CONNECTED_SCHEMA,
  CONTENT_MODEL,
  buildConnectedSystem,
  type ConnectedPlatform,
} from "@/lib/ai/content-engine";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORMS = new Set<ConnectedPlatform>([
  "linkedin",
  "instagram",
  "facebook",
  "sharing",
]);

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
      /** When set, only regenerate this platform's copy. */
      platform?: ConnectedPlatform | "all";
    };

    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const bodyText = body.body_text?.trim() ?? "";
    const platform =
      body.platform && body.platform !== "all" && PLATFORMS.has(body.platform)
        ? body.platform
        : null;

    if (!bodyText) {
      return NextResponse.json({ error: "Write some post content first." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
    }

    const platformHint = platform
      ? `\nOnly generate the ${platform === "sharing" ? "sharing caption" : `${platform} post`}.`
      : "\nGenerate LinkedIn, Instagram, Facebook and a short sharing caption.";

    const userPrompt = [
      `Post id: ${id}`,
      title ? `Title: ${title}` : "No title supplied.",
      description ? `Description: ${description}` : "",
      platformHint,
      "",
      "Article content:",
      bodyText.slice(0, 6000),
    ].filter(Boolean).join("\n");

    const schema = platform ? CONNECTED_PLATFORM_SCHEMAS[platform] : CONNECTED_SCHEMA;
    const maxTokens = platform ? 900 : 1600;

    const response = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: maxTokens,
      system: buildConnectedSystem(),
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI did not return valid JSON" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const hashtags = Array.isArray(data.hashtags)
      ? data.hashtags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    return NextResponse.json({
      data: {
        sharing_caption: data.sharing_caption != null
          ? String(data.sharing_caption).trim()
          : undefined,
        linkedin_post: data.linkedin_post != null
          ? String(data.linkedin_post).trim()
          : undefined,
        instagram_caption: data.instagram_caption != null
          ? String(data.instagram_caption).trim()
          : undefined,
        facebook_post: data.facebook_post != null
          ? String(data.facebook_post).trim()
          : undefined,
        hashtags,
        platform: platform ?? "all",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
