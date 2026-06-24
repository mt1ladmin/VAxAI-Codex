import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ARRAY_KEYS = [
  "known_priorities",
  "confirmed_pain_points",
  "services_discussed",
  "decisions",
  "commitments",
  "open_questions",
  "next_actions",
] as const;

export type AccountWorkingState = {
  current_position: string;
  known_priorities: string[];
  confirmed_pain_points: string[];
  services_discussed: string[];
  decisions: string[];
  commitments: string[];
  open_questions: string[];
  next_actions: string[];
  last_updated: string;
};

export const EMPTY_ACCOUNT_STATE: AccountWorkingState = {
  current_position: "",
  known_priorities: [],
  confirmed_pain_points: [],
  services_discussed: [],
  decisions: [],
  commitments: [],
  open_questions: [],
  next_actions: [],
  last_updated: "",
};

const EXTRACT_SYSTEM = `Extract a compact account working state from the provided text. Return ONLY valid JSON with these keys:
current_position (string, max 200 chars),
known_priorities, confirmed_pain_points, services_discussed, decisions, commitments, open_questions, next_actions (string arrays, max 5 items each).
Recorded facts only. Use empty string or empty arrays when unknown. No markdown.`;

function clipArray(items: string[], max = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.slice(0, 160));
    if (out.length >= max) break;
  }
  return out;
}

function normalizeState(raw: unknown): AccountWorkingState {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const state: AccountWorkingState = {
    current_position: String(obj.current_position ?? "").slice(0, 200),
    known_priorities: [],
    confirmed_pain_points: [],
    services_discussed: [],
    decisions: [],
    commitments: [],
    open_questions: [],
    next_actions: [],
    last_updated: new Date().toISOString(),
  };

  for (const key of ARRAY_KEYS) {
    const val = obj[key];
    state[key] = clipArray(Array.isArray(val) ? val.map(String) : []);
  }

  return state;
}

export function mergeAccountStates(
  existing: AccountWorkingState,
  incoming: AccountWorkingState,
): AccountWorkingState {
  const merged: AccountWorkingState = {
    current_position: incoming.current_position || existing.current_position,
    known_priorities: clipArray([...existing.known_priorities, ...incoming.known_priorities]),
    confirmed_pain_points: clipArray([
      ...existing.confirmed_pain_points,
      ...incoming.confirmed_pain_points,
    ]),
    services_discussed: clipArray([
      ...existing.services_discussed,
      ...incoming.services_discussed,
    ]),
    decisions: clipArray([...existing.decisions, ...incoming.decisions]),
    commitments: clipArray([...existing.commitments, ...incoming.commitments]),
    open_questions: clipArray([...existing.open_questions, ...incoming.open_questions]),
    next_actions: clipArray([...incoming.next_actions, ...existing.next_actions]),
    last_updated: new Date().toISOString(),
  };
  return merged;
}

function parseJsonFromText(text: string): AccountWorkingState | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return normalizeState(JSON.parse(match[0]));
  } catch {
    return null;
  }
}

export async function loadAccountState(
  supabase: Supabase,
  contextType: string,
  contextId: string,
): Promise<AccountWorkingState | null> {
  const { data } = await supabase
    .from("engagement_account_state")
    .select("state")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (!data?.state) return null;
  return normalizeState(data.state);
}

export async function upsertAccountState(
  supabase: Supabase,
  contextType: string,
  contextId: string,
  state: AccountWorkingState,
): Promise<void> {
  const payload = { ...state, last_updated: new Date().toISOString() };
  const { data: existing } = await supabase
    .from("engagement_account_state")
    .select("id")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("engagement_account_state")
      .update({ state: payload, last_updated: payload.last_updated })
      .eq("id", existing.id);
  } else {
    await supabase.from("engagement_account_state").insert({
      context_type: contextType,
      context_id: contextId,
      state: payload,
      last_updated: payload.last_updated,
    });
  }
}

