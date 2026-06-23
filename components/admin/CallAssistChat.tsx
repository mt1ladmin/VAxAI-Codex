"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { ProspectCallContext, CallAssistChatMessage } from "@/lib/engagement/call-context";

type CallAssistChatProps = {
  callContext: ProspectCallContext | null;
  callType: string;
  orgName?: string;
  contactName?: string;
  messages: CallAssistChatMessage[];
  onMessagesChange: (messages: CallAssistChatMessage[]) => void;
  className?: string;
  placeholder?: string;
};

export function CallAssistChat({
  callContext,
  callType,
  orgName,
  contactName,
  messages,
  onMessagesChange,
  className = "",
  placeholder = "Message…",
}: CallAssistChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!callContext || bootstrapped.current || messages.length > 0) return;
    bootstrapped.current = true;
    const label = orgName || callContext.orgName;
    const contact = contactName || callContext.contactName;
    const greeting: CallAssistChatMessage = {
      id: "welcome",
      role: "assistant",
      content: label
        ? `You're on a ${callType} call with ${label}${contact ? ` (${contact})` : ""}. Ask for context, talking points, or type anything you want to capture — I'll help throughout the call.`
        : "Ask for context or guidance whenever you need it.",
      timestamp: new Date(),
    };
    onMessagesChange([greeting]);
  }, [callContext, callType, orgName, contactName, messages.length, onMessagesChange]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: CallAssistChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    const history = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    onMessagesChange([...messages.filter((m) => m.id !== "welcome"), userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/engagement/ai/call-assist-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          callContext,
          callType,
          orgName: orgName || callContext?.orgName,
          contactName: contactName || callContext?.contactName,
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
      onMessagesChange([...history, assistantMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#063b32] text-white"
                    : "bg-[#f7f4ea] text-[#111111]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-[#f7f4ea] px-4 py-3 text-sm text-[#6f6b62]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#111111]/10 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-end gap-3 rounded-2xl border border-[#111111]/15 bg-white px-4 py-3 shadow-sm focus-within:border-[#063b32]/40 transition-colors">
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
              placeholder={placeholder}
              rows={1}
              className="flex-1 resize-none bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-[#6f6b62]/60 min-h-[24px] max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || loading}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#063b32] text-white hover:bg-[#1a5c42] disabled:opacity-30 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}