"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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

export default function ContentGrid({ posts, authorMap, allTags, allTypes }: Props) {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const filtered = posts.filter((p) => {
    if (activeType && p.content_type !== activeType) return false;
    if (activeTag && !(p.tags ?? []).includes(activeTag)) return false;
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

  const hasActiveFilter = !!(search || activeType || activeTag);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        {/* Search + count */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search insights…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? "insight" : "insights"}
          </span>
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(""); setActiveType(""); setActiveTag(""); }}
              className="text-xs font-semibold text-[#063b32] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Type filter */}
        {allTypes.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Type</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveType("")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  !activeType ? "bg-[#063b32] text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-[#063b32]/50"
                }`}
              >
                All
              </button>
              {allTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(activeType === t ? "" : t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeType === t ? "bg-[#063b32] text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-[#063b32]/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-400">No posts match your filters.</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
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
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#063b32]/10 to-[#063b32]/5">
                      <span className="text-2xl font-bold text-[#063b32]/20">{post.title[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Type + date */}
                  <div className="mb-2 flex items-center gap-2">
                    {post.content_type && (
                      <span className="rounded-full bg-[#063b32]/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#063b32]">
                        {post.content_type}
                      </span>
                    )}
                    {date && <span className="ml-auto text-[10px] text-gray-400">{date}</span>}
                  </div>

                  {/* Title */}
                  <h2 className="mb-1.5 text-base font-bold leading-snug text-gray-900 group-hover:text-[#063b32]">
                    {post.title}
                  </h2>

                  {/* Description */}
                  {post.description && (
                    <p className="mb-3 line-clamp-2 flex-1 text-sm leading-6 text-gray-500">
                      {post.description}
                    </p>
                  )}

                  {/* Author */}
                  {author && (
                    <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-3">
                      {author.avatar_url ? (
                        <img src={author.avatar_url} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-[#063b32] text-[9px] font-bold text-[#f5f274]">
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
    </div>
  );
}
