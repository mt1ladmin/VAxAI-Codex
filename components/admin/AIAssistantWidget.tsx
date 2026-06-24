"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  BookmarkPlus,
  ChevronDown,
  Loader2,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { SaveSummaryModal } from "@/components/admin/SaveSummaryModal";
import {
  contextsEqual,
  useAIAssistantContext,
  usePersistWidgetOpen,
  type AIContext,
  type AIContextType,
} from "@/lib/ai-assistant-context";
import { assistantParagraphs } from "@/lib/ai/format-message";
import { recordChatSnapshot } from "@/lib/engagement/chat-activity";
import { notifyActivityRecorded, notifyNotesSaved } from "@/lib/engagement/activity-events";

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string | null;
  created_at: string;
};

type AISession = {
  id: string;
  summary: string | null;
  message_count: number;
};

type SearchResult = {
  type: "enquiry" | "client" | "prospect";
  id: string;
  label: string;
  sublabel: string | null;
  status: string | null;
};

const MODEL_OPTIONS = [
  { id: "claude-haiku-4-5-20251001", label: "Auto", note: "Routes by task" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", note: "Deeper analysis" },
  { id: "claude-opus-4-8", label: "Opus 4.8", note: "Most capable" },
];

const TYPE_BADGE: Record<string, string> = {
  enquiry: "bg-violet-100 text-violet-700",
  client: "bg-[#063b32]/10 text-[#063b32]",
  prospect: "bg-amber-100 text-amber-700",
};

const TYPE_DOT: Record<string, string> = {
  enquiry: "bg-violet-500",
  client: "bg-[#063b32]",
  prospect: "bg-amber-500",
};

type PanelSize = "large" | "xl";

const PANEL_SIZES: Record<PanelSize, { width: number; height: number }> = {
  large: { width: 500, height: 640 },
  xl: { width: 620, height: 760 },
};

const PANEL_MIN = { width: 380, height: 420 };
const PANEL_MAX = { width: 920, height: 900 };

const TYPE_LABEL: Record<string, string> = {
  outreach: "Outreach review",
  enquiry: "Enquiry",
  client: "Prospect/Client",
  prospect: "Prospect outreach",
};

const SUGGESTED: Record<string, string[]> = {
  outreach: [
    "Is this prospect a good fit for VAxAI? What should I verify?",
    "Draft review notes for the team before I add to queue",
    "Which Knowledge Hub sectors and pain points apply?",
    "Summarize the admin/AI need in plain language for outreach",
  ],
  enquiry: [
    "What are the key themes in this enquiry?",
    "What's the best strategy to convert them?",
    "Write me a summary to prepare for the prospect call",
    "Write a next action summary based on this enquiry",
  ],
  client: [
    "Summarize the full journey from first contact to now",
    "What Knowledge Hub content applies to this client?",
    "Draft a proposal outline from our notes and agreed scope",
    "What are the risks and next strategic actions?",
  ],
  prospect: [
    "What's the best approach for first contact?",
    "They showed interest — what should the next step be?",
    "Draft a follow-up email based on our research",
    "Are they ready to advance to client work? What's missing?",
  ],
  default: [
    "Search for an account above to get started.",
  ],
};

function guessSummaryTitle(userMessage: string | undefined): string {
  const lower = (userMessage ?? "").toLowerCase();
  if (lower.includes("prospect call") || lower.includes("prepare for")) {
    return "Prospect call prep summary";
  }
  if (lower.includes("next action")) return "Next action summary";
  if (lower.includes("summary")) return "AI chat summary";
  return "AI summary";
}

function buildContextSummary(
  type: AIContextType,
  label: string | null,
): string {
  return `Context type: ${type ?? "unknown"} | Name: ${label ?? "unknown"}`;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#6f6b62]/50 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function ChatMessage({
  msg,
  onSaveToNotes,
}: {
  msg: AIMessage;
  onSaveToNotes?: (content: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-[#063b32] px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm whitespace-pre-wrap break-words">
          {msg.content}
        </div>
      </div>
    );
  }

  const paragraphs = assistantParagraphs(msg.content);

  return (
    <div className="flex gap-2.5 pr-2">
      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#111111]/8 bg-white shadow-sm">
        <Sparkles className="h-3 w-3 text-[#063b32]" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="max-w-full overflow-hidden rounded-2xl rounded-bl-md border border-[#111111]/8 bg-[#faf9f6] px-3.5 py-2.5 text-[13px] leading-[1.65] text-[#111111] break-words space-y-2.5">
          {paragraphs.map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>
        {onSaveToNotes && (
          <button
            type="button"
            onClick={() => onSaveToNotes(msg.content)}
            className="flex items-center gap-1.5 rounded-lg border border-[#063b32]/15 px-2.5 py-1 text-[11px] font-semibold text-[#063b32] hover:bg-[#063b32]/5"
          >
            <BookmarkPlus className="h-3 w-3" />
            Save to notes
          </button>
        )}
      </div>
    </div>
  );
}

// ── Inner chat panel ──────────────────────────────────────────────────────────

function ChatPanel({
  contextType,
  contextId,
  contextLabel,
  contextSummary,
  allowModelUpgrade,
  onChangeContext,
  showContextSwitcher = true,
  showNewChatButton = false,
  onNewChat,
  onChatStarted,
  onNotesSaved,
  onActivityRecorded,
}: {
  contextType: string;
  contextId: string;
  contextLabel: string;
  contextSummary: string;
  allowModelUpgrade: boolean;
  onChangeContext: () => void;
  showContextSwitcher?: boolean;
  showNewChatButton?: boolean;
  onNewChat?: () => void;
  onChatStarted?: () => void;
  onNotesSaved?: () => void;
  onActivityRecorded?: () => void;
}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [session, setSession] = useState<AISession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [model, setModel] = useState("claude-haiku-4-5-20251001");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [error, setError] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveSummary, setSaveSummary] = useState("");
  const [summariseModalOpen, setSummariseModalOpen] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef({ sessionId: "", messageCount: 0 });
  const lastUserMessageRef = useRef("");

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const res = await fetch(
        `/api/admin/ai/chat/session?context_type=${contextType}&context_id=${contextId}`,
      );
      const json = (await res.json()) as {
        data?: { session: AISession; messages: AIMessage[] };
        error?: string;
      };
      if (!res.ok || !json.data) {
        setSessionError(json.error ?? "Failed to load chat session.");
        return;
      }
      setSession(json.data.session);
      setMessages(json.data.messages);
    } catch {
      setSessionError("Could not connect to the chat service.");
    } finally {
      setSessionLoading(false);
    }
  }, [contextType, contextId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session) {
      snapshotRef.current = {
        sessionId: session.id,
        messageCount: session.message_count ?? messages.length,
      };
    }
  }, [session, messages.length]);

  useEffect(() => {
    if (!sessionLoading && messages.length > 0) {
      onChatStarted?.();
    }
  }, [sessionLoading, messages.length, onChatStarted]);

  const takeSnapshot = useCallback(async () => {
    const { sessionId, messageCount } = snapshotRef.current;
    if (!sessionId || messageCount <= 0) return;
    await recordChatSnapshot(contextType, contextId, sessionId, messageCount);
    onActivityRecorded?.();
    notifyActivityRecorded();
  }, [contextType, contextId, onActivityRecorded]);

  useEffect(() => {
    return () => {
      void takeSnapshot();
    };
  }, [takeSnapshot]);

  useEffect(() => {
    const onPageHide = () => {
      void takeSnapshot();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [takeSnapshot]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    if (!showModelMenu) return;
    const close = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showModelMenu]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    lastUserMessageRef.current = text;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setError("");
    setSending(true);

    const optimistic: AIMessage = {
      id: `opt-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType,
          contextId,
          message: text,
          model: model === "claude-haiku-4-5-20251001" ? undefined : model,
        }),
      });
      const json = (await res.json()) as {
        data?: {
          userMessage: AIMessage;
          assistantMessage: AIMessage;
          session: AISession;
        };
        error?: string;
      };
      if (!res.ok || !json.data) {
        setError(json.error ?? "Something went wrong — please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        return;
      }
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        json.data!.userMessage,
        json.data!.assistantMessage,
      ]);
      setSession(json.data.session);
      const nextCount = json.data.session.message_count ?? 0;
      snapshotRef.current = {
        sessionId: json.data.session.id,
        messageCount: nextCount,
      };
      onChatStarted?.();
    } catch {
      setError("Network error — please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const openSaveModal = (assistantContent: string) => {
    setSaveTitle(guessSummaryTitle(lastUserMessageRef.current));
    setSaveSummary(assistantContent);
    setSaveModalOpen(true);
  };

  const confirmSaveToNotes = async (title: string, summary: string) => {
    if (contextType === "general" || contextId === "general") {
      throw new Error(
        "Open an enquiry, prospect, client, or Prospect Queue record before saving to notes.",
      );
    }

    const res = await fetch("/api/admin/ai/chat/save-to-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextType, contextId, title, summary }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(json.error ?? "Failed to save to notes");

    setSaveNotice("Saved to notes");
    window.setTimeout(() => setSaveNotice(null), 4000);

    notifyNotesSaved({ contextType, contextId });
    onNotesSaved?.();
    onActivityRecorded?.();
    notifyActivityRecorded();
  };

  const openSummariseModal = async () => {
    if (messages.length === 0 || summarising) return;
    setSummarising(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/chat/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context_type: contextType, context_id: contextId }),
      });
      const json = (await res.json()) as { title?: string; summary?: string; error?: string };
      if (!res.ok || !json.summary) throw new Error(json.error ?? "Could not summarise conversation");
      setSaveTitle(json.title ?? "Conversation summary");
      setSaveSummary(json.summary);
      setSummariseModalOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not summarise conversation");
    } finally {
      setSummarising(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const startNewChat = async () => {
    if (resetting) return;
    setResetting(true);
    setError("");
    try {
      if (messages.length > 0) {
        await fetch("/api/admin/ai/chat/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context_type: contextType, context_id: contextId }),
        });
        notifyActivityRecorded();
      }
      if (onNewChat) {
        onNewChat();
      } else {
        setMessages([]);
        await loadSession();
      }
    } catch {
      setError("Could not start a new chat — please try again.");
    } finally {
      setResetting(false);
    }
  };

  const suggestedList = SUGGESTED[contextType] ?? SUGGESTED.default;
  const selectedModel = MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0];

  const typeDot = TYPE_DOT[contextType] ?? "bg-gray-400";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#111111]/6 px-3 py-2">
        {showContextSwitcher ? (
          <button
            type="button"
            onClick={onChangeContext}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-[#111111]/[0.03]"
            title={`${TYPE_LABEL[contextType] ?? contextType} — click to change`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${typeDot}`} />
            <span className="truncate text-xs font-medium text-[#111111]">{contextLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-[#6f6b62]/70" />
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <span className={`h-2 w-2 shrink-0 rounded-full ${typeDot}`} />
            <span className="truncate text-xs font-medium text-[#111111]">{contextLabel}</span>
          </div>
        )}

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => void openSummariseModal()}
            disabled={summarising || sessionLoading}
            title="Summarise full conversation"
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#063b32] hover:bg-[#063b32]/5 disabled:opacity-40"
          >
            {summarising ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Summarise
          </button>
        )}

        {showNewChatButton && (
          <button
            type="button"
            onClick={() => void startNewChat()}
            disabled={resetting || sessionLoading}
            title="Start a new chat"
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#6f6b62] hover:bg-[#111111]/[0.03] hover:text-[#111111] disabled:opacity-40"
          >
            {resetting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-3 w-3" />
            )}
            New chat
          </button>
        )}

        <div className="relative shrink-0" ref={modelMenuRef}>
          <button
            type="button"
            onClick={() => setShowModelMenu((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#6f6b62] hover:bg-[#111111]/[0.03] hover:text-[#111111]"
          >
            {selectedModel.label}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
          {showModelMenu && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#111111]/8 bg-white py-1 shadow-lg">
              {MODEL_OPTIONS.filter(
                (o) =>
                  o.id === "claude-haiku-4-5-20251001" ||
                  (allowModelUpgrade && o.id !== "claude-haiku-4-5-20251001"),
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { setModel(o.id); setShowModelMenu(false); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-[#faf9f6] ${
                    model === o.id ? "bg-[#063b32]/5 text-[#063b32]" : "text-[#111111]"
                  }`}
                >
                  <span className="font-medium">{o.label}</span>
                  <span className="text-[10px] text-[#6f6b62]">{o.note}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
        {sessionLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[#6f6b62]" />
          </div>
        ) : sessionError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-xs font-semibold text-red-600">Chat unavailable</p>
            <p className="text-[11px] text-[#6f6b62] leading-relaxed max-w-[220px]">
              {sessionError}
            </p>
            <button
              type="button"
              onClick={() => void loadSession()}
              className="rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#f7f4ea]"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#063b32] shadow-md">
                <Bot className="h-5 w-5 text-[#f5f274]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#111111]">Ask about this account</p>
              <p className="mt-1 text-xs text-[#6f6b62]">
                Paste rough notes, prep for a call, or ask what to do next — I use the live account record.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              {suggestedList.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="w-full rounded-xl border border-[#111111]/8 bg-[#faf9f6] px-3.5 py-2.5 text-left text-xs text-[#6f6b62] hover:border-[#063b32]/20 hover:bg-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              onSaveToNotes={msg.role === "assistant" ? openSaveModal : undefined}
            />
          ))
        )}

        {sending && (
          <div className="flex gap-2.5 pr-2">
            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#111111]/8 bg-white shadow-sm">
              <Sparkles className="h-3 w-3 text-[#063b32]" />
            </div>
            <TypingIndicator />
          </div>
        )}

        {saveNotice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {saveNotice}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#111111]/8 bg-[#faf9f6] px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-[#111111]/12 bg-white px-3 py-2.5 shadow-sm focus-within:border-[#063b32]/40 focus-within:ring-2 focus-within:ring-[#063b32]/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI assistant…"
            rows={1}
            className="flex-1 resize-none overflow-y-auto bg-transparent text-[13px] text-[#111111] placeholder-[#6f6b62] outline-none"
            style={{ maxHeight: "120px", minHeight: "24px" }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || sending || !!sessionError}
            className="shrink-0 grid h-8 w-8 place-items-center rounded-xl bg-[#063b32] text-white shadow-sm hover:bg-[#1a5c42] disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-[#6f6b62]/80">Enter to send · Shift+Enter for new line</p>
      </div>

      <SaveSummaryModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        defaultTitle={saveTitle}
        defaultSummary={saveSummary}
        onConfirm={confirmSaveToNotes}
      />
      <SaveSummaryModal
        open={summariseModalOpen}
        onClose={() => setSummariseModalOpen(false)}
        defaultTitle={saveTitle}
        defaultSummary={saveSummary}
        onConfirm={confirmSaveToNotes}
      />
    </div>
  );
}

// ── Context picker ────────────────────────────────────────────────────────────

function ContextPicker({
  onSelect,
}: {
  onSelect: (type: string, id: string, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/ai/context-search?q=${encodeURIComponent(query)}`);
        const json = (await res.json()) as { data: SearchResult[] };
        setResults(json.data);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-[#111111]">Select an account</p>
        <p className="mt-0.5 text-xs text-[#6f6b62]">
          Search for a client, enquiry, or prospect to start a conversation.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-[#111111]/15 bg-[#f7f4ea] px-3 py-2 focus-within:border-[#063b32]">
        <Search className="h-4 w-4 shrink-0 text-[#6f6b62]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, email, or organisation…"
          className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#6f6b62] outline-none"
        />
        {searching && <Loader2 className="h-4 w-4 animate-spin text-[#6f6b62]" />}
      </div>

      {results.length > 0 && (
        <div className="max-h-72 overflow-y-auto space-y-1">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              type="button"
              onClick={() => onSelect(r.type, r.id, r.label)}
              className="flex w-full items-center gap-3 rounded-xl border border-[#111111]/10 px-3 py-2.5 text-left hover:border-[#063b32]/20 hover:bg-[#f7f4ea] transition-colors"
            >
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_BADGE[r.type] ?? "bg-gray-100 text-gray-600"}`}>
                {TYPE_LABEL[r.type]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111111]">{r.label}</p>
                {r.sublabel && (
                  <p className="truncate text-xs text-[#6f6b62]">{r.sublabel}</p>
                )}
              </div>
              {r.status && (
                <span className="ml-auto shrink-0 text-[10px] text-[#6f6b62]">{r.status}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <p className="text-center text-xs text-[#6f6b62] py-4">No accounts found matching "{query}"</p>
      )}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

function readWidgetOpen(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("vaxai-widget-open") === "1";
}

async function fetchContextDetail(type: string, id: string): Promise<AIContext | null> {
  try {
    const res = await fetch(`/api/admin/ai/context-detail?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`);
    const json = (await res.json()) as { type?: AIContextType; id?: string; label?: string; summary?: string };
    if (!res.ok || !json.type || !json.id) return null;
    return {
      type: json.type,
      id: json.id,
      label: json.label ?? "Account",
      summary: json.summary,
    };
  } catch {
    return null;
  }
}

export function AIAssistantWidget() {
  const {
    context,
    pageContext,
    hasActiveChat,
    setManualContext,
    markChatActive,
    resetToPageContext,
    clearManualOverride,
  } = useAIAssistantContext();
  const [isOpen, setIsOpen] = useState(readWidgetOpen);
  const [panelSize, setPanelSize] = useState<PanelSize>("large");
  const [customSize, setCustomSize] = useState<{ width: number; height: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [chatNonce, setChatNonce] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeDrag = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  usePersistWidgetOpen(isOpen);

  const activeType = context.type;
  const activeId = context.id;
  const activeLabel = context.label;
  const activeSummary = context.summary ?? buildContextSummary(activeType, activeLabel);

  const hasAccountContext = activeType !== "general";
  const viewingDifferentAccount =
    pageContext.type !== "general" && !contextsEqual(context, pageContext);
  const allowModelUpgrade = activeType === "client";

  const handleSelectContext = async (type: string, id: string, label: string) => {
    const detail = await fetchContextDetail(type, id);
    setManualContext(
      detail ?? {
        type: type as AIContextType,
        id,
        label,
        summary: buildContextSummary(type as AIContextType, label),
      },
    );
    setShowPicker(false);
  };

  const handleChangeContext = () => {
    setShowPicker(true);
  };

  const handleNewChat = () => {
    resetToPageContext();
    setChatNonce((n) => n + 1);
    setShowPicker(pageContext.type === "general");
  };

  const handleReturnToPage = () => {
    clearManualOverride();
    setShowPicker(false);
  };

  const handleChatStarted = useCallback(() => {
    markChatActive();
  }, [markChatActive]);

  const openPanel = () => {
    setIsOpen(true);
    setPanelSize("large");
    setCustomSize(null);
  };

  const cyclePanelSize = () => {
    setCustomSize(null);
    setPanelSize((s) => (s === "large" ? "xl" : "large"));
  };

  const panelDimensions = customSize ?? PANEL_SIZES[panelSize];

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: panelDimensions.width,
      startH: panelDimensions.height,
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeDrag.current) return;
      const dw = resizeDrag.current.startX - ev.clientX;
      const dh = resizeDrag.current.startY - ev.clientY;
      setCustomSize({
        width: Math.min(PANEL_MAX.width, Math.max(PANEL_MIN.width, resizeDrag.current.startW + dw)),
        height: Math.min(PANEL_MAX.height, Math.max(PANEL_MIN.height, resizeDrag.current.startH + dh)),
      });
    };

    const onUp = () => {
      resizeDrag.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#063b32] shadow-lg hover:bg-[#1a5c42] transition-colors"
        title="VAxAI Assistant"
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-[#f5f274]" />
        ) : (
          <Sparkles className="h-5 w-5 text-[#f5f274]" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-6 z-40 flex flex-col rounded-2xl border border-[#111111]/10 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden transition-[width,height] duration-150 ease-out"
          style={{ width: panelDimensions.width, height: panelDimensions.height }}
        >
          {/* Manual resize — drag top-left corner */}
          <button
            type="button"
            aria-label="Resize panel"
            onMouseDown={startResize}
            className="absolute left-0 top-0 z-50 h-4 w-4 cursor-nwse-resize rounded-tl-2xl hover:bg-[#111111]/5"
            title="Drag to resize"
          />

          {/* Header */}
          <div className="flex shrink-0 items-center gap-2 border-b border-[#111111]/10 bg-[#0a1f18] px-4 py-3">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274]">
              <Sparkles className="h-3.5 w-3.5 text-[#0a1f18]" />
            </div>
            <span className="flex-1 text-sm font-semibold text-white">VAxAI Assistant</span>
            <button
              type="button"
              onClick={cyclePanelSize}
              className="grid h-7 w-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
              title={panelSize === "xl" ? "Shrink to large" : "Expand to extra large"}
            >
              {panelSize === "xl" && !customSize ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {viewingDifferentAccount && hasAccountContext && (
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-amber-200/80 bg-amber-50 px-3 py-2">
                <p className="text-[11px] text-amber-900">
                  Chatting about a different account than this page
                </p>
                <button
                  type="button"
                  onClick={handleReturnToPage}
                  className="shrink-0 text-[11px] font-semibold text-[#063b32] hover:underline"
                >
                  Use current page
                </button>
              </div>
            )}

            {showPicker || (!hasAccountContext && !hasActiveChat) ? (
              <ContextPicker onSelect={(type, id, label) => void handleSelectContext(type, id, label)} />
            ) : (
              <ChatPanel
                key={`${activeType}-${activeId}-${chatNonce}`}
                contextType={activeType}
                contextId={activeId}
                contextLabel={activeLabel}
                contextSummary={activeSummary}
                allowModelUpgrade={allowModelUpgrade}
                onChangeContext={handleChangeContext}
                showNewChatButton
                onNewChat={handleNewChat}
                onChatStarted={handleChatStarted}
                onActivityRecorded={notifyActivityRecorded}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Inline chat history (for the "Chat" tab on detail pages) ─────────────────

export function AIChatHistory({
  contextType,
  contextId,
  contextLabel,
  contextSummary,
  allowModelUpgrade,
  onNotesSaved,
  onActivityRecorded,
}: {
  contextType: string;
  contextId: string;
  contextLabel: string;
  contextSummary: string;
  allowModelUpgrade?: boolean;
  onNotesSaved?: () => void;
  onActivityRecorded?: () => void;
}) {
  const typeDot = TYPE_DOT[contextType] ?? "bg-gray-400";

  return (
    <div className="flex h-[min(600px,calc(100vh-14rem))] max-h-[70vh] flex-col overflow-hidden rounded-xl border border-[#111111]/10 shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#111111]/10 bg-[#0a1f18] px-4 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#f5f274]">
          <Sparkles className="h-3.5 w-3.5 text-[#0a1f18]" />
        </div>
        <span className="flex-1 text-sm font-semibold text-white">VAxAI Assistant</span>
        <span className={`h-2 w-2 shrink-0 rounded-full ${typeDot}`} />
        <span className="truncate text-xs text-white/70">{contextLabel}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatPanel
          contextType={contextType}
          contextId={contextId}
          contextLabel={contextLabel}
          contextSummary={contextSummary}
          allowModelUpgrade={allowModelUpgrade ?? false}
          onChangeContext={() => {}}
          showContextSwitcher={false}
          showNewChatButton
          onNotesSaved={onNotesSaved}
          onActivityRecorded={onActivityRecorded}
        />
      </div>
    </div>
  );
}
