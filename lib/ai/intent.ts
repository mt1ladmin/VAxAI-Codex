export type ChatIntent =
  | "factual"
  | "meeting_prep"
  | "draft"
  | "next_steps"
  | "summarise"
  | "analysis"
  | "general";

const PATTERNS: Array<{ intent: ChatIntent; re: RegExp }> = [
  { intent: "summarise", re: /\b(summar(?:y|ise|ize)|recap|overview of (?:the |this )?(?:chat|conversation|account))\b/i },
  { intent: "meeting_prep", re: /\b(call in|meeting prep|before (?:the |a )?call|prepare for|ahead of (?:the |a )?(?:call|meeting)|what do i need to know)\b/i },
  { intent: "draft", re: /\b(draft|write (?:an? |the )?(?:email|message|follow[- ]?up|proposal|wording)|follow[- ]?up (?:email|message))\b/i },
  { intent: "next_steps", re: /\b(next step|what should i do|recommended action|what to do|action plan)\b/i },
  { intent: "analysis", re: /\b(understand (?:what|how)|relationship|strategic|interpret|what(?:'s| is) happening|risks?)\b/i },
  { intent: "factual", re: /^(?:what|who|when|where|how much|is there|do (?:we|they) have)\b/i },
];

const ROUTING: Record<
  ChatIntent,
  { model: string; maxTokens: number; allowUpgrade: boolean }
> = {
  factual: { model: "claude-haiku-4-5-20251001", maxTokens: 280, allowUpgrade: false },
  next_steps: { model: "claude-haiku-4-5-20251001", maxTokens: 400, allowUpgrade: false },
  summarise: { model: "claude-haiku-4-5-20251001", maxTokens: 650, allowUpgrade: false },
  general: { model: "claude-haiku-4-5-20251001", maxTokens: 500, allowUpgrade: false },
  draft: { model: "claude-sonnet-4-6", maxTokens: 700, allowUpgrade: true },
  meeting_prep: { model: "claude-sonnet-4-6", maxTokens: 850, allowUpgrade: true },
  analysis: { model: "claude-sonnet-4-6", maxTokens: 1000, allowUpgrade: true },
};

const UPGRADE_MODELS = new Set(["claude-sonnet-4-6", "claude-opus-4-8"]);

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
  userModel?: string,
): { model: string; maxTokens: number; intent: ChatIntent } {
  const route = ROUTING[intent];
  if (userModel && UPGRADE_MODELS.has(userModel) && route.allowUpgrade) {
    const maxTokens =
      userModel === "claude-opus-4-8"
        ? Math.min(route.maxTokens + 400, 1400)
        : route.maxTokens;
    return { model: userModel, maxTokens, intent };
  }
  return { model: route.model, maxTokens: route.maxTokens, intent };
}