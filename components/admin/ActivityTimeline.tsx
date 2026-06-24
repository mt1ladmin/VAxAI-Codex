"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { ChatHistoryModal } from "@/components/admin/ChatHistoryModal";
import {
  ACTIVITY_EVENT_DOT,
  fetchActivityLog,
  type ActivityLogEntry,
} from "@/lib/engagement/activity-log";
import { fetchChatActivity, type ChatActivitySnapshot } from "@/lib/engagement/chat-activity";
import { subscribeActivityRecorded } from "@/lib/engagement/activity-events";
import {
  buildUnifiedTimeline,
  type SeedEvent,
  type UnifiedActivityItem,
} from "@/lib/engagement/unified-activity";
import { STAGE_COLORS } from "@/lib/engagement/types";

type Props = {
  enquiryId?: string;
  queueId?: string;
  contactId?: string;
  chatContextType?: "enquiry" | "prospect" | "client";
  chatContextId?: string;
  refreshKey?: number;
  seedEvents?: SeedEvent[];
  emptyMessage?: string;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimelineRow({
  item,
  onOpenChat,
}: {
  item: UnifiedActivityItem;
  onOpenChat?: (item: UnifiedActivityItem) => void;
}) {
  const isChat = item.kind === "chat_snapshot";
  const stage =
    item.kind === "log" ? (item.logEntry?.metadata?.stage as string | undefined) : undefined;

  const dotClass =
    item.dotClass ??
    (item.kind === "log"
      ? ACTIVITY_EVENT_DOT[item.logEntry!.event_type]
      : item.kind === "seed"
        ? "bg-[#063b32]"
        : "bg-violet-500");

  const borderClass = isChat
    ? "border-violet-200/80 bg-violet-50/30 hover:bg-violet-50"
    : item.kind === "seed"
      ? "border-[#111111]/10 bg-[#f7f4ea]/50"
      : item.logEntry?.event_type === "ai_summary"
        ? "border-indigo-200/70 bg-indigo-50/25"
        : "border-[#111111]/10 bg-white";

  const content = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="mt-1 flex shrink-0 flex-col items-center gap-1">
        {isChat ? (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-violet-100">
            <Sparkles className="h-3.5 w-3.5 text-violet-700" />
          </div>
        ) : (
          <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${dotClass}`} aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-semibold leading-snug text-[#111111]">{item.title}</p>
          <time className="shrink-0 text-[11px] tabular-nums text-[#6f6b62]">
            {formatWhen(item.created_at)}
          </time>
        </div>

        {item.detail && (
          <p className="mt-1.5 text-sm leading-relaxed text-[#6f6b62] whitespace-pre-wrap">
            {item.detail}
          </p>
        )}

        {stage && (
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {stage}
          </span>
        )}

        {isChat && (
          <p className="mt-2 text-[11px] font-medium text-violet-700/80">View conversation</p>
        )}
      </div>

      {isChat && (
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-violet-400" aria-hidden />
      )}
    </div>
  );

  if (isChat && onOpenChat) {
    return (
      <button
        type="button"
        onClick={() => onOpenChat(item)}
        className={`flex w-full rounded-xl border px-4 py-3.5 text-left transition-colors ${borderClass}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`flex rounded-xl border px-4 py-3.5 ${borderClass}`}>
      {content}
    </div>
  );
}

export function ActivityTimeline({
  enquiryId,
  queueId,
  contactId,
  chatContextType,
  chatContextId,
  refreshKey = 0,
  seedEvents = [],
  emptyMessage = "No activity yet. Status changes, notes, and pipeline moves will appear here.",
}: Props) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [chatSnapshots, setChatSnapshots] = useState<ChatActivitySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatActivitySnapshot | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [logs, chats] = await Promise.all([
        fetchActivityLog({ enquiryId, queueId, contactId }),
        chatContextType && chatContextId
          ? fetchChatActivity(chatContextType, chatContextId)
          : Promise.resolve([]),
      ]);
      setEntries(logs);
      setChatSnapshots(chats);
    } finally {
      setLoading(false);
    }
  }, [enquiryId, queueId, contactId, chatContextType, chatContextId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => subscribeActivityRecorded(() => void load()), [load]);

  const snapshotById = useMemo(() => {
    const map: Record<string, ChatActivitySnapshot> = {};
    for (const c of chatSnapshots) map[c.id] = c;
    return map;
  }, [chatSnapshots]);

  const timeline = useMemo(
    () => buildUnifiedTimeline(seedEvents, entries, chatSnapshots),
    [seedEvents, entries, chatSnapshots],
  );

  const openChatForItem = (item: UnifiedActivityItem) => {
    const snap = snapshotById[item.id];
    if (snap) setSelectedChat(snap);
  };

  return (
    <div className="space-y-2">
      {loading &&
        [1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-[#111111]/8 px-4 py-3.5">
            <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-[#f7f4ea] animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-[#f7f4ea]" />
              <div className="h-3 w-1/4 rounded bg-[#f7f4ea]/80" />
            </div>
          </div>
        ))}

      {!loading &&
        timeline.map((item) => (
          <TimelineRow
            key={item.id}
            item={item}
            onOpenChat={item.kind === "chat_snapshot" ? openChatForItem : undefined}
          />
        ))}

      {!loading && timeline.length === 0 && (
        <p className="rounded-xl border border-dashed border-[#111111]/12 py-10 text-center text-sm text-[#6f6b62]/70">
          {emptyMessage}
        </p>
      )}

      {selectedChat && (
        <ChatHistoryModal
          open={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          snapshotId={selectedChat.id}
          sessionId={selectedChat.session_id}
          title={selectedChat.title ?? "VAxAI Assistant chat"}
          endedAt={selectedChat.ended_at}
        />
      )}
    </div>
  );
}