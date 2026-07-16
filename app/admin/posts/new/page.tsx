"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Instagram,
  Linkedin,
  Plus,
  X,
} from "lucide-react";

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), { ssr: false });
import { AppSelect } from "@/components/ui/AppSelect";

type Author = { id: string; name: string; avatar_url: string | null };

const PRESET_TYPES = ["Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentType, setContentType] = useState("Article");
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [authorId, setAuthorId] = useState<string>("");
  const [slug, setSlug] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [postUrl, setPostUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [sharingCaption, setSharingCaption] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/authors").then((r) => r.json()).then((j: { data: Author[] }) => setAuthors(j.data ?? []));
  }, []);

  useEffect(() => {
    if (!slug || slug === slugify(title.slice(0, -1))) {
      setSlug(slugify(title));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const save = useCallback(async (status: "draft" | "published" | "scheduled") => {
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Untitled",
        description,
        body_html: bodyHtml,
        cover_image_url: coverImageUrl || null,
        content_type: showCustomType && customType ? customType : contentType,
        tags,
        author_id: authorId || null,
        slug: slug || slugify(title || "untitled"),
        status,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        sharing_caption: sharingCaption.trim() || null,
      }),
    });
    const json = await res.json() as { data: { id: string; slug: string } };
    setSaving(false);
    if (json.data) {
      if (status === "published") {
        setPublished(true);
        setPostUrl(`${window.location.origin}/posts/${json.data.slug}`);
      } else {
        router.push(`/admin/posts/${json.data.id}`);
      }
    }
  }, [title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, sharingCaption, router]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const copyLink = () => { navigator.clipboard.writeText(postUrl); };

  const activeType = showCustomType && customType ? customType : contentType;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:h-full md:min-h-0">
      {/* Top bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-pine-900/10 bg-white px-3 py-3 sm:gap-3 sm:px-4">
        <Link href="/admin/posts" className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-pine-50" title="Back to posts">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-pine-700">Posts</p>
          <p className="truncate text-sm font-semibold text-pine-900">New post</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void save("draft")}
            disabled={saving}
            className="rounded-xl border border-pine-900/12 bg-white px-3 py-2.5 text-sm font-semibold text-pine-900 hover:bg-pine-50 disabled:opacity-50 sm:px-3.5"
          >
            <span className="sm:hidden">Draft</span>
            <span className="hidden sm:inline">Save draft</span>
          </button>
          <button
            onClick={() => setPanelOpen(true)}
            disabled={saving}
            className="rounded-xl bg-pine-900 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-pine-800 disabled:opacity-50 sm:px-4"
          >
            Publish…
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-white">
        {/* Editor */}
        <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <PostEditor
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            coverImageUrl={coverImageUrl}
            onCoverImageUrlChange={setCoverImageUrl}
            onHtmlChange={setBodyHtml}
          />
        </div>

        {/* Publish panel — full-screen sheet on mobile, side panel on desktop */}
        {panelOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white shadow-xl max-md:pt-[env(safe-area-inset-top)] md:static md:inset-auto md:z-auto md:w-80 md:shrink-0 md:border-l md:border-pine-900/10 md:shadow-sm">
            <div className="flex shrink-0 items-center justify-between border-b border-pine-900/8 px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-pine-700">Publish</p>
                <p className="mt-0.5 text-xs text-muted">Settings, schedule &amp; share</p>
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-pine-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            {published ? (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-4 flex items-center gap-2 rounded-md bg-[#E3ECEE] p-3">
                  <Check className="h-4 w-4 text-[#122428]" />
                  <p className="text-sm font-semibold text-[#122428]">Published!</p>
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Share</p>
                <div className="space-y-2">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#0077B5] hover:bg-pine-50">
                    <Linkedin className="h-4 w-4" /> Share on LinkedIn
                  </a>
                  <div className="flex items-center gap-2 rounded-md border border-[#111111]/10 px-3 py-2.5">
                    <Instagram className="h-4 w-4 shrink-0 text-[#E1306C]" />
                    <span className="flex-1 truncate text-xs text-[#5F686A]">{postUrl}</span>
                    <button onClick={copyLink} className="shrink-0 text-[#5F686A] hover:text-[#122428]" title="Copy link">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={copyLink}
                    className="flex w-full items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-pine-50">
                    <Copy className="h-4 w-4" /> Copy link
                  </button>
                </div>
                <Link href="/admin/posts" className="mt-4 flex items-center gap-1 text-xs text-[#5F686A] hover:text-[#111111]">
                  <ArrowLeft className="h-3 w-3" /> Back to posts
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                  {/* Share caption */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Share caption</label>
                    <textarea
                      value={sharingCaption}
                      onChange={(e) => setSharingCaption(e.target.value)}
                      rows={3}
                      placeholder="Add a short sharing caption…"
                      className="w-full resize-none rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[#122428]"
                    />
                  </div>

                  {/* Connected posts */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Connected posts</p>
                    <p className="mb-2 text-xs text-[#5F686A]/70">No connected social posts yet.</p>
                    <button
                      type="button"
                      onClick={() => void save("draft")}
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#111111]/20 px-3 py-2 text-xs font-semibold text-[#5F686A] hover:border-[#122428]/40 hover:text-[#122428] disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Save draft to add connected post
                    </button>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">URL Slug</label>
                    <div className="flex items-center rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-xs">
                      <span className="mr-1 text-[#5F686A]">/posts/</span>
                      <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="flex-1 bg-transparent text-[#111111] outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[#5F686A]">Auto-generated from title. Edit to customise.</p>
                  </div>

                  {/* Content type */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setContentType(t); setShowCustomType(false); }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            activeType === t && !showCustomType
                              ? "bg-[#122428] text-white"
                              : "border border-[#111111]/15 bg-white text-[#5F686A] hover:border-[#122428]/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCustomType(true)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          showCustomType
                            ? "bg-[#122428] text-white"
                            : "border border-dashed border-[#111111]/20 text-[#5F686A] hover:border-[#122428]/40"
                        }`}
                      >
                        + Custom
                      </button>
                    </div>
                    {showCustomType && (
                      <input
                        autoFocus
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Custom type name…"
                        className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]"
                      />
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <button type="button" onClick={() => setTagsOpen((value) => !value)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                      <span>Tags {tags.length > 0 && <span className="ml-1 rounded-full bg-[#122428]/10 px-1.5 py-0.5 text-[10px] text-[#122428]">{tags.length}</span>}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${tagsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {tagsOpen && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1.5 rounded-md border border-[#111111]/15 bg-white p-2">
                          {tags.map((tag) => (
                            <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-[#111111]">
                              {tag}
                              <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[#5F686A] hover:text-red-500"><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} placeholder={tags.length === 0 ? "Add tags…" : ""} className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#5F686A]/50" />
                        </div>
                        <p className="mt-1 text-[10px] text-[#5F686A]">Press Enter or comma to add.</p>
                      </div>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Author</label>
                    <AppSelect
                      value={authorId}
                      onChange={setAuthorId}
                      options={authors.map((a) => ({ value: a.id, label: a.name }))}
                      placeholder="No author assigned"
                      size="sm"
                    />
                    {authors.length === 0 && (
                      <p className="mt-1 text-[10px] text-[#5F686A]">
                        <Link href="/admin/authors" className="underline">Add authors</Link> first.
                      </p>
                    )}
                  </div>

                  {/* Publish timing */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">When to publish</label>
                    <div className="flex overflow-hidden rounded-md border border-[#111111]/15 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPublishMode("now")}
                        className={`flex-1 py-2 transition-colors ${publishMode === "now" ? "bg-[#122428] text-white" : "bg-white text-[#5F686A] hover:bg-gray-50"}`}
                      >
                        Publish now
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishMode("schedule")}
                        className={`flex-1 py-2 transition-colors ${publishMode === "schedule" ? "bg-[#122428] text-white" : "bg-white text-[#5F686A] hover:bg-gray-50"}`}
                      >
                        Schedule
                      </button>
                    </div>
                    {publishMode === "schedule" && (
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]"
                      />
                    )}
                  </div>
                </div>

                {/* Sticky publish footer */}
                <div className="shrink-0 border-t border-[#111111]/10 px-5 py-4">
                  {publishMode === "now" ? (
                    <button
                      onClick={() => void save("published")}
                      disabled={saving}
                      className="w-full rounded-md bg-[#122428] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "Publishing…" : "Publish post"}
                    </button>
                  ) : (
                    <button
                      onClick={() => void save("scheduled")}
                      disabled={saving || !scheduledAt}
                      className="w-full rounded-md bg-pine-900 py-3 text-sm font-semibold text-paper hover:bg-pine-800 disabled:opacity-50"
                    >
                      {saving ? "Scheduling…" : "Schedule post"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
