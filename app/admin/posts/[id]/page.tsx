"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Trash2,
  X,
} from "lucide-react";

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), { ssr: false });

type Author = { id: string; name: string; avatar_url: string | null };
type Post = {
  id: string; title: string; description: string; body_html: string;
  cover_image_url: string | null; content_type: string; tags: string[];
  author_id: string | null; slug: string; status: string;
};

const PRESET_TYPES = ["Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentType, setContentType] = useState("Article");
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [slug, setSlug] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [postUrl, setPostUrl] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/posts/${id}`).then((r) => r.json() as Promise<{ data: Post }>),
      fetch("/api/admin/authors").then((r) => r.json() as Promise<{ data: Author[] }>),
    ]).then(([postRes, authorsRes]) => {
      const p = postRes.data;
      if (p) {
        setTitle(p.title);
        setDescription(p.description ?? "");
        setBodyHtml(p.body_html ?? "");
        setCoverImageUrl(p.cover_image_url ?? "");
        const isPreset = PRESET_TYPES.includes(p.content_type);
        if (isPreset) { setContentType(p.content_type); }
        else { setShowCustomType(true); setCustomType(p.content_type); }
        setTags(p.tags ?? []);
        setAuthorId(p.author_id ?? "");
        setSlug(p.slug ?? "");
        setIsPublished(p.status === "published");
        if (p.status === "published") setPostUrl(`${window.location.origin}/posts/${p.slug}`);
      }
      setAuthors(authorsRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  const save = useCallback(async (status: "draft" | "published") => {
    setSaving(true);
    await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
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
      }),
    });
    setSaving(false);
    if (status === "published") {
      setIsPublished(true);
      setPostUrl(`${window.location.origin}/posts/${slug}`);
      setPanelOpen(true);
    }
  }, [id, title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug]);

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    router.push("/admin/posts");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const copyLink = () => { navigator.clipboard.writeText(postUrl); };

  const activeType = showCustomType && customType ? customType : contentType;

  if (loading) {
    return <div className="grid h-full place-items-center text-sm text-[#6f6b62]">Loading…</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#111111]/10 bg-white px-4 py-3">
        <Link href="/admin/posts" className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-[#6f6b62]">Edit post</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={deletePost} className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="rounded-md border border-[#111111]/15 px-3 py-1.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => setPanelOpen(true)}
            disabled={saving}
            className="rounded-md bg-[#063b32] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <PostEditor
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            coverImageUrl={coverImageUrl}
            onCoverImageUrlChange={setCoverImageUrl}
            initialHtml={bodyHtml}
            onHtmlChange={setBodyHtml}
          />
        </div>

        {panelOpen && (
          <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-[#111111]/10 bg-white">
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f6b62]">
                {isPublished ? "Post settings" : "Publish post"}
              </p>
              <button onClick={() => setPanelOpen(false)} className="grid h-7 w-7 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {isPublished && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Share</p>
                  <div className="space-y-2">
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#0077B5] hover:bg-[#f7f4ea]">
                      <Linkedin className="h-4 w-4" /> Share on LinkedIn
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#1877F2] hover:bg-[#f7f4ea]">
                      <Facebook className="h-4 w-4" /> Share on Facebook
                    </a>
                    <button onClick={copyLink}
                      className="flex w-full items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                      <Copy className="h-4 w-4" /> Copy link
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">URL Slug</label>
                <div className="flex items-center rounded-md border border-[#111111]/15 bg-[#f7f4ea] px-3 py-2 text-xs">
                  <span className="mr-1 text-[#6f6b62]">/posts/</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 bg-transparent text-[#111111] outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => { setContentType(t); setShowCustomType(false); }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeType === t && !showCustomType ? "bg-[#063b32] text-white" : "border border-[#111111]/15 bg-white text-[#6f6b62] hover:border-[#063b32]/40"}`}>
                      {t}
                    </button>
                  ))}
                  <button type="button" onClick={() => setShowCustomType(true)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${showCustomType ? "bg-[#063b32] text-white" : "border border-dashed border-[#111111]/20 text-[#6f6b62]"}`}>
                    + Custom
                  </button>
                </div>
                {showCustomType && (
                  <input autoFocus value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Custom type…"
                    className="mt-2 w-full rounded-md border border-[#111111]/15 bg-[#f7f4ea] px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Tags</label>
                <div className="flex flex-wrap gap-1.5 rounded-md border border-[#111111]/15 bg-[#f7f4ea] p-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[#111111] shadow-sm">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[#6f6b62] hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                    placeholder={tags.length === 0 ? "Add tags…" : ""}
                    className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#6f6b62]/50" />
                </div>
                <p className="mt-1 text-[10px] text-[#6f6b62]">Press Enter or comma to add.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Author</label>
                <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full rounded-md border border-[#111111]/15 bg-[#f7f4ea] px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                  <option value="">No author assigned</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Cover image</label>
                {coverImageUrl ? (
                  <div className="relative overflow-hidden rounded-md border border-[#111111]/10">
                    <img src={coverImageUrl} alt="" className="aspect-video w-full object-cover" />
                    <button onClick={() => setCoverImageUrl("")} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <input type="url" placeholder="Paste image URL…"
                    onBlur={(e) => { if (e.target.value) setCoverImageUrl(e.target.value); }}
                    className="w-full rounded-md border border-[#111111]/15 bg-[#f7f4ea] px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                )}
              </div>

              <div>
                <button type="button" className="flex w-full items-center justify-between rounded-md border border-[#111111]/10 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">SEO &amp; Discovery</span>
                  <ChevronRight className="h-4 w-4 text-[#6f6b62]" />
                </button>
                <p className="mt-1 text-[10px] text-[#6f6b62]">SEO fields coming soon.</p>
              </div>

              <div className="border-t border-[#111111]/10 pt-4">
                <button onClick={() => save(isPublished ? "published" : "published")} disabled={saving}
                  className="w-full rounded-md bg-[#063b32] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving…" : isPublished ? "Update post" : "Publish post"}
                </button>
                {isPublished && (
                  <button onClick={() => save("draft")} disabled={saving}
                    className="mt-2 w-full rounded-md border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea] disabled:opacity-50">
                    Move to draft
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
