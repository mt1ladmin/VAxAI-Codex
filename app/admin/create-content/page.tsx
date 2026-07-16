"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, ChevronDown, Loader2, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { ContentCreateModal } from "@/components/admin/ContentCreateModal";
import {
  InfoTip,
  studio,
} from "@/components/admin/studio-ui";
import {
  TOPIC_CATEGORIES,
  type ContentTopic,
  type TopicCategoryId,
} from "@/lib/content-topic-library";

type ApiTopic = ContentTopic & {
  source?: string;
  status?: string;
  research_note?: string | null;
  conversation_hook?: string | null;
  live_as_of?: string | null;
  used_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function formatLiveAsOf(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatUsedAt(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CreateContentPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<TopicCategoryId | "all">("all");
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState<TopicCategoryId | "all">("all");
  /** Hidden by default so first visit is calm — open only when needed. */
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [archivedTopics, setArchivedTopics] = useState<ApiTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState(false);
  const [restoringIds, setRestoringIds] = useState<Set<string>>(new Set());
  const [topicError, setTopicError] = useState<string | null>(null);
  const [archivedError, setArchivedError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicError(null);
    try {
      const res = await fetch("/api/admin/content-topics?status=active");
      const json = (await res.json()) as { data?: ApiTopic[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Could not load topics");
      setTopics(json.data ?? []);
      setSelected((prev) => {
        // Keep selections that still exist in active or archived lists
        const active = new Set((json.data ?? []).map((t) => t.id));
        return new Set([...prev].filter((id) => active.has(id) || prev.has(id)));
      });
    } catch (e) {
      setTopicError(e instanceof Error ? e.message : "Could not load topics");
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  const loadArchivedTopics = useCallback(async () => {
    setLoadingArchived(true);
    setArchivedError(null);
    try {
      const res = await fetch("/api/admin/content-topics?status=inactive");
      const json = (await res.json()) as { data?: ApiTopic[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Could not load archived topics");
      setArchivedTopics(json.data ?? []);
    } catch (e) {
      setArchivedError(e instanceof Error ? e.message : "Could not load archived topics");
      setArchivedTopics([]);
    } finally {
      setLoadingArchived(false);
    }
  }, []);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    if (archivedOpen) void loadArchivedTopics();
  }, [archivedOpen, loadArchivedTopics]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return topics;
    return topics.filter((t) => t.category === categoryFilter);
  }, [categoryFilter, topics]);

  const filteredArchived = useMemo(() => {
    if (archivedCategoryFilter === "all") return archivedTopics;
    return archivedTopics.filter((t) => t.category === archivedCategoryFilter);
  }, [archivedCategoryFilter, archivedTopics]);

  const topicById = useMemo(() => {
    const map = new Map<string, ApiTopic>();
    for (const t of topics) map.set(t.id, t);
    for (const t of archivedTopics) map.set(t.id, t);
    return map;
  }, [topics, archivedTopics]);

  const brief = useMemo(() => {
    const selectedTopics = [...selected]
      .map((id) => topicById.get(id))
      .filter((t): t is ApiTopic => !!t);
    if (!selectedTopics.length) return "";
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const lines = selectedTopics.map((t) => {
      const asOf = formatLiveAsOf(t.live_as_of) || today;
      const hook = t.conversation_hook ? ` Conversation: ${t.conversation_hook}.` : "";
      return `- ${t.title}: ${t.angle} (relevant as of ${asOf}.${hook})`;
    });
    return `Please create on-brand VAxAI content for publication around ${today}. Join live UK conversations where noted, without trend-chasing. Stay human-led: admin foundations before tools; do not sell AI products. Speak to backlog recovery, AI readiness groundwork, ongoing admin and/or maintain-and-improve as the topic implies.\n\nSelected angles:\n${lines.join("\n")}\n\nWrite for the platform(s) I choose next. Keep examples honest and hypothetical. Optimise for search and discussion language people use now. Close with a clear, proportionate call to action.`;
  }, [selected, topicById]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelected = () => setSelected(new Set());

  const generateFreshTopics = async () => {
    setGeneratingTopics(true);
    setTopicError(null);
    try {
      const res = await fetch("/api/admin/content-topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 6 }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not generate topics");
      setLibraryOpen(true);
      setArchivedOpen(false);
      await loadTopics();
    } catch (e) {
      setTopicError(e instanceof Error ? e.message : "Could not generate topics");
    } finally {
      setGeneratingTopics(false);
    }
  };

  const restoreTopics = async (ids: string[]) => {
    if (!ids.length) return;
    setRestoringIds(new Set(ids));
    setArchivedError(null);
    try {
      const res = await fetch("/api/admin/content-topics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "restore" }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not restore topics");
      await Promise.all([loadTopics(), loadArchivedTopics()]);
    } catch (e) {
      setArchivedError(e instanceof Error ? e.message : "Could not restore topics");
    } finally {
      setRestoringIds(new Set());
    }
  };

  const selectedArchivedIds = useMemo(
    () => [...selected].filter((id) => archivedTopics.some((t) => t.id === id)),
    [selected, archivedTopics],
  );

  return (
    <div className={`${studio.page} ${studio.pagePad}`}>
      <div className={studio.max}>
        <div className="flex flex-wrap items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-6 text-muted">
            Start with Create when you already know the angle. Open the topic library only if you want optional ideas — used topics move to the archive so you can reuse them later without cluttering the active list.
          </p>
          <InfoTip text="Generate drafts with AI, then edit before saving to Posts or the calendar. Topics you generate from are archived so the library stays fresh. Open Archived topics to reuse a previous brief. Refresh topics uses AI plus light public research signals." />
        </div>

        {/* Always-visible create / library controls */}
        <div className={`sticky top-[7.5rem] z-20 mt-5 ${studio.card} ${studio.cardPad} border-pine-900/10 bg-white/95 shadow-sm backdrop-blur-md max-md:p-3.5 md:top-12`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm leading-6 text-muted">
                Write your own brief, or open the library for optional starting points.
                {selected.size > 0
                  ? ` ${selected.size} topic${selected.size === 1 ? "" : "s"} selected.`
                  : ""}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => setOpen(true)} className={`${studio.btnPrimary} max-md:w-full max-md:min-h-11`}>
                <Sparkles className="h-4 w-4" />
                {selected.size > 0 ? "Create from selection" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryOpen((v) => !v);
                  if (!libraryOpen) setArchivedOpen(false);
                }}
                className={`${studio.btnSecondary} max-md:w-full max-md:min-h-11`}
              >
                {libraryOpen ? "Hide topic library" : "Browse topic library"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${libraryOpen ? "rotate-180" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchivedOpen((v) => !v);
                  if (!archivedOpen) setLibraryOpen(false);
                }}
                className={`${studio.btnSecondary} max-md:w-full max-md:min-h-11`}
              >
                <Archive className="h-4 w-4" />
                {archivedOpen ? "Hide archived topics" : "Archived topics"}
              </button>
            </div>
          </div>
        </div>

        {libraryOpen ? (
          <div className={`${studio.card} ${studio.cardPad} mt-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={studio.sectionTitle}>Topic library</h2>
                  <InfoTip text="Optional ideas only. Refresh pulls live UK signals (AI readiness, backlogs, sector admin pressure) dated to today — the year always follows the calendar (2026, 2027, …). Balance: join live conversations for SEO without hopping on fads. After you generate content from selected topics, those items are archived." />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {loadingTopics
                    ? "Loading…"
                    : topics.length === 0
                      ? "No active topics. Refresh to generate a set for today."
                      : `${topics.length} active · tick to pre-fill · dates show when the idea was made live`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.size > 0 ? (
                  <button type="button" onClick={clearSelected} className={studio.btnGhost}>
                    Clear selection
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void generateFreshTopics()}
                  disabled={generatingTopics}
                  className={studio.btnSecondary}
                >
                  {generatingTopics ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {generatingTopics ? "Finding ideas…" : "Refresh topics"}
                </button>
              </div>
            </div>

            {topicError ? (
              <p className="mt-3 rounded-xl border border-pine-900/15 bg-white px-3 py-2 text-sm text-pine-900">
                {topicError}
                {topicError.includes("schema") || topicError.includes("relation")
                  ? " Run the studio_content_topics migration in Supabase if you have not already."
                  : ""}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={categoryFilter === "all" ? studio.chipActive : studio.chip}
              >
                All
              </button>
              {TOPIC_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={categoryFilter === c.id ? studio.chipActive : studio.chip}
                  title={c.blurb}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {loadingTopics ? (
              <div className="mt-8 flex justify-center py-10 text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-pine-900/15 px-4 py-10 text-center">
                <p className="text-sm font-semibold text-pine-900">Nothing in this view</p>
                <p className="mt-1 text-sm text-muted">
                  Refresh topics to add new ideas that have not been used yet.
                </p>
                <button
                  type="button"
                  onClick={() => void generateFreshTopics()}
                  disabled={generatingTopics}
                  className={`${studio.btnPrimary} mt-4`}
                >
                  <Wand2 className="h-4 w-4" />
                  Refresh topics
                </button>
              </div>
            ) : (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {filtered.map((topic) => {
                  const on = selected.has(topic.id);
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => toggle(topic.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                          on
                            ? "border-pine-900/30 bg-pine-50/80"
                            : "border-pine-900/10 bg-white hover:border-pine-900/20 hover:bg-pine-50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                            on ? "border-pine-900 bg-pine-900 text-paper" : "border-pine-900/20 bg-white"
                          }`}
                          aria-hidden
                        >
                          {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-pine-900">{topic.title}</span>
                            {topic.source === "ai" ? (
                              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                                Live
                              </span>
                            ) : null}
                            {formatLiveAsOf(topic.live_as_of) ? (
                              <span className="rounded-full border border-pine-900/10 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                                As of {formatLiveAsOf(topic.live_as_of)}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted">{topic.angle}</span>
                          {topic.conversation_hook ? (
                            <span className="mt-1 block text-[11px] font-medium leading-4 text-pine-800/80">
                              Conversation: {topic.conversation_hook}
                            </span>
                          ) : null}
                          {topic.research_note ? (
                            <span className="mt-1 block text-[11px] leading-4 text-muted/80">
                              {topic.research_note}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {archivedOpen ? (
          <div className={`${studio.card} ${studio.cardPad} mt-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={studio.sectionTitle}>Archived topic library</h2>
                  <InfoTip text="Topics that were used for a generate, or archived from the active library. Select any to reuse as a brief, or restore them back to the active topic library." />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {loadingArchived
                    ? "Loading…"
                    : archivedTopics.length === 0
                      ? "No used or archived topics yet. When you generate from a topic, it lands here."
                      : `${archivedTopics.length} stored · tick to reuse · restore to put back in the active library`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedArchivedIds.length > 0 ? (
                  <>
                    <button type="button" onClick={clearSelected} className={studio.btnGhost}>
                      Clear selection
                    </button>
                    <button
                      type="button"
                      onClick={() => void restoreTopics(selectedArchivedIds)}
                      disabled={restoringIds.size > 0}
                      className={studio.btnSecondary}
                    >
                      {restoringIds.size > 0 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      Restore selected
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => void loadArchivedTopics()}
                  disabled={loadingArchived}
                  className={studio.btnGhost}
                >
                  {loadingArchived ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Refresh
                </button>
              </div>
            </div>

            {archivedError ? (
              <p className="mt-3 rounded-xl border border-pine-900/15 bg-white px-3 py-2 text-sm text-pine-900">
                {archivedError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setArchivedCategoryFilter("all")}
                className={archivedCategoryFilter === "all" ? studio.chipActive : studio.chip}
              >
                All
              </button>
              {TOPIC_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setArchivedCategoryFilter(c.id)}
                  className={archivedCategoryFilter === c.id ? studio.chipActive : studio.chip}
                  title={c.blurb}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {loadingArchived ? (
              <div className="mt-8 flex justify-center py-10 text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filteredArchived.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-pine-900/15 px-4 py-10 text-center">
                <Archive className="mx-auto h-8 w-8 text-muted/50" />
                <p className="mt-3 text-sm font-semibold text-pine-900">Archive is empty</p>
                <p className="mt-1 text-sm text-muted">
                  Used topics appear here after you generate content from them, so you can reuse the angle later.
                </p>
              </div>
            ) : (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {filteredArchived.map((topic) => {
                  const on = selected.has(topic.id);
                  const usedLabel = formatUsedAt(topic.used_at);
                  const statusLabel =
                    topic.status === "archived" ? "Archived" : topic.status === "used" ? "Used" : topic.status;
                  const isRestoring = restoringIds.has(topic.id);
                  return (
                    <li key={topic.id}>
                      <div
                        className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                          on
                            ? "border-pine-900/30 bg-pine-50/80"
                            : "border-pine-900/10 bg-white hover:border-pine-900/20"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(topic.id)}
                          className="flex min-w-0 flex-1 items-start gap-3 text-left"
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                              on ? "border-pine-900 bg-pine-900 text-paper" : "border-pine-900/20 bg-white"
                            }`}
                            aria-hidden
                          >
                            {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          </span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-pine-900">{topic.title}</span>
                              {statusLabel ? (
                                <span className="rounded-full border border-pine-900/10 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                                  {statusLabel}
                                </span>
                              ) : null}
                              {usedLabel ? (
                                <span className="rounded-full border border-pine-900/10 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                                  Used {usedLabel}
                                </span>
                              ) : null}
                              {topic.source === "ai" ? (
                                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                                  Live
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted">{topic.angle}</span>
                            {topic.conversation_hook ? (
                              <span className="mt-1 block text-[11px] font-medium leading-4 text-pine-800/80">
                                Conversation: {topic.conversation_hook}
                              </span>
                            ) : null}
                            {topic.research_note ? (
                              <span className="mt-1 block text-[11px] leading-4 text-muted/80">
                                {topic.research_note}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        <button
                          type="button"
                          title="Restore to active library"
                          disabled={isRestoring}
                          onClick={() => void restoreTopics([topic.id])}
                          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-pine-900/10 text-muted hover:bg-pine-50 hover:text-pine-900 disabled:opacity-50"
                        >
                          {isRestoring ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <ContentCreateModal
        open={open}
        onClose={() => setOpen(false)}
        initialBrief={brief}
        topicIds={[...selected]}
        onTopicsConsumed={() => {
          setSelected(new Set());
          void loadTopics();
          if (archivedOpen) void loadArchivedTopics();
        }}
      />
    </div>
  );
}
