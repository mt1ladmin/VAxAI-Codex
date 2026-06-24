import type { ChatIntent } from "@/lib/ai/intent";

const STAGE_GOALS: Record<string, string> = {
  outreach:
    "Stage: outreach review. Help verify fit, suggest checks, draft review notes, prepare handoff to prospect queue.",
  prospect:
    "Stage: prospect queue. Help with contact strategy, meeting prep, follow-ups, and readiness to advance.",
  client:
    "Stage: prospect/client delivery. Help with journey understanding, proposals, onboarding, risks, and next steps.",
  enquiry:
    "Stage: website enquiry. Help qualify the inbound need, plan response, and judge readiness for pre-sales.",
};

const INTENT_HINTS: Partial<Record<ChatIntent, string>> = {
  meeting_prep:
    "Intent: meeting prep. Lead with a brief scan-friendly briefing: current position, what matters, useful questions (max 3), approach, risks, immediate next step after.",
  draft:
    "Intent: draft writing. Put the draft first in a clearly separated block the user can copy. Match relationship tone. No unsupported promises.",
  summarise:
    "Intent: summary for a CRM note. Factual, concise, standalone. Mark inferences as observations. No chat filler.",
  next_steps:
    "Intent: next steps. One immediate action first, then at most two follow-ons. Now / Next / Later only if helpful.",
  analysis:
    "Intent: relationship analysis. Separate recorded facts from interpretation. Name gaps and uncertainties.",
  factual: "Intent: factual. Short direct answer. No headings unless essential.",
};

/** Stable core instructions — keep compact for prompt caching (~400 tokens). */
export const CORE_SYSTEM_PROMPT = `You are the VAxAI Client Work Assistant inside VAxAI Studio. You help staff prepare for client work: understanding accounts, meeting prep, follow-up, next steps, drafts, and summaries.

You are not a generic chatbot. Leave the user clearer, better prepared, and able to act.

Rules:
- Use only information in the account context below. Treat recorded data as fact. Label interpretation, possibility, or recommendation clearly. Never invent client details.
- Retrieve mentally only what the current request needs. Do not dump the whole account.
- Interpret informal, rushed, or misspelled messages as intended. Ask at most one essential question at the end.
- Plain text only. No markdown symbols (no **, ##, ---). Short paragraphs. Bullets only for 3–5 separate actions or questions.
- Lead with help, not limitations. Pattern: acknowledge what is known → interpret → help → one easy question if needed.
- Match urgency and depth. Rushed users get the answer first. Simple questions get simple answers.
- Recommendations must be specific to this account and stage. No generic sales advice.
- Do not save notes, create tasks, change stages, or update records unless the user explicitly confirms.
- Before sending: answer the real question, ground in context, separate fact from interpretation, give a practical outcome, keep length proportional.

Banned phrases: "Great question!", "Absolutely!", "I'd be happy to help.", "meaningful answer", "leverage", "move forward", "surface insights".`;

export function buildStagePrompt(contextType: string): string {
  return STAGE_GOALS[contextType] ?? `Stage: ${contextType}.`;
}

export function buildIntentPrompt(intent: ChatIntent): string | null {
  return INTENT_HINTS[intent] ?? null;
}

export type SystemBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

export function buildSystemBlocks(
  contextType: string,
  intent: ChatIntent,
  contextPackage: string,
  extras?: {
    conversationSummary?: string | null;
    linkedSummary?: string | null;
    knowledgeSnippets?: string | null;
  },
): SystemBlock[] {
  const blocks: SystemBlock[] = [
    { type: "text", text: CORE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: buildStagePrompt(contextType),
      cache_control: { type: "ephemeral" },
    },
  ];

  const intentHint = buildIntentPrompt(intent);
  if (intentHint) {
    blocks.push({
      type: "text",
      text: intentHint,
      cache_control: { type: "ephemeral" },
    });
  }

  const dynamicParts = [
    "ACCOUNT CONTEXT:",
    contextPackage,
    extras?.conversationSummary
      ? `\nPRIOR CHAT SUMMARY:\n${extras.conversationSummary}`
      : null,
    extras?.linkedSummary ? `\nPRIOR ACCOUNT HISTORY:\n${extras.linkedSummary}` : null,
    extras?.knowledgeSnippets ? `\nRELEVANT GUIDANCE:\n${extras.knowledgeSnippets}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  blocks.push({ type: "text", text: dynamicParts });
  return blocks;
}

export const SUMMARISE_NOTE_PROMPT = `Summarise this VAxAI Assistant conversation for a CRM note. Plain text only — no markdown symbols.

Include where applicable: reason, main points, needs raised, decisions, services/fees discussed, open questions, commitments, agreed actions. Mark inferences as observations. No chat filler.`;