"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import type { ProspectCallContext, CallAssistChatMessage } from "@/lib/engagement/call-context";

const SUGGESTED_PROMPTS = [
  "What pain points should I explore for this sector?",
  "Describe the likely persona for this contact",
  "Suggest an opening line for this call",
  "What VAT questions should I ask?",
  "Summarise what we know about this client",
];

type CallAssistChatProps = {
  callContext: ProspectCallContext | null;
  callType: string;
  orgName?: string;
  contactName?: string;
  recentNotes?: string[];
  onAddNote?: (text: string) => void;
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
      const greeting: CallAssistChatMessage = {
        id: "welcome",
        role: "assistant",
        content: callContext.orgName
          ? `Ready to assist on your call with **${callContext.orgName}**. Ask me about pain points, sectors, personas, VAT prompts, or what to say next — I'll pull from the knowledge hub and this client's context.`
          : "Ready to assist. Ask me anything about pain points, sectors, personas, or call guidance.",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [callContext]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center gap-2 border-b border-[#111111]/10 px-4 py-3 shrink-0">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-violet-100">
          <Bot className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#111111]">Call assistant</p>
          <p className="text-[10px] text-[#6f6b62]">Ask anything — pulls from knowledge hub &amp; client context</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl px-3 py-2.5 text-sm ${
              msg.role === "user"
                ? "ml-6 bg-[#063b32] text-white"
                : "mr-2 bg-[#f7f4ea] border border-[#111111]/10 text-[#111111]"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
            {msg.role === "assistant" && onAddNote && msg.id !== "welcome" && (
              <button
                type="button"
                onClick={() => onAddNote(msg.content.slice(0, 500))}
                className="mt-2 text-[10px] font-semibold text-[#063b32] hover:underline"
              >
                + Add to call notes
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-3 py-2.5 text-xs text-violet-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-[#111111]/10 p-3 shrink-0">
        <div className="flex gap-2">
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
            placeholder="Ask about pain points, persona, VAT, what to say…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="self-end rounded-lg bg-violet-600 px-3 py-2 text-white hover:bg-violet-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[9px] text-[#6f6b62]">
          <Sparkles className="h-3 w-3" /> Powered by knowledge hub — sector, persona, pain points, VAT
        </p>
      </div>
    </div>
  );
}