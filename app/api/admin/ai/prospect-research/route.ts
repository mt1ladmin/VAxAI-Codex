import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ProspectResearchResult = {
  companyOverview: string;
  recentNews: string[];
  contactBackground: string;
  sectorSignals: string[];
  suggestedPrepNotes: string;
  suggestedSectorId: string | null;
  suggestedPersonaId: string | null;
  suggestedPainPointIds: string[];
  sources: string[];
  webSearchUnavailable?: boolean;
};

function extractJson(text: string): ProspectResearchResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as ProspectResearchResult;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = (await req.json()) as {
    orgName: string;
    contactName?: string;
    email?: string;
    industry?: string;
    location?: string;
    existingNotes?: string;
  };

  const { orgName, contactName, email, industry, location, existingNotes } = body;

  if (!orgName?.trim()) {
    return NextResponse.json({ error: "orgName is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const [painRes, sectorRes, personaRes] = await Promise.all([
    supabase
      .from("engagement_pain_points")
      .select("id, title, category, plain_english_definition")
      .limit(100),
    supabase
      .from("engagement_sector_profiles")
      .select("id, name, description")
      .limit(30),
    supabase
      .from("engagement_personas")
      .select("id, persona_name, typical_role, goals, pressures")
      .limit(20),
  ]);

  const painKb = (painRes.data ?? [])
    .map((pp) => `[${pp.id}] ${pp.title} (${pp.category}): ${(pp.plain_english_definition as string | null)?.slice(0, 120) ?? ""}`)
    .join("\n");
  const sectorKb = (sectorRes.data ?? [])
    .map((s) => `[${s.id}] ${s.name}: ${(s.description as string | null)?.slice(0, 100) ?? ""}`)
    .join("\n");
  const personaKb = (personaRes.data ?? [])
    .map((p) => `[${p.id}] ${p.persona_name} — ${p.typical_role ?? ""}: Goals: ${(p.goals as string[] | null)?.slice(0, 2).join(", ") ?? ""}`)
    .join("\n");

  const contextLines = [
    `Organisation: ${orgName}`,
    contactName ? `Contact: ${contactName}` : null,
    email ? `Email domain: ${email.split("@")[1] ?? email}` : null,
    industry ? `Industry/sector: ${industry}` : null,
    location ? `Location: ${location}` : null,
    existingNotes ? `Existing notes: ${existingNotes.slice(0, 500)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `You are a prospect research assistant for VAxAI — a virtual assistant (VA) services company helping small businesses, entrepreneurs, and executives with administration, operations, and business growth. VAxAI's approach follows the VAT framework: Value (demonstrate clear ROI), Alignment (match their specific context), Trust (build credibility).

Research the prospect below and produce a structured brief. Investigate:
1. What the organisation actually does, size/stage, and key focus areas
2. Recent developments — news, funding, growth, leadership, or business challenges
3. The contact person's background, seniority, and typical concerns for their role
4. Current pressures and trends in their industry that VAxAI could address

Then match findings to the VAxAI knowledge base to identify the best-fit sector, persona, and pain points.

Return ONLY valid JSON with this exact structure:
{
  "companyOverview": "2-3 sentence description of what they do and where they are",
  "recentNews": ["bullet about recent development or context", "another bullet if found"],
  "contactBackground": "1-2 sentences about the contact's role and typical priorities",
  "sectorSignals": ["sector-specific pressure or challenge found", "another signal"],
  "suggestedPrepNotes": "Ready-to-use prep brief with these sections:\\n\\nBACKGROUND\\n[what they do, size, stage]\\n\\nKEY CONTEXT\\n[bullets: news, contact background, sector signals]\\n\\nAPPROACH ANGLE\\n[VAT-aligned positioning — what VAxAI can offer this specific prospect based on their situation]",
  "suggestedSectorId": "exact-id-from-kb-or-null",
  "suggestedPersonaId": "exact-id-from-kb-or-null",
  "suggestedPainPointIds": ["exact-id1", "exact-id2", "exact-id3"],
  "sources": ["url1", "url2"]
}

Use ONLY real IDs from the knowledge base below. If no good match exists, use null or empty array.

SECTORS:
${sectorKb}

PERSONAS:
${personaKb}

PAIN POINTS:
${painKb}`;

  const userMessage = `Research this prospect:\n\n${contextLines}`;

  // Attempt 1: with web_search
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305" as any, name: "web_search" }],
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    const data = extractJson(text);
    if (data) {
      return NextResponse.json({ data });
    }
    throw new Error("Could not parse research response");
  } catch (err) {
    // Attempt 2: KB-only analysis (no web search) — still much smarter than keyword matching
    try {
      const fallbackResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: systemPrompt.replace(
          "Research the prospect below and produce a structured brief. Investigate:\n1. What the organisation actually does, size/stage, and key focus areas\n2. Recent developments — news, funding, growth, leadership, or business challenges\n3. The contact person's background, seniority, and typical concerns for their role\n4. Current pressures and trends in their industry that VAxAI could address",
          "Based on the prospect details below (no web access available), use your general knowledge and the VAxAI knowledge base to produce a structured brief. Infer likely context from the organisation name, industry, and any notes provided.",
        ),
        messages: [
          {
            role: "user",
            content: `${userMessage}\n\nNote: Web search is unavailable — please infer from the details provided and general knowledge.`,
          },
        ],
      });

      const text = fallbackResponse.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n");

      const data = extractJson(text);
      if (data) {
        return NextResponse.json({ data: { ...data, webSearchUnavailable: true } });
      }
      throw new Error("Fallback parse failed");
    } catch {
      return NextResponse.json(
        { error: "Research failed — please fill in the prep manually." },
        { status: 500 },
      );
    }
  }
}
