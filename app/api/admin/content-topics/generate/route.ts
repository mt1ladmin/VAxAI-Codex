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

/** Calendar “today” for live conversation framing — always current year, not hard-coded. */
function liveContextNow(d = new Date()) {
  const year = d.getFullYear();
  const isoDate = d.toISOString().slice(0, 10);
  const longDate = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { year, isoDate, longDate };
}

async function fetchPageText(url: string, label: string, maxChars = 1400): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "VAxAI-Studio/1.0 (content research; +https://vaxai.co.uk)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxChars);
    if (text.length < 80) return null;
    return `[${label}] ${url}\n${text}`;
  } catch {
    return null;
  }
}

/**
 * Live public signals: AI readiness, admin backlogs, sector pressure, ongoing ops.
 * URLs stay evergreen; framing always uses today's year from the server clock.
 */
async function gatherLiveConversationSignals(year: number, longDate: string): Promise<string> {
  const snippets: string[] = [];
  const targets: { url: string; label: string }[] = [
    // AI readiness / public policy (live UK conversation)
    { url: "https://www.gov.uk/government/collections/ai-sector-opportunity", label: "UK gov AI opportunity" },
    { url: "https://www.gov.uk/government/publications/ai-opportunities-action-plan", label: "AI opportunities action plan" },
    { url: "https://www.gov.uk/guidance/understanding-artificial-intelligence-ai", label: "UK gov understanding AI" },
    // Charities / digital capacity
    { url: "https://www.ncvo.org.uk/help-and-guidance/digital-technology/", label: "NCVO digital technology" },
    // Access to Work (ongoing admin / workplace support)
    { url: "https://www.gov.uk/access-to-work", label: "Access to Work" },
    // Public sector AI / productivity themes
    { url: "https://www.gov.uk/government/publications/generative-ai-framework-for-hmg", label: "HMG generative AI framework" },
    // SME / business admin pressure (ICO, practical ops)
    { url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/", label: "ICO AI and data protection" },
  ];

  const results = await Promise.all(targets.map((t) => fetchPageText(t.url, t.label)));
  for (const s of results) {
    if (s) snippets.push(s);
  }

  // DuckDuckGo HTML lite search for *current* discussion queries (year injected live)
  const searchQueries = [
    `AI readiness organisations UK ${year}`,
    `admin backlog SME charity ${year}`,
    `public sector AI preparation information management ${year}`,
    `shared drive organisation before Copilot ${year}`,
  ];

  for (const q of searchQueries) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const snip = await fetchPageText(url, `Search: ${q}`, 900);
    if (snip) snippets.push(snip);
  }

  const header = `Research gathered on ${longDate} (server clock; year=${year}). Prefer conversations and guidance that still matter now. Do not invent publication dates. Join live UK discussions on AI readiness, admin backlogs, sector capacity, ongoing admin and maintenance — without hopping on viral trends.`;

  return snippets.length
    ? `${header}\n\n${snippets.join("\n\n")}`
    : `${header}\n\nNo live pages fetched. Still generate topics that speak to persistent VAxAI problems (backlog, readiness groundwork, ongoing admin, maintain) framed as relevant as of ${longDate}.`;
}

type GenTopic = {
  category: TopicCategoryId;
  title: string;
  angle: string;
  formats: string[];
  research_note?: string;
  conversation_hook?: string;
};

/**
 * Models often wrap JSON in fences or add trailing prose.
 * Extract the first complete top-level JSON object and parse it.
 */
