"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Edit2, Grid3X3, LayoutList, Plus, Search, Trash2, X } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: string;
  tags: string[];
  status: "draft" | "published";
  cover_image_url: string | null;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
};

const CONTENT_TYPES = ["All types", "Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];
const STATUS_FILTERS = ["All statuses", "published", "draft"];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [tagFilter, setTagFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    const json = await res.json() as { data: Post[] };
    setPosts(json.data ?? []);
    setSelected(new Set());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All types" && p.content_type !== typeFilter) return false;
    if (statusFilter !== "All statuses" && p.status !== statusFilter) return false;
    if (tagFilter && !p.tags.includes(tagFilter)) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const bulkAction = async (action: "publish" | "draft" | "delete") => {
    const ids = Array.from(selected);
    if (action === "delete") {
      if (!confirm(`Delete ${ids.length} post${ids.length !== 1 ? "s" : ""}?`)) return;
      await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } else {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: action === "publish" ? "published" : "draft" }),
          })
        )
      );
    }
    load();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    load();
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 bg-white px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111111]">Posts</h1>
            <p className="mt-0.5 text-sm text-[#6f6b62]">
              {posts.length} items · {publishedCount} published · {draftCount} drafts
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 rounded-md bg-[#063b32] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-52 rounded-md border border-[#111111]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#063b32]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            {CONTENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {allTags.length > 0 && (
            <select
              value={tagFilter || "All tags"}
              onChange={(e) => setTagFilter(e.target.value === "All tags" ? "" : e.target.value)}
              className="rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
            >
              <option>All tags</option>
              {allTags.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]"
          >
            {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <span className="text-sm text-[#6f6b62]">{selected.size} selected</span>
                <button onClick={() => bulkAction("publish")} className="rounded-md border border-[#063b32]/30 bg-[#f3f9f5] px-3 py-1.5 text-xs font-semibold text-[#063b32] hover:bg-[#063b32]/10">Publish</button>
                <button onClick={() => bulkAction("draft")} className="rounded-md border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">Move to draft</button>
                <button onClick={() => bulkAction("delete")} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                <button onClick={() => setSelected(new Set())} className="grid h-7 w-7 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#6f6b62]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <div className="flex overflow-hidden rounded-md border border-[#111111]/15 bg-white">
              <button onClick={() => setView("grid")} className={`grid h-8 w-8 place-items-center ${view === "grid" ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"}`}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setView("list")} className={`grid h-8 w-8 place-items-center ${view === "list" ? "bg-[#063b32] text-white" : "text-[#6f6b62] hover:bg-[#f7f4ea]"}`}>
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Select all */}
            <button
              onClick={toggleAll}
              className="rounded-md border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
            >
              {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6f6b62]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-[#111111]/10 bg-white py-16 text-center">
            <p className="text-sm text-[#6f6b62]">No posts yet.</p>
            <Link href="/admin/posts/new" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#063b32] px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Create your first post
            </Link>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((post) => (
              <div key={post.id} className="group relative overflow-hidden rounded-md border border-[#111111]/10 bg-white shadow-sm">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(post.id)}
                  className={`absolute left-2.5 top-2.5 z-10 grid h-5 w-5 place-items-center rounded border-2 transition-opacity ${
                    selected.has(post.id)
                      ? "border-[#063b32] bg-[#063b32] opacity-100"
                      : "border-white bg-white/80 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {selected.has(post.id) && <Check className="h-3 w-3 text-white" />}
                </button>

                {/* Type badge */}
                <div className="absolute left-2.5 top-2.5 z-10">
                  {!selected.has(post.id) && (
                    <span className="rounded-full bg-[#063b32]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      {post.content_type}
                    </span>
                  )}
                </div>

                {/* Edit button */}
                <div className="absolute right-2.5 top-2.5 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#111111] shadow-sm hover:bg-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Cover */}
                <Link href={`/admin/posts/${post.id}`} className="block aspect-video overflow-hidden bg-[#f7f4ea]">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#063b32] to-[#0a5c48] p-4">
                      <p className="line-clamp-3 text-center text-sm font-semibold leading-tight text-white">{post.title || "Untitled"}</p>
                    </div>
                  )}
                </Link>

                {/* Meta */}
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-[#111111] leading-snug">{post.title || "Untitled"}</p>
                  <p className="mt-2 text-xs text-[#6f6b62]">
                    Edited {new Date(post.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      post.status === "published"
                        ? "bg-[#063b32]/10 text-[#063b32]"
                        : "bg-[#f5f274]/60 text-[#6f6b62]"
                    }`}>
                      {post.status}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="text-[10px] text-[#6f6b62]">{post.tags.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#111111]/10 bg-white">
            {filtered.map((post, i) => (
              <div key={post.id} className={`group flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? "border-b border-[#111111]/8" : ""}`}>
                <button
                  onClick={() => toggleSelect(post.id)}
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    selected.has(post.id) ? "border-[#063b32] bg-[#063b32]" : "border-[#111111]/25"
                  }`}
                >
                  {selected.has(post.id) && <Check className="h-3 w-3 text-white" />}
                </button>
                <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-[#f7f4ea]">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#063b32] to-[#0a5c48]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-[#111111]">{post.title || "Untitled"}</p>
                  <p className="text-xs text-[#6f6b62]">{post.content_type} · Edited {new Date(post.updated_at).toLocaleDateString("en-GB")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  post.status === "published" ? "bg-[#063b32]/10 text-[#063b32]" : "bg-[#f5f274]/60 text-[#6f6b62]"
                }`}>{post.status}</span>
                <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                  <Link href={`/admin/posts/${post.id}`} className="grid h-7 w-7 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => deletePost(post.id)} className="grid h-7 w-7 place-items-center rounded-md text-[#6f6b62] hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
