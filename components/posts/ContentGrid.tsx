"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import PublicContactModal from "@/components/PublicContactModal";

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  content_type: string | null;
  tags: string[] | null;
  published_at: string | null;
  author_id: string | null;
};

type Author = { id: string; name: string; avatar_url: string | null };

type Props = {
  posts: Post[];
  authorMap: Record<string, Author>;
  allTags: string[];
  allTypes: string[];
};

function MultiDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayLabel = selected.length === 0
    ? label
    : selected.length === 1
    ? selected[0]
    : `${selected[0]} +${selected.length - 1}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          selected.length > 0
            ? "border-[#122428] bg-[#122428] text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        {selected.length > 0 ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear(); } }}
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/20 hover:bg-white/40"
            aria-label={`Clear ${label}`}
          >
            <X className="h-2.5 w-2.5" />
          </span>
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[200px] max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                  checked ? "border-[#122428] bg-[#122428]" : "border-gray-300 bg-white"
                }`}>
                  {checked && (
                    <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 9;

export default function ContentGrid({ posts, authorMap, allTags, allTypes }: Props) {
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [page, setPage] = useState(0);

  const toggleType = (t: string) => {
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    setPage(0);
  };
  const toggleTag = (t: string) => {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    setPage(0);
  };

  const filtered = posts.filter((p) => {
    if (activeTypes.length > 0 && !activeTypes.includes(p.content_type ?? "")) return false;
    if (activeTags.length > 0 && !activeTags.some((t) => (p.tags ?? []).includes(t))) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const hasActiveFilter = !!(search || activeTypes.length || activeTags.length);

  return (
    <div>
      {/* ── Filter bar — single line ── */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search insights…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-[#122428] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Content type dropdown */}
        {allTypes.length > 0 && (
          <MultiDropdown
            label="Content type"
            options={allTypes}
            selected={activeTypes}
            onToggle={toggleType}
            onClear={() => setActiveTypes([])}
          />
        )}

        {/* Tags dropdown */}
        {allTags.length > 0 && (
          <MultiDropdown
            label="Tags"
            options={allTags}
            selected={activeTags}
            onToggle={toggleTag}
            onClear={() => setActiveTags([])}
          />
        )}

        {/* Count + clear */}
        <span className="text-xs text-gray-400">
          {filtered.length} {filtered.length === 1 ? "insight" : "insights"}
        </span>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => { setSearch(""); setActiveTypes([]); setActiveTags([]); setPage(0); }}
            className="text-xs font-semibold text-[#122428] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-400">No posts match your filters.</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((post) => {
            const author = post.author_id ? authorMap[post.author_id] : null;
            const date = post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : null;

            return (
              <a key={post.id} href={`/posts/${post.slug}`} className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* Cover */}
                <div className="aspect-[16/9] overflow-hidden rounded-t-2xl bg-gray-100">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#122428]/10 to-[#122428]/5">
                      <span className="text-2xl font-bold text-[#122428]/20">{post.title[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Type + date */}
                  <div className="mb-2 flex items-center gap-2">
                    {post.content_type && (
                      <span className="rounded-full bg-[#122428]/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#122428]">
                        {post.content_type}
                      </span>
                    )}
                    {date && <span className="ml-auto text-[10px] text-gray-400">{date}</span>}
                  </div>

                  {/* Title */}
                  <h2 className="mb-1.5 text-base font-bold leading-snug text-gray-900 group-hover:text-[#122428]">
                    {post.title}
                  </h2>

                  {/* Description */}
                  {post.description && (
                    <p className="mb-3 flex-1 text-sm leading-6 text-gray-500">
                      {post.description}
                    </p>
                  )}

                  {/* Author */}
                  {author && (
                    <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-3">
                      {author.avatar_url ? (
                        <img src={author.avatar_url} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-[#122428] text-[9px] font-bold text-[#D8FC2E]">
                          {author.name[0]}
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-500">{author.name}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-gray-100 px-2 py-0.5 text-[10px] text-gray-400">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-[10px] text-gray-300">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>
          <span className="text-xs text-gray-400">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Get in touch CTA */}
      <div className="mt-16 flex flex-col items-center rounded-3xl bg-[#122428] px-8 py-14 text-center text-white">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D8FC2E]/80">Work with us</p>
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to work smarter?</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
          Whether you have a specific challenge or just want to explore how VAxAI could help your team, we&apos;d love to hear from you.
        </p>
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#D8FC2E] px-6 py-3 text-sm font-bold text-[#122428] transition hover:bg-[#D8FC2E]/90"
        >
          Get in touch
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