function parseJsonObjectFromAiText(raw: string): { topics?: GenTopic[] } {
  let text = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();

  const start = text.indexOf("{");
  if (start === -1) throw new Error("AI returned no JSON");

  let inString = false;
  let escape = false;
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const candidate = end >= start ? text.slice(start, end + 1) : text.slice(start);
  try {
    return JSON.parse(candidate) as { topics?: GenTopic[] };
  } catch (first) {
    // Last resort: trim trailing junk after last closing brace if any
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace > start) {
      try {
        return JSON.parse(text.slice(start, lastBrace + 1)) as { topics?: GenTopic[] };
      } catch {
        /* fall through */
      }
    }
    throw first instanceof Error ? first : new Error("Could not parse AI JSON");
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAuth();
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
    }

    const body = (await req.json().catch(() => ({}))) as { count?: number };
    const count = Math.min(Math.max(body.count ?? 6, 3), 12);

    const { year, isoDate, longDate } = liveContextNow();
    const db = createServiceClient();
    const { data: existing } = await db
      .from("studio_content_topics")
      .select("id, title, status");

    const usedTitles = (existing ?? []).map((r) => r.title as string);
    const seedTitles = CONTENT_TOPICS.map((t) => t.title);
    const avoid = [...new Set([...usedTitles, ...seedTitles])].slice(0, 100);

    const research = await gatherLiveConversationSignals(year, longDate);
    const categories = TOPIC_CATEGORIES.map((c) => `${c.id} (${c.label})`).join("; ");

    const msg = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 3200,
      system: `You invent SEO-aware content topic ideas for VAxAI Studio (UK).

TODAY IS ${longDate} (ISO ${isoDate}, year ${year}). Always treat "now" as this date and year. Never hard-code a past year. When we are in a later year, topics must feel live for that year.

VAxAI does not sell AI. Services to speak to:
- backlog recovery
- AI readiness groundwork (organise information, data quality, document processes)
- ongoing admin support
- maintain and improve (so backlogs and broken automations do not return)
Free Admin Review first. Audiences: founders, SMEs, charities, public sector.

BALANCE
- Join live UK conversations on AI readiness, admin capacity, public sector information management, charity digital/admin pressure, founder ops — when research supports it.
- Do NOT hop on viral fads or one-day trends.
- Keep persistent problems (backlogs, messy drives, unowned admin, maintenance) but phrase them so they meet searches and discussions current as of today.
- SEO: titles and angles should match language people search and discuss now (${year}), not outdated hype.

Return ONLY a single JSON object. No markdown fences, no commentary before or after.
Shape:
{"topics":[{"category":"...","title":"...","angle":"...","formats":["blog","linkedin"],"research_note":"...","conversation_hook":"..."}]}

category must be one of: ${categories}
title: short, scannable. angle: one practical sentence for a content brief that someone could publish this week.
formats: subset of blog, linkedin, instagram, facebook.
research_note: optional, what live theme or guidance this sits near (no fake stats).
conversation_hook: optional, the live discussion or search intent this joins (e.g. "AI readiness before Copilot rollout").
UK English. No em dashes. No invented client results.`,
      messages: [
        {
          role: "user",
          content: `Generate ${count} NEW content library topics for publishing around ${longDate}.

Do NOT duplicate these existing titles:
${avoid.map((t) => `- ${t}`).join("\n")}

Live research signals (fetched today — use carefully; do not invent citations as hard facts):
${research}

Mix categories across backlog, AI readiness, ongoing admin, maintain, audiences and positioning.
About half should clearly join a live ${year} conversation; the rest should be persistent operational themes still searched and felt now.
Every topic must still be useful if read months later, but relevant if published this week.`,
        },
      ],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: { topics?: GenTopic[] };
    try {
      parsed = parseJsonObjectFromAiText(text);
    } catch (e) {
      const detail = e instanceof Error ? e.message : "parse failed";
      return NextResponse.json(
        { error: `Could not read AI topics (${detail}). Try Refresh topics again.` },
        { status: 500 },
      );
    }
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
        const hook = t.conversation_hook?.trim().slice(0, 300) || null;
        const researchNote = t.research_note?.trim().slice(0, 500) || null;
        // Always stamp with generation day so library stays “as of now”, not a fixed year
        const datedNote = researchNote
          ? `As of ${longDate}: ${researchNote}`
          : `As of ${longDate}: live conversation / SEO angle for ${year}`;

        return {
          id,
          category: t.category,
          title: t.title.trim().slice(0, 160),
          angle: t.angle.trim().slice(0, 400),
          formats: formats.length ? formats : ["blog", "linkedin"],
          source: "ai" as const,
          status: "active" as const,
          research_note: datedNote.slice(0, 500),
          conversation_hook: hook,
          live_as_of: isoDate,
        };
      });

    if (!rows.length) {
      return NextResponse.json({ error: "No valid topics generated" }, { status: 500 });
    }

    const { data, error } = await db.from("studio_content_topics").insert(rows).select("*");
    if (error) {
      // Fallback if migration for live_as_of / conversation_hook not applied yet
      if (error.message?.includes("live_as_of") || error.message?.includes("conversation_hook")) {
        const slim = rows.map(({ live_as_of: _a, conversation_hook: _b, ...r }) => r);
        const retry = await db.from("studio_content_topics").insert(slim).select("*");
        if (retry.error) throw retry.error;
        return NextResponse.json({
          data: retry.data ?? slim,
          live_as_of: isoDate,
          year,
          research_used: research.length > 80,
          note: "Run migration 20260806_studio_content_topics_live_as_of.sql to store live_as_of and conversation_hook.",
        });
      }
      throw error;
    }

    return NextResponse.json({
      data: data ?? rows,
      live_as_of: isoDate,
      year,
      research_used: research.length > 80,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
