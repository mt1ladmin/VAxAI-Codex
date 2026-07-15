import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createServiceClient } from "@/lib/supabase";
import { CONTENT_MODEL } from "@/lib/ai/content-engine";
import {
  CONTENT_TOPICS,
  TOPIC_CATEGORIES,
  type TopicCategoryId,
} from "@/lib/content-topic-library";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function assertAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Lightweight public research snippets for timely angles (no extra API keys required). */
async function gatherPublicSignals(): Promise<string> {
  const snippets: string[] = [];
  const targets: { url: string; label: string }[] = [
    { url: "https://www.gov.uk/government/collections/ai-sector-opportunity", label: "UK gov AI" },
    { url: "https://www.gov.uk/access-to-work", label: "Access to Work" },
    {
      url: "https://www.ncvo.org.uk/help-and-guidance/digital-technology/",
      label: "NCVO digital",
    },
  ];

  await Promise.all(
    targets.map(async ({ url, label }) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "VAxAI-Studio/1.0 (content research)" },
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return;
        const html = await res.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 1200);
        if (text.length > 80) snippets.push(`[${label}] ${text}`);
      } catch {
        /* ignore network failures — generation still works offline */
      }
    }),
  );

  return snippets.length
    ? snippets.join("\n\n")
    : "No live pages fetched. Use timeless UK organisational admin and AI-readiness themes only.";
}

type GenTopic = {
  category: TopicCategoryId;
  title: string;
  angle: string;
  formats: string[];
  research_note?: string;
};

export async function POST(req: NextRequest) {
  try {
    await assertAuth();
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
    }

    const body = (await req.json().catch(() => ({}))) as { count?: number };
    const count = Math.min(Math.max(body.count ?? 6, 3), 12);

    const db = createServiceClient();
    const { data: existing } = await db
      .from("studio_content_topics")
      .select("id, title, status");

    const usedTitles = (existing ?? []).map((r) => r.title as string);
    const seedTitles = CONTENT_TOPICS.map((t) => t.title);
    const avoid = [...new Set([...usedTitles, ...seedTitles])].slice(0, 80);

    const research = await gatherPublicSignals();
    const categories = TOPIC_CATEGORIES.map((c) => c.id).join(", ");

    const msg = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 2500,
      system: `You invent content topic ideas for VAxAI Studio (UK, human-led operational admin support and AI readiness). VAxAI does not sell AI. Services: backlog recovery, AI readiness groundwork, ongoing admin support, maintain and improve. Free Admin Review first. Audiences: founders, SMEs, charities, public sector.
Return ONLY valid JSON: {"topics":[{"category":"...","title":"...","angle":"...","formats":["blog","linkedin"],"research_note":"..."}]}
category must be one of: ${categories}
title: short, scannable. angle: one practical sentence for a content brief.
formats: subset of blog, linkedin, instagram, facebook.
Do not invent client results or statistics. Prefer timely UK-relevant hooks when research supports them. UK English. No em dashes.`,
      messages: [
        {
          role: "user",
          content: `Generate ${count} NEW content library topics that are NOT duplicates of these existing titles:
${avoid.map((t) => `- ${t}`).join("\n")}

Public research signals (use lightly; do not invent citations as facts):
${research}

Mix categories. Ideas should feel fresh for 2026 UK organisations under admin and AI-readiness pressure.`,
        },
      ],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const start = text.indexOf("{");
    if (start === -1) {
      return NextResponse.json({ error: "AI returned no JSON" }, { status: 500 });
    }
    const parsed = JSON.parse(text.slice(start)) as { topics?: GenTopic[] };
    const raw = Array.isArray(parsed.topics) ? parsed.topics : [];

    const validCats = new Set(TOPIC_CATEGORIES.map((c) => c.id));
    const rows = raw
      .filter((t) => t.title?.trim() && t.angle?.trim() && validCats.has(t.category))
      .map((t, i) => {
        const base = slugify(t.title) || `ai-topic-${Date.now()}`;
        const id = `ai-${base}-${Date.now().toString(36)}-${i}`;
        const formats = (t.formats?.length ? t.formats : ["blog", "linkedin"]).filter((f) =>
          ["blog", "linkedin", "instagram", "facebook"].includes(f),
        );
        return {
          id,
          category: t.category,
          title: t.title.trim().slice(0, 160),
          angle: t.angle.trim().slice(0, 400),
          formats: formats.length ? formats : ["blog", "linkedin"],
          source: "ai" as const,
          status: "active" as const,
          research_note: t.research_note?.trim().slice(0, 500) || null,
        };
      });

    if (!rows.length) {
      return NextResponse.json({ error: "No valid topics generated" }, { status: 500 });
    }

    const { data, error } = await db.from("studio_content_topics").insert(rows).select("*");
    if (error) throw error;

    return NextResponse.json({ data: data ?? rows, research_used: research.length > 40 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
