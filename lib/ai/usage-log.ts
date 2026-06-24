import type { ChatIntent } from "@/lib/ai/intent";
import type { createServiceClient } from "@/lib/supabase";

type Supabase = ReturnType<typeof createServiceClient>;

type UsagePayload = {
  sessionId?: string | null;
  contextType: string;
  contextId: string;
  intent: ChatIntent | string;
  model: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export async function logChatUsage(supabase: Supabase, usage: UsagePayload): Promise<void> {
  const { error } = await supabase.from("ai_chat_usage_log").insert({
    session_id: usage.sessionId ?? null,
    context_type: usage.contextType,
    context_id: usage.contextId,
    intent: usage.intent,
    model: usage.model,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
  });

  if (error) {
    console.error("ai_chat_usage_log insert failed:", error.message);
  }
}