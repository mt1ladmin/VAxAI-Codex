"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ClipboardList, HelpCircle, Loader2, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import type { ProspectCallContext, CallAssistChatMessage } from "@/lib/engagement/call-context";

const SUGGESTED_PROMPTS = [
  "What context do we have on this contact?",
  "What pain points should I explore for this sector?",
  "Suggest an opening line for this call",
  "What VAT questions should I ask?",
  "Help me draft a new pain point from what they said",
];

type NoteType = "note" | "commitment" | "question";

type CallAssistChatProps = {
  callContext: ProspectCallContext | null;
  callType: string;
  orgName?: string;
  contactName?: string;
  recentNotes?: string[];
  onAddNote?: (text: string, type?: NoteType) => void;
  className?: string;
};

export function CallAssistChat({
  callContext,
  callType,
  orgName,
  contactName,
  recentNotes = [],
  onAddNote,
  className = "",
}: CallAssistChatProps) {
  const [messages, setMessages] = useState<CallAssistChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (callContext && messages.length === 0) {
      const sourceLabel =
        callContext.sourceType === "enquiry"
          ? "website enquiry"
          : callContext.sourceType === "queue"
            ? "prospect queue"
            : callContext.sourceType === "opportunity"
              ? "opportunity"
              : "connected record";
      const greeting: CallAssistChatMessage = {
        id: "welcome",
        role: "assistant",
        content: callContext.orgName
          ? `Ready for your ${callType} call with **${callContext.orgName}**${callContext.contactName ? ` (${callContext.contactName})` : ""}. Linked to a ${sourceLabel} — ask me for context, pain points, personas, VAT prompts, or what to say next. I pull from the knowledge hub and this record.`
          : "Ready to assist. Ask about context, pain points, sectors, personas, or call guidance.",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [callContext, callType]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: CallAssistChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    const nextMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    setMessages((prev) => [...prev.filter((m) => m.id !== "welcome"), userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/engagement/ai/call-assist-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          callContext,
          callType,
          orgName: orgName || callContext?.orgName,
          contactName: contactName || callContext?.contactName,
          recentNotes,
        }),
      });
      const json = await res.json() as { data?: { content: string }; error?: string };
      if (!res.ok) throw new Error(json.error || "Chat failed");

      const assistantMsg: CallAssistChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: json.data?.content || "No response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const saveInputAs = (type: NoteType) => {
    if (!input.trim() || !onAddNote) return;
    onAddNote(input.trim(), type);
    setInput("");
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center gap-2 border-b border-[#111111]/10 px-5 py-3 shrink-0 bg-white">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-100">
          <Bot className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111111]">Call assistant</p>
          <p className="text-[10px] text-[#6f6b62]">Knowledge hub + connected record context</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0 bg-[#faf9f6]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "ml-8 bg-[#063b32] text-white"
                : "mr-4 bg-white border border-[#111111]/10 text-[#111111] shadow-sm"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
            {msg.role === "assistant" && onAddNote && msg.id !== "welcome" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onAddNote(msg.content.slice(0, 500), "note")}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
                >
                  <MessageSquarePlus className="h-3 w-3" /> Note
                </button>
                <button
                  type="button"
                  onClick={() => onAddNote(msg.content.slice(0, 500), "commitment")}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline"
                >
                  <ClipboardList className="h-3 w-3" /> Commitment
                </button>
                <button
                  type="button"
                  onClick={() => onAddNote(msg.content.slice(0, 500), "question")}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:underline"
                >
                  <HelpCircle className="h-3 w-3" /> Question
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-xs text-violet-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5 shrink-0 bg-[#faf9f6]">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-[#111111]/10 p-4 shrink-0 bg-white">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
          placeholder="Ask about context, pain points, what to say, or help drafting…"
          rows={3}
          className="w-full resize-none rounded-lg border border-[#111111]/15 px-3 py-2.5 text-sm outline-none focus:border-[#063b32]"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {onAddNote && (
              <>
                <button
                  type="button"
                  onClick={() => saveInputAs("note")}
                  disabled={!input.trim()}
                  className="rounded-full border border-[#111111]/15 px-2.5 py-1 text-[10px] font-semibold text-[#6f6b62] hover:border-[#063b32]/30 disabled:opacity-40"
                >
                  Save as note
                </button>
                <button
                  type="button"
                  onClick={() => saveInputAs("commitment")}
                  disabled={!input.trim()}
                  className="rounded-full border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                >
                  Save commitment
                </button>
                <button
                  type="button"
                  onClick={() => saveInputAs("question")}
                  disabled={!input.trim()}
                  className="rounded-full border border-blue-200 px-2.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                >
                  Save question
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[9px] text-[#6f6b62]">
          <Sparkles className="h-3 w-3" /> Haiku · knowledge hub + DB context
        </p>
      </div>
    </div>
  );
}