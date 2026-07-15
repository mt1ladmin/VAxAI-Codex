import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  CONTENT_MODEL,
  MAX_TOKENS,
  OUTPUT_SCHEMAS,
  buildContentSystem,
  type ContentType,
} from "@/lib/ai/content-engine";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CONTENT_TYPES: ContentType[] = ["blog", "linkedin", "instagram", "facebook", "all"];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { content_type?: string; brief?: string };
  const contentType = body.content_type as ContentType | undefined;
  const brief = body.brief?.trim();

  if (!brief || !contentType || !CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "content_type and brief required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
  }

  const stream = anthropic.messages.stream({
    model: CONTENT_MODEL,
    max_tokens: MAX_TOKENS[contentType],
    system: buildContentSystem(contentType),
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMAS[contentType] },
    },
    messages: [{ role: "user", content: `Brief: ${brief}` }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        await stream.finalMessage();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "AI generation failed";
        controller.enqueue(encoder.encode(`\n__VAXAI_STREAM_ERROR__${msg}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
