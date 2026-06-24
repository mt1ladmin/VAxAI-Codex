export type ChatActivitySnapshot = {
  id: string;
  session_id: string;
  context_type: string;
  context_id: string;
  title: string | null;
  message_count: number;
  ended_at: string;
  created_at: string;
};

export type ChatActivityMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string | null;
  created_at: string;
};

export async function fetchChatActivity(
  contextType: string,
  contextId: string,
): Promise<ChatActivitySnapshot[]> {
  const res = await fetch(
    `/api/admin/ai/chat/activity?context_type=${encodeURIComponent(contextType)}&context_id=${encodeURIComponent(contextId)}`,
  );
  const json = (await res.json()) as { data?: ChatActivitySnapshot[] };
  return json.data ?? [];
}

export async function recordChatSnapshot(
  contextType: string,
  contextId: string,
  sessionId: string,
  messageCount: number,
): Promise<void> {
  if (!sessionId || messageCount <= 0) return;
  await fetch("/api/admin/ai/chat/snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contextType, contextId, sessionId, messageCount }),
  });
}

export async function fetchChatMessages(
  opts: { sessionId?: string; snapshotId?: string },
): Promise<ChatActivityMessage[]> {
  const params = new URLSearchParams();
  if (opts.snapshotId) params.set("snapshot_id", opts.snapshotId);
  else if (opts.sessionId) params.set("session_id", opts.sessionId);
  else return [];

  const res = await fetch(`/api/admin/ai/chat/messages?${params}`);
  const json = (await res.json()) as { data?: ChatActivityMessage[] };
  return json.data ?? [];
}