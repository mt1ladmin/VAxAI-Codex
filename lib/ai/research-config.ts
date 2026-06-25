/** Cost-optimised AI settings for research, VAxAI support, and engagement guide flows. */

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";

/** Prospect Finder discovery — compact JSON for 1–3 records. */
export const PROSPECT_DISCOVER_MAX_TOKENS = 2000;

/** Outreach assistant (research / support / engagement guide) — intent-capped Haiku only. */
export const OUTREACH_CHAT_MAX_TOKENS: Record<string, number> = {
  factual: 280,
  next_steps: 400,
  summarise: 650,
  general: 500,
  draft: 600,
  meeting_prep: 700,
  analysis: 750,
};

export const OUTREACH_CHAT_DEFAULT_MAX_TOKENS = 500;