"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import {
  fetchChatActivity,
  type ChatActivitySnapshot,
} from "@/lib/engagement/chat-activity";
import { ChatHistoryModal } from "@/components/admin/ChatHistoryModal";

export function ChatActivityList({
  contextType,
  contextId,
  refreshKey = 0,
}: {
  contextType: string;
  contextId: string;
  refreshKey?: number;
}) {
  const [items, setItems] = useState<ChatActivitySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChatActivitySnapshot | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchChatActivity(contextType, contextId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [contextType, contextId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setSelected(item)}
          className="flex w-full gap-3 rounded-lg border border-violet-200 bg-violet-50/40 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
        >
          <div className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100">
            <Sparkles className="h-3 w-3 text-violet-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111111]">
              {item.title ?? "VAxAI Assistant chat"}
            </p>
            <p className="text-xs text-[#6f6b62]">
              {new Date(item.ended_at).toLocaleString("en-GB")}
              {item.message_count > 0 ? ` · ${item.message_count} messages` : ""}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-[#6f6b62]" />
        </button>
      ))}

      {selected && (
        <ChatHistoryModal
          open={!!selected}
          onClose={() => setSelected(null)}
          sessionId={selected.session_id}
          title={selected.title ?? "VAxAI Assistant chat"}
          endedAt={selected.ended_at}
        />
      )}
    </>
  );
}