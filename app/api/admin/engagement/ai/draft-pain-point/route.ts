import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { PAIN_POINT_CATEGORIES } from "@/lib/engagement/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { phrase, orgContext, callNotes, sourceCallId, sourceOrgId } = await req.json() as {
    phrase: string;
    orgContext?: string;
    callNotes?: string;
    sourceCallId?: string;
    sourceOrgId?: string;
  };

  const categories = PAIN_POINT_CATEGORIES.join(", ");

  // Usefulness gate for "draft-pain-point" AI area (knowledge base contribution, less frequent)
  if (!phrase?.trim() || phrase.trim().length < 12) {
    return NextResponse.json({ error: "Input too short for useful AI draft" }, { status: 400 });
  }

  // DB cache check: if this exact phrase was already drafted recently, return it instead of new AI call (cost reduction + consistency for engagement knowledge)
  const supabaseCheck = createServiceClient();
  const { data: existing } = await supabaseCheck
    .from("engagement_knowledge_drafts")
    .select("*")
    .eq("source_phrase", phrase)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ data: existing });
  }

  // Keep stronger model (Sonnet) here: this creates structured, reviewable knowledge for future client engagement. Higher value justifies cost vs routine tasks.
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `You are helping a Virtual Assistant consultancy (VAxAI) build their knowledge library of client pain points.

A consultant encountered this phrase or situation during a call that doesn't match any existing pain point:
"${phrase}"

${orgContext ? `Organisation context: ${orgContext}` : ""}
${callNotes ? `Call notes for context: ${callNotes}` : ""}

Create a draft pain point entry for their knowledge library. This is a DRAFT for human review — be careful, thoughtful, and flag uncertainty.

Categories to choose from: ${categories}

Return as JSON with these exact fields:
{
  "category": "one of the categories above",
  "title": "Short descriptive title (max 8 words)",
  "plain_english_definition": "2-3 sentence plain explanation of what this pain point is",
  "what_person_says": ["phrase they might use 1", "phrase 2", "phrase 3"],
  "what_this_means": ["what this actually means for their operations 1", "point 2"],
  "what_not_assume": ["thing NOT to assume 1", "thing NOT to assume 2"],
  "common_root_causes": ["root cause 1", "root cause 2"],
  "natural_questions": ["discovery question 1", "question 2", "question 3"],
  "possible_automation": ["automation idea 1", "idea 2"],
  "possible_ai": ["AI assistance idea 1"],
  "human_va_responsibilities": ["VA support role 1", "role 2"],
  "recommendation_pathways": ["suggested next step 1", "step 2"],
  "tags": ["relevant tag 1", "tag 2"]
}

This will go to a human reviewer before being added to the library. Be honest about uncertainty.`
    }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find(b => b.type === "text") as { type: string; text: string } | undefined;

  if (!text?.text) {
    return NextResponse.json({ error: "No content generated" }, { status: 500 });
  }

  let draft: Record<string, unknown>;
  try {
    draft = JSON.parse(text.text.match(/\{[\s\S]*\}/)?.[0] || "{}") as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("engagement_knowledge_drafts")
    .insert({
      source_phrase: phrase,
      source_call_id: sourceCallId || null,
      source_org_id: sourceOrgId || null,
      status: "pending_review",
      ...draft,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
