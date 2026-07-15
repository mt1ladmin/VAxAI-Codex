"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { fetchChatMessages, type ChatActivityMessage } from "@/lib/engagement/chat-activity";

function MessageBubble({ msg }: { msg: ChatActivityMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#122428] px-3.5 py-2.5 text-[13px] leading-relaxed text-white whitespace-pre-wrap break-words">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#111111]/8 bg-white shadow-sm">
        <Sparkles className="h-3 w-3 text-[#122428]" />
      </div>
      <div className="min-w-0 max-w-[85%] rounded-2xl rounded-bl-md border border-[#111111]/8 bg-[#faf9f6] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#111111] whitespace-pre-wrap break-words">
        {msg.content}
      </div>
    </div>
  );
}

export function ChatHistoryModal({
  open,
  onClose,
  sessionId,
  snapshotId,
  title,
  endedAt,
}: {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
  snapshotId?: string;
  title: string;
  endedAt: string;
}) {
  const [messages, setMessages] = useState<ChatActivityMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || (!sessionId && !snapshotId)) return;
    setLoading(true);
    setError(null);
    void fetchChatMessages({ sessionId, snapshotId })
      .then((data) => setMessages(data))
      .catch(() => setError("Could not load chat history."))
      .finally(() => setLoading(false));
  }, [open, sessionId, snapshotId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [messages, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center gap-3 border-b border-[#111111]/10 bg-[#122428] px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#D8FC2E]">
            <Sparkles className="h-4 w-4 text-[#122428]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-white/60">
              {new Date(endedAt).toLocaleString("en-GB")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#5F686A]" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error}</p>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#5F686A]">No messages in this chat.</p>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}
        </div>
      </div>
    </div>
  );
}