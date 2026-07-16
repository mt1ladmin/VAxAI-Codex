"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Edit2,
  Grid3X3,
  LayoutList,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import FilingTab from "@/components/FilingTab";
import { AppSelect } from "@/components/ui/AppSelect";
import { MultiSelect } from "@/components/ui/MultiSelect";

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  cover_image_url: string | null;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
};

const CONTENT_TYPES = ["All types", "Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];
const STATUS_FILTERS = ["All statuses", "published", "scheduled", "draft"];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/posts");
      const json = await res.json() as { data?: Post[]; error?: string };
      if (!res.ok || json.error) {
        setLoadError(json.error ?? "Failed to load posts");
        setPosts([]);
      } else {
        setPosts(json.data ?? []);
      }
      setSelected(new Set());
    } catch {
      setLoadError("Could not load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags ?? [])));

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const tags = p.tags ?? [];
    if (search && !p.title.toLowerCase().includes(q) && !tags.some((t) => t.toLowerCase().includes(q))) return false;
    if (typeFilter !== "All types" && p.content_type !== typeFilter) return false;
    if (statusFilter !== "All statuses" && p.status !== statusFilter) return false;
    if (tagFilters.length > 0 && !tagFilters.every((t) => p.tags.includes(t))) return false;
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
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-pine-900/8 bg-white px-8 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <FilingTab>Posts</FilingTab>
            <p className="mt-3 text-sm text-muted">
              {posts.length} items · {publishedCount} published · {scheduledCount > 0 ? `${scheduledCount} scheduled · ` : ""}{draftCount} drafts
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F686A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-52 rounded-md border border-[#111111]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#122428]"
            />
          </div>
          <AppSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))}
            size="sm"
            className="min-w-[10rem]"
          />
          {allTags.length > 0 && (
            <MultiSelect
              values={tagFilters}
              onChange={setTagFilters}
              options={allTags}
              placeholder="All tags"
              size="sm"
              className="min-w-[10rem]"
            />
          )}
          <AppSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTERS.map((s) => ({ value: s, label: s }))}
            size="sm"
            className="min-w-[9rem]"
          />

          <div className="ml-auto flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <span className="text-sm text-[#5F686A]">{selected.size} selected</span>
                <button onClick={() => bulkAction("publish")} className="rounded-md border border-[#122428]/30 bg-[#E3ECEE] px-3 py-1.5 text-xs font-semibold text-[#122428] hover:bg-[#122428]/10">Publish</button>
                <button onClick={() => bulkAction("draft")} className="rounded-md border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-pine-50">Move to draft</button>
                <button onClick={() => bulkAction("delete")} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                <button onClick={() => setSelected(new Set())} className="grid h-7 w-7 place-items-center rounded-md border border-[#111111]/15 bg-white text-[#5F686A]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <div className="flex overflow-hidden rounded-md border border-[#111111]/15 bg-white">
              <button onClick={() => setView("grid")} className={`grid h-8 w-8 place-items-center ${view === "grid" ? "bg-[#122428] text-white" : "text-[#5F686A] hover:bg-pine-50"}`}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setView("list")} className={`grid h-8 w-8 place-items-center ${view === "list" ? "bg-[#122428] text-white" : "text-[#5F686A] hover:bg-pine-50"}`}>
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={toggleAll}
              className="rounded-md border border-[#111111]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#5F686A] hover:bg-pine-50"
            >
              {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-red-700">Could not load posts</p>
            <p className="mt-1 text-xs text-red-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-xl bg-pine-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-sm text-[#5F686A]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-[#111111]/10 bg-white py-16 text-center">
            <p className="text-sm text-[#5F686A]">{posts.length === 0 ? "No posts yet." : "No posts match your filters."}</p>
            <Link href="/admin/posts/new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pine-900 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Create your first post
            </Link>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((post) => (
              <div
                key={post.id}
                onClick={(event) => {
                  if (selected.size === 0) return;
                  event.preventDefault();
                  toggleSelect(post.id);
                }}
                className={`group relative overflow-hidden rounded-md border bg-white shadow-sm ${selected.size > 0 ? "cursor-pointer" : ""} ${selected.has(post.id) ? "border-[#122428] ring-1 ring-[#122428]/20" : "border-[#111111]/10"}`}
              >
                {/* Checkbox — always visible */}
                <button
                  onClick={(event) => { event.stopPropagation(); toggleSelect(post.id); }}
                  className={`absolute left-2.5 top-2.5 z-20 grid h-5 w-5 place-items-center rounded border-2 shadow-sm transition-colors ${
                    selected.has(post.id)
                      ? "border-[#122428] bg-[#122428]"
                      : "border-white bg-white/90 hover:border-[#122428]"
                  }`}
                >
                  {selected.has(post.id) && <Check className="h-3 w-3 text-white" />}
                </button>

                {/* Type badge — offset so it doesn't overlap checkbox */}
                <div className="absolute left-9 top-2.5 z-10">
                  {!selected.has(post.id) && (
                    <span className="rounded-full bg-[#122428]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      {post.content_type}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute right-2.5 top-2.5 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#111111] shadow-sm hover:bg-pine-50"
                    title="Edit post"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={(event) => { event.stopPropagation(); void deletePost(post.id); }}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-pine-50"
                    title="Delete post"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Cover */}
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="block w-full aspect-video overflow-hidden bg-white"
                >
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#122428] to-[#1B343A] p-4">
                      <p className="line-clamp-3 text-center text-sm font-semibold leading-tight text-white">{post.title || "Untitled"}</p>
                    </div>
                  )}
                </Link>

                {/* Meta */}
                <div className="p-4">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="line-clamp-2 text-left text-sm font-semibold text-[#111111] leading-snug hover:text-[#122428]"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  <p className="mt-2 text-xs text-[#5F686A]">
                    Edited {new Date(post.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      post.status === "published" ? "bg-pine-900 text-paper" :
                      post.status === "scheduled" ? "bg-pine-100 text-pine-800" :
                      "bg-acid text-ink"
                    }`}>
                      {post.status}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="text-[10px] text-[#5F686A]">{post.tags.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#111111]/10 bg-white">
            {filtered.map((post, i) => (
              <div
                key={post.id}
                onClick={(event) => {
                  if (selected.size === 0) return;
                  event.preventDefault();
                  toggleSelect(post.id);
                }}
                className={`group flex items-center gap-4 px-5 py-4 ${selected.size > 0 ? "cursor-pointer" : ""} ${selected.has(post.id) ? "bg-[#122428]/5" : ""} ${i < filtered.length - 1 ? "border-b border-[#111111]/8" : ""}`}
              >
                <button
                  onClick={(event) => { event.stopPropagation(); toggleSelect(post.id); }}
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    selected.has(post.id) ? "border-[#122428] bg-[#122428]" : "border-[#111111]/25"
                  }`}
                >
                  {selected.has(post.id) && <Check className="h-3 w-3 text-white" />}
                </button>
                {/* Thumbnail */}
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="h-10 w-16 shrink-0 overflow-hidden rounded bg-white"
                >
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#122428] to-[#1B343A]" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="truncate font-semibold text-[#111111] hover:text-[#122428] block"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-[#5F686A]">{post.content_type} · Edited {new Date(post.updated_at).toLocaleDateString("en-GB")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  post.status === "published" ? "bg-pine-900 text-paper" :
                  post.status === "scheduled" ? "bg-pine-100 text-pine-800" :
                  "bg-acid text-ink"
                }`}>{post.status}</span>
                <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                  <Link href={`/admin/posts/${post.id}`} className="grid h-7 w-7 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50" title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={(event) => { event.stopPropagation(); void deletePost(post.id); }} className="grid h-7 w-7 place-items-center rounded-md text-[#5F686A] hover:bg-red-50 hover:text-red-600" title="Delete">
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
