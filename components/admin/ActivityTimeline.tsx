"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { ChatHistoryModal } from "@/components/admin/ChatHistoryModal";
import {
  ACTIVITY_EVENT_DOT,
  fetchActivityLog,
  type ActivityLogEntry,
} from "@/lib/engagement/activity-log";
import { fetchChatActivity, type ChatActivitySnapshot } from "@/lib/engagement/chat-activity";
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
  const [snapshotByTime, setSnapshotByTime] = useState<Record<string, ChatActivitySnapshot>>({});

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
      const map: Record<string, ChatActivitySnapshot> = {};
      for (const c of chats) {
        map[c.ended_at] = c;
      }
      setSnapshotByTime(map);
    } finally {
      setLoading(false);
    }
  }, [enquiryId, queueId, contactId, chatContextType, chatContextId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const timeline = useMemo(
    () => buildUnifiedTimeline(seedEvents, entries, chatSnapshots),
    [seedEvents, entries, chatSnapshots],
  );

  const openChatForItem = (item: UnifiedActivityItem) => {
    const snap = snapshotByTime[item.created_at];
    if (snap) setSelectedChat(snap);
  };

  return (
    <div className="space-y-3">
      {loading &&
        [1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-[#111111]/10 px-4 py-3">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#111111]/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-[#f7f4ea]" />
              <div className="h-3 w-1/3 rounded bg-[#f7f4ea]/80" />
            </div>
          </div>
        ))}

      {!loading &&
        timeline.map((item) => {
          const isChat = item.kind === "chat_snapshot";
          const stage =
            item.kind === "log" ? (item.logEntry?.metadata?.stage as string | undefined) : undefined;
          const dot =
            item.dotClass ??
            (item.kind === "log"
              ? ACTIVITY_EVENT_DOT[item.logEntry!.event_type]
              : item.kind === "seed"
                ? "bg-[#063b32]"
                : "bg-indigo-500");

          const inner = (
            <>
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                <p className="text-xs text-[#6f6b62]">
                  {new Date(item.created_at).toLocaleString("en-GB")}
                </p>
                {item.detail && (
                  <p className="mt-1 text-sm text-[#6f6b62] whitespace-pre-wrap">{item.detail}</p>
                )}
                {stage && (
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stage}
                  </span>
                )}
              </div>
              {isChat && (
                <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-[#6f6b62]" />
              )}
            </>
          );

          if (isChat) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openChatForItem(item)}
                className="flex w-full gap-3 rounded-lg border border-violet-200 bg-violet-50/40 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
              >
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100">
                  <Sparkles className="h-3 w-3 text-violet-700" />
                </div>
                {inner}
              </button>
            );
          }

          const borderClass =
            item.kind === "seed"
              ? "border-[#111111]/10 bg-[#f7f4ea]/40"
              : item.logEntry?.event_type === "ai_summary"
                ? "border-indigo-200 bg-indigo-50/30"
                : "border-[#111111]/10";

          return (
            <div key={item.id} className={`flex gap-3 rounded-lg border px-4 py-3 ${borderClass}`}>
              {inner}
            </div>
          );
        })}

      {!loading && timeline.length === 0 && (
        <p className="text-sm text-[#6f6b62]/60 py-4 text-center">{emptyMessage}</p>
      )}

      {selectedChat && (
        <ChatHistoryModal
          open={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          sessionId={selectedChat.session_id}
          title={selectedChat.title ?? "VAxAI Assistant chat"}
          endedAt={selectedChat.ended_at}
        />
      )}
    </div>
  );
}