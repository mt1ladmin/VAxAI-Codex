export type ChatIntent =
  | "factual"
  | "meeting_prep"
  | "draft"
  | "next_steps"
  | "summarise"
  | "analysis"
  | "general";

/** How much DB context to load for each intent.
 *  0 = core fields only (fast, cheap)
 *  1 = core + open tasks
 *  2 = full package (tasks, activity, notes, knowledge snippets)
 */
export type ContextDepth = 0 | 1 | 2;

const PATTERNS: Array<{ intent: ChatIntent; re: RegExp }> = [
  { intent: "summarise", re: /\b(summar(?:y|ise|ize)|recap|overview of (?:the |this )?(?:chat|conversation|account))\b/i },
  { intent: "meeting_prep", re: /\b(call in|meeting prep|before (?:the |a )?call|prepare for|ahead of (?:the |a )?(?:call|meeting)|what do i need to know)\b/i },
  { intent: "draft", re: /\b(draft|write (?:an? |the )?(?:email|message|follow[- ]?up|proposal|wording)|follow[- ]?up (?:email|message))\b/i },
  { intent: "next_steps", re: /\b(next step|what should i do|recommended action|what to do|action plan)\b/i },
  { intent: "analysis", re: /\b(understand (?:what|how)|relationship|strategic|interpret|what(?:'s| is) happening|risks?)\b/i },
  { intent: "factual", re: /^(?:what|who|when|where|how much|is there|do (?:we|they) have)\b/i },
];

const ROUTING: Record<ChatIntent, { maxTokens: number; depth: ContextDepth }> = {
  factual:      { maxTokens: 150, depth: 0 },
  general:      { maxTokens: 250, depth: 0 },
  next_steps:   { maxTokens: 250, depth: 1 },
  summarise:    { maxTokens: 400, depth: 1 },
  draft:        { maxTokens: 600, depth: 2 },
  meeting_prep: { maxTokens: 700, depth: 2 },
  analysis:     { maxTokens: 750, depth: 2 },
};

// Keywords that escalate context depth by one level even on shallow intents
const DEPTH_ESCALATION_RE =
  /\b(sector|persona|research|knowledge|history|activity|task|notes|approach|engagement|pain|fit)\b/i;

export const HAIKU = "claude-haiku-4-5-20251001";

export function detectIntent(message: string): ChatIntent {
  const trimmed = message.trim();
  for (const { intent, re } of PATTERNS) {
    if (re.test(trimmed)) return intent;
  }
  if (trimmed.length < 60 && trimmed.endsWith("?")) return "factual";
  return "general";
}

export function resolveModelAndTokens(
  intent: ChatIntent,
): { model: string; maxTokens: number; intent: ChatIntent } {
  return { model: HAIKU, maxTokens: ROUTING[intent].maxTokens, intent };
}

export function resolveContextDepth(intent: ChatIntent, message: string): ContextDepth {
  const base = ROUTING[intent].depth;
  if (base < 2 && DEPTH_ESCALATION_RE.test(message)) {
    return (base + 1) as ContextDepth;
  }
  return base;
}
