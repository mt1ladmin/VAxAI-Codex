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
  Instagram,
  Linkedin,
  Trash2,
  X,
} from "lucide-react";

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), { ssr: false });
import ImageUpload from "@/components/admin/ImageUpload";

type Author = { id: string; name: string; avatar_url: string | null };
type Post = {
  id: string; title: string; description: string; body_html: string;
  cover_image_url: string | null; content_type: string; tags: string[];
  author_id: string | null; slug: string; status: string; scheduled_at: string | null;
};

type SocialDraft = {
  sharing_caption?: string;
  linkedin_post?: string;
  instagram_caption?: string;
  hashtags?: string[];
};

const PRESET_TYPES = ["Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white shadow-xl">
        <Check className="h-4 w-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

function SocialPreviewModal({
  social,
  onClose,
}: {
  social: SocialDraft;
  onClose: () => void;
}) {
  const [copiedLi, setCopiedLi] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const hashtagStr = (social.hashtags ?? []).map((h) => `#${h}`).join(" ");

  const copy = async (text: string, which: "li" | "ig") => {
    await navigator.clipboard.writeText(text);
    if (which === "li") { setCopiedLi(true); setTimeout(() => setCopiedLi(false), 2000); }
    else { setCopiedIg(true); setTimeout(() => setCopiedIg(false), 2000); }
  };

  const liContent = [social.linkedin_post, hashtagStr].filter(Boolean).join("\n\n");
  const igContent = [social.instagram_caption, hashtagStr].filter(Boolean).join("\n\n");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Social versions ready to copy</h3>
            <p className="mt-0.5 text-xs text-[#6f6b62]">Copy before publishing — these won&apos;t be shown again here.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#f7f4ea]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 p-5">
          {social.sharing_caption && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Sharing caption</p>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.sharing_caption}</p>
            </div>
          )}
          {social.linkedin_post && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Linkedin className="h-4 w-4 text-[#0077B5]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">LinkedIn post</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(liContent, "li")}
                  className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
                >
                  {copiedLi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedLi ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.linkedin_post}</p>
              {hashtagStr && <p className="mt-2 text-xs text-[#6f6b62]">{hashtagStr}</p>}
            </div>
          )}
          {social.instagram_caption && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-[#E1306C]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Instagram caption</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(igContent, "ig")}
                  className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#6f6b62] hover:bg-[#f7f4ea]"
                >
                  {copiedIg ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedIg ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.instagram_caption}</p>
              {hashtagStr && <p className="mt-2 text-xs text-[#6f6b62]">{hashtagStr}</p>}
            </div>
          )}
        </div>
        <div className="border-t border-[#111111]/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#063b32] py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-[#111111]">Delete this post?</h3>
        <p className="mt-1 text-sm text-[#6f6b62]">This action cannot be undone.</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
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
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");

  // Social draft from sessionStorage (set by ContentCreateModal)
  const [socialDraft, setSocialDraft] = useState<SocialDraft | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Modals
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

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
        if (p.status === "scheduled" && p.scheduled_at) {
          const dt = new Date(p.scheduled_at);
          const pad = (n: number) => String(n).padStart(2, "0");
          setScheduledAt(`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
          setPublishMode("schedule");
        }
      }
      setAuthors(authorsRes.data ?? []);
      setLoading(false);

      // Read social draft from sessionStorage
      try {
        const raw = sessionStorage.getItem(`vaxai_social_${id}`);
        if (raw) setSocialDraft(JSON.parse(raw) as SocialDraft);
      } catch { /* ignore */ }
    });
  }, [id]);

  const save = useCallback(async (status: "draft" | "published" | "scheduled") => {
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
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      }),
    });
    setSaving(false);
    if (status === "published") {
      setIsPublished(true);
      setPostUrl(`${window.location.origin}/posts/${slug}`);
      setPanelOpen(true);
      // Show social preview popup if social content exists
      if (socialDraft?.linkedin_post || socialDraft?.instagram_caption) {
        setShowSocialPreview(true);
      } else {
        showToast("Post published");
      }
    } else if (status === "draft" && isPublished) {
      setIsPublished(false);
      showToast("Moved to draft");
    } else if (status === "draft") {
      showToast("Draft saved");
    } else if (status === "scheduled") {
      showToast("Post scheduled");
    }
  }, [id, title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, socialDraft, isPublished]);

  const deletePost = async () => {
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    sessionStorage.removeItem(`vaxai_social_${id}`);
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
      <Toast message={toastMsg} visible={toastVisible} />

      {showSocialPreview && socialDraft && (
        <SocialPreviewModal
          social={socialDraft}
          onClose={() => {
            setShowSocialPreview(false);
            showToast("Post published");
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => { setShowDeleteConfirm(false); void deletePost(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#111111]/10 bg-white px-4 py-3">
        <Link href="/admin/posts" className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-[#6f6b62]">Edit post</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowDeleteConfirm(true)} className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => void save("draft")}
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
                    <button onClick={copyLink}
                      className="flex w-full items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#f7f4ea]">
                      <Copy className="h-4 w-4" /> Copy link
                    </button>
                  </div>
                </div>
              )}

              {/* Sharing caption from ContentCreateModal */}
              {socialDraft?.sharing_caption && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Sharing caption</p>
                  <p className="rounded-md border border-[#111111]/10 bg-[#f7f4ea] px-3 py-2 text-sm text-[#111111]">
                    {socialDraft.sharing_caption}
                  </p>
                  {(socialDraft.linkedin_post || socialDraft.instagram_caption) && !isPublished && (
                    <p className="mt-1 text-[10px] text-[#6f6b62]">
                      LinkedIn & Instagram versions will appear when you publish.
                    </p>
                  )}
                  {isPublished && (socialDraft.linkedin_post || socialDraft.instagram_caption) && (
                    <button
                      type="button"
                      onClick={() => setShowSocialPreview(true)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]"
                    >
                      View social versions
                    </button>
                  )}
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
                <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} aspectClass="aspect-video w-full" />
              </div>

              <div>
                <button type="button" className="flex w-full items-center justify-between rounded-md border border-[#111111]/10 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">SEO &amp; Discovery</span>
                  <ChevronRight className="h-4 w-4 text-[#6f6b62]" />
                </button>
                <p className="mt-1 text-[10px] text-[#6f6b62]">SEO fields coming soon.</p>
              </div>

              {/* Publish timing */}
              {!isPublished && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">When to publish</label>
                  <div className="flex overflow-hidden rounded-md border border-[#111111]/15 text-xs font-semibold">
                    <button type="button" onClick={() => setPublishMode("now")}
                      className={`flex-1 py-2 transition-colors ${publishMode === "now" ? "bg-[#063b32] text-white" : "bg-white text-[#6f6b62] hover:bg-gray-50"}`}>
                      Publish now
                    </button>
                    <button type="button" onClick={() => setPublishMode("schedule")}
                      className={`flex-1 py-2 transition-colors ${publishMode === "schedule" ? "bg-[#063b32] text-white" : "bg-white text-[#6f6b62] hover:bg-gray-50"}`}>
                      Schedule
                    </button>
                  </div>
                  {publishMode === "schedule" && (
                    <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                      className="mt-2 w-full rounded-md border border-[#111111]/15 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                  )}
                </div>
              )}

              <div className="border-t border-[#111111]/10 pt-4">
                {publishMode === "now" || isPublished ? (
                  <button onClick={() => void save("published")} disabled={saving}
                    className="w-full rounded-md bg-[#063b32] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                    {saving ? "Saving…" : isPublished ? "Update post" : "Publish post"}
                  </button>
                ) : (
                  <button onClick={() => void save("scheduled")} disabled={saving || !scheduledAt}
                    className="w-full rounded-md bg-amber-500 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                    {saving ? "Scheduling…" : "Schedule post"}
                  </button>
                )}
                {isPublished && (
                  <button onClick={() => void save("draft")} disabled={saving}
                    className="mt-2 w-full rounded-md border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#6f6b62] hover:bg-gray-100 disabled:opacity-50">
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
