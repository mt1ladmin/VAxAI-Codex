"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, ExternalLink, Filter, Search, X } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: string;
  tags: string[];
  status: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export default function InsightsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/posts?status=published")
      .then((r) => r.json())
      .then((j: { data?: Post[] }) => {
        setPosts(j.data ?? []);
        setLoading(false);
      });
  }, []);

  const allTypes = useMemo(
    () => Array.from(new Set(posts.map((p) => p.content_type).filter(Boolean))).sort(),
    [posts],
  );

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort(),
    [posts],
  );

  const filtered = useMemo(() => {
    let result = posts;
    if (typeFilter) result = result.filter((p) => p.content_type === typeFilter);
    if (tagFilter) result = result.filter((p) => (p.tags ?? []).includes(tagFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          p.content_type.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [posts, typeFilter, tagFilter, search]);

  const hasFilters = Boolean(typeFilter || tagFilter || search.trim());

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#111111]/10 bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6b62]">Client Engagement</p>
            <h1 className="mt-1 font-serif text-2xl text-[#111111]">Insights</h1>
            <p className="mt-1 text-sm text-[#6f6b62]">All published posts.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6f6b62]">
            <BarChart2 className="h-4 w-4" />
            <span className="tabular-nums">{posts.length} published</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-xl border border-[#111111]/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <Filter className="h-4 w-4 shrink-0 text-[#6f6b62]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            <option value="">All types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-xl border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setTypeFilter(""); setTagFilter(""); setSearch(""); }}
              className="inline-flex items-center gap-1 rounded-full border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-[#f7f4ea]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart2 className="mb-3 h-8 w-8 text-[#6f6b62]/30" />
            <p className="text-sm text-[#6f6b62]">
              {posts.length === 0 ? "No published posts yet." : "No posts match your filters."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-[#6f6b62]">
              {hasFilters ? `${filtered.length} of ${posts.length} posts` : `${posts.length} posts`}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-sm"
                >
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full border border-[#111111]/15 px-2 py-0.5 text-[10px] font-semibold text-[#6f6b62]">
                        {post.content_type}
                      </span>
                    </div>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="mb-1 text-sm font-semibold leading-snug text-[#111111] hover:text-[#063b32]"
                    >
                      {post.title}
                    </Link>
                    {post.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-[#6f6b62]">{post.description}</p>
                    )}
                    {(post.tags ?? []).length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {(post.tags ?? []).slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setTagFilter(tag === tagFilter ? "" : tag)}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              tagFilter === tag
                                ? "bg-[#063b32] text-white"
                                : "bg-[#f7f4ea] text-[#6f6b62] hover:bg-[#063b32]/10"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-[10px] text-[#6f6b62]">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : new Date(post.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <a
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#063b32] hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
