import type { SupabaseClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/engagement/activity-log";

type ServiceClient = SupabaseClient;

export async function archiveSessionMessages(
  supabase: ServiceClient,
  sessionId: string,
  snapshotId: string,
): Promise<void> {
  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("role, content, model, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (!messages?.length) return;

  await supabase.from("ai_chat_snapshot_messages").insert(
    messages.map((msg, index) => ({
      snapshot_id: snapshotId,
      role: msg.role,
      content: msg.content,
      model: msg.model,
      created_at: msg.created_at,
      sort_order: index,
    })),
  );
}

export async function createChatSnapshotWithArchive(
  supabase: ServiceClient,
  input: {
    sessionId: string;
    contextType: string;
    contextId: string;
    messageCount: number;
    endedAt?: string;
    logToActivity?: boolean;
  },
): Promise<{ snapshotId: string | null; skipped: boolean }> {
  const { sessionId, contextType, contextId, messageCount } = input;
  if (messageCount <= 0) return { snapshotId: null, skipped: true };

  const { data: latest } = await supabase
    .from("ai_chat_activity_snapshots")
    .select("id, message_count")
    .eq("session_id", sessionId)
    .order("ended_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest && latest.message_count >= messageCount) {
    return { snapshotId: latest.id, skipped: true };
  }

  const endedAt = input.endedAt ?? new Date().toISOString();
  const title = `VAxAI Assistant chat (${messageCount} message${messageCount === 1 ? "" : "s"})`;

  const { data: snapshot, error } = await supabase
    .from("ai_chat_activity_snapshots")
    .insert({
      session_id: sessionId,
      context_type: contextType,
      context_id: contextId,
      title,
      message_count: messageCount,
      ended_at: endedAt,
    })
    .select("id")
    .single();

  if (error || !snapshot) return { snapshotId: null, skipped: false };

  await archiveSessionMessages(supabase, sessionId, snapshot.id);

  if (input.logToActivity !== false) {
    const activityIds =
      contextType === "enquiry"
        ? { enquiry_id: contextId }
        : contextType === "prospect"
          ? { queue_id: contextId }
          : contextType === "client"
            ? { contact_id: contextId }
            : contextType === "outreach"
              ? { outreach_id: contextId }
              : {};

    await logActivity(supabase, {
      event_type: "ai_summary",
      title: "VAxAI Assistant conversation recorded",
      detail: `${messageCount} message${messageCount === 1 ? "" : "s"} saved to activity timeline`,
      metadata: { message_count: messageCount, session_id: sessionId, snapshot_id: snapshot.id },
      ...activityIds,
    });
  }

  return { snapshotId: snapshot.id, skipped: false };
}