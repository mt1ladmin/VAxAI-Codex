"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { ContentCreateModal } from "@/components/admin/ContentCreateModal";
import {
  InfoTip,
  StudioPageHeader,
  studio,
} from "@/components/admin/studio-ui";
import {
  CONTENT_TOPICS,
  TOPIC_CATEGORIES,
  buildBriefFromTopics,
  type TopicCategoryId,
} from "@/lib/content-topic-library";

export default function CreateContentPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<TopicCategoryId | "all">("all");
  const [libraryOpen, setLibraryOpen] = useState(true);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return CONTENT_TOPICS;
    return CONTENT_TOPICS.filter((t) => t.category === categoryFilter);
  }, [categoryFilter]);

  const brief = useMemo(() => buildBriefFromTopics([...selected]), [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelected = () => setSelected(new Set());

  return (
    <div className={`${studio.page} ${studio.pagePad}`}>
      <div className={studio.max}>
        <StudioPageHeader
          eyebrow="Content Hub"
          title="Create content"
          description="Generate on-brand blog and social drafts from a short brief. Optional topic library below if you want starting points — or write your own brief in Create."
          info="AI drafts stay editable. Blog can become a Posts draft; social can go to the calendar. Positioning stays human-led: admin foundations first, no selling AI products."
          actions={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={studio.btnPrimary}
            >
              <Sparkles className="h-4 w-4" />
              Create content
            </button>
          }
        />

        <div className={`${studio.card} ${studio.cardPad} mt-6`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className={studio.sectionTitle}>Topic library</h2>
                <InfoTip text="Optional. Tick timeless topics aligned to VAxAI work. They fill the create brief so you do not need a separate planning session. Leave empty to write your own brief." />
              </div>
              <p className="mt-1 text-sm text-muted">
                {selected.size === 0
                  ? "Nothing selected — Create opens with a blank brief."
                  : `${selected.size} topic${selected.size === 1 ? "" : "s"} selected — will pre-fill the brief.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selected.size > 0 ? (
                <button type="button" onClick={clearSelected} className={studio.btnGhost}>
                  Clear selection
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setLibraryOpen((v) => !v)}
                className={studio.btnSecondary}
              >
                {libraryOpen ? "Hide library" : "Show library"}
                <ChevronDown className={`h-4 w-4 transition-transform ${libraryOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {libraryOpen ? (
            <>
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

              {categoryFilter !== "all" ? (
                <p className="mt-3 text-xs leading-5 text-muted">
                  {TOPIC_CATEGORIES.find((c) => c.id === categoryFilter)?.blurb}
                </p>
              ) : null}

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
                            : "border-pine-900/10 bg-white hover:border-pine-900/20 hover:bg-cream/50"
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
                          <span className="block text-sm font-semibold text-pine-900">{topic.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted">{topic.angle}</span>
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {topic.formats.map((f) => (
                              <span
                                key={f}
                                className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
                              >
                                {f}
                              </span>
                            ))}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-pine-900/8 pt-5">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className={studio.btnPrimary}
                >
                  <Sparkles className="h-4 w-4" />
                  {selected.size > 0 ? "Create from selected topics" : "Create with your own brief"}
                </button>
                <p className="text-xs text-muted">
                  You can edit the brief fully in the next step before generating.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ContentCreateModal
        open={open}
        onClose={() => setOpen(false)}
        initialBrief={brief}
      />
    </div>
  );
}
