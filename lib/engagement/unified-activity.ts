import type { ActivityLogEntry } from "@/lib/engagement/activity-log";

export type UnifiedActivityItem = {
  id: string;
  created_at: string;
  kind: "seed" | "log" | "chat_snapshot";
  title: string;
  detail?: string | null;
  dotClass?: string;
  logEntry?: ActivityLogEntry;
  messageCount?: number;
};

export type SeedEvent = {
  title: string;
  detail?: string;
  created_at: string;
  dotClass?: string;
};

export type ChatSnapshotItem = {
  id: string;
  title: string | null;
  ended_at: string;
  message_count: number;
};

export function buildUnifiedTimeline(
  seedEvents: SeedEvent[],
  logEntries: ActivityLogEntry[],
  chatSnapshots: ChatSnapshotItem[],
): UnifiedActivityItem[] {
  const items: UnifiedActivityItem[] = [];

  for (let i = 0; i < seedEvents.length; i++) {
    const e = seedEvents[i];
    items.push({
      id: `seed-${i}`,
      created_at: e.created_at,
      kind: "seed",
      title: e.title,
      detail: e.detail,
      dotClass: e.dotClass,
    });
  }

  for (const entry of logEntries) {
    items.push({
      id: entry.id,
      created_at: entry.created_at,
      kind: "log",
      title: entry.title,
      detail: entry.detail,
      logEntry: entry,
    });
  }

  for (const snap of chatSnapshots) {
    items.push({
      id: snap.id,
      created_at: snap.ended_at,
      kind: "chat_snapshot",
      title: snap.title ?? "VAxAI Assistant conversation",
      detail: `${snap.message_count} message${snap.message_count === 1 ? "" : "s"}`,
      messageCount: snap.message_count,
      dotClass: "bg-indigo-500",
    });
  }

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}