export function formatAccountStateForContext(state: AccountWorkingState | null): string | null {
  if (!state) return null;

  const hasContent =
    state.current_position ||
    ARRAY_KEYS.some((k) => state[k].length > 0);

  if (!hasContent) return null;

  const lines: string[] = ["WORKING ACCOUNT STATE:"];
  if (state.current_position) lines.push(`Position: ${state.current_position}`);
  if (state.known_priorities.length) lines.push(`Priorities: ${state.known_priorities.join("; ")}`);
  if (state.confirmed_pain_points.length) {
    lines.push(`Pain points: ${state.confirmed_pain_points.join("; ")}`);
  }
  if (state.services_discussed.length) {
    lines.push(`Services discussed: ${state.services_discussed.join("; ")}`);
  }
  if (state.decisions.length) lines.push(`Decisions: ${state.decisions.join("; ")}`);
  if (state.commitments.length) lines.push(`Commitments: ${state.commitments.join("; ")}`);
  if (state.open_questions.length) lines.push(`Open questions: ${state.open_questions.join("; ")}`);
  if (state.next_actions.length) lines.push(`Next actions: ${state.next_actions.join("; ")}`);

  return lines.join("\n");
}

export async function extractAccountStateFromText(
  text: string,
  existing?: AccountWorkingState | null,
): Promise<AccountWorkingState | null> {
  if (!process.env.ANTHROPIC_API_KEY || !text.trim()) return null;

  const prior = existing
    ? `Existing state to merge with (keep still-valid items):\n${JSON.stringify(existing)}\n\n`
    : "";

  try {
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: [{ type: "text", text: EXTRACT_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `${prior}New information:\n${text.slice(0, 3000)}`,
        },
      ],
    });

    const raw = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    const parsed = parseJsonFromText(raw);
    if (!parsed) return null;
    return existing ? mergeAccountStates(existing, parsed) : parsed;
  } catch {
    return null;
  }
}

export async function refreshAccountStateFromSummary(
  supabase: Supabase,
  contextType: string,
  contextId: string,
  summaryText: string,
): Promise<void> {
  const existing = await loadAccountState(supabase, contextType, contextId);
  const next = await extractAccountStateFromText(summaryText, existing);
  if (next) await upsertAccountState(supabase, contextType, contextId, next);
}

export async function refreshAccountStateFromPackage(
  supabase: Supabase,
  contextType: string,
  contextId: string,
  contextPackage: string,
  sessionSummary?: string | null,
): Promise<boolean> {
  const existing = await loadAccountState(supabase, contextType, contextId);
  const source = [
    contextPackage.slice(0, 2500),
    sessionSummary ? `\nChat summary:\n${sessionSummary.slice(0, 800)}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const next = await extractAccountStateFromText(source, existing);
  if (!next) return false;
  await upsertAccountState(supabase, contextType, contextId, next);
  return true;
}

export type StaleAccountTarget = {
  context_type: string;
  context_id: string;
};

export async function findStaleAccountStates(
  supabase: Supabase,
  limit = 20,
): Promise<StaleAccountTarget[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await supabase
    .from("engagement_account_state")
    .select("context_type, context_id")
    .lt("last_updated", cutoff)
    .order("last_updated", { ascending: true })
    .limit(limit);

  const targets: StaleAccountTarget[] = (stale ?? []).map((r) => ({
    context_type: r.context_type as string,
    context_id: r.context_id as string,
  }));

  if (targets.length >= limit) return targets;

  const remaining = limit - targets.length;
  const seen = new Set(targets.map((t) => `${t.context_type}:${t.context_id}`));

  const { data: activeSessions } = await supabase
    .from("ai_chat_sessions")
    .select("context_type, context_id")
    .gte("last_message_at", cutoff)
    .order("last_message_at", { ascending: false })
    .limit(remaining * 2);

  for (const row of activeSessions ?? []) {
    const key = `${row.context_type}:${row.context_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { data: stateRow } = await supabase
      .from("engagement_account_state")
      .select("last_updated")
      .eq("context_type", row.context_type)
      .eq("context_id", row.context_id)
      .maybeSingle();

    if (!stateRow || stateRow.last_updated < cutoff) {
      targets.push({
        context_type: row.context_type as string,
        context_id: row.context_id as string,
      });
      if (targets.length >= limit) break;
    }
  }

  return targets;
}

/** Background refresh after a note is saved — does not block the response. */
export function scheduleAccountStateRefresh(
  contextType: string,
  contextId: string,
  summaryText: string,
) {
  after(async () => {
    const { createServiceClient } = await import("@/lib/supabase");
    const supabase = createServiceClient();
    await refreshAccountStateFromSummary(supabase, contextType, contextId, summaryText);
  });
}