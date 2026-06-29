"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), { ssr: false });
import {
  SocialPostPreviewModal as PlatformPreviewModal,
  SocialPostSummaryCard,
  type SocialPostPreview,
} from "@/components/admin/SocialPostPreviewModal";

type Author = { id: string; name: string; avatar_url: string | null };
type Post = {
  id: string; title: string; description: string; body_html: string;
  cover_image_url: string | null; content_type: string; tags: string[];
  author_id: string | null; slug: string; status: string; scheduled_at: string | null;
  sharing_caption: string | null; linkedin_post: string | null;
  instagram_caption: string | null; social_hashtags: string[];
};

type SocialDraft = {
  sharing_caption?: string;
  linkedin_post?: string;
  instagram_caption?: string;
  hashtags?: string[];
};

type LinkedSocialPost = Omit<SocialPostPreview, "scheduled_date"> & { scheduled_date: string };

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
  postUrl,
  onClose,
}: {
  social: SocialDraft;
  postUrl: string;
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

  const liContent = [social.linkedin_post, postUrl || null, hashtagStr || null].filter(Boolean).join("\n\n");
  const igContent = [social.instagram_caption, postUrl || null, hashtagStr || null].filter(Boolean).join("\n\n");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Social versions ready to copy</h3>
            <p className="mt-0.5 text-xs text-[#6f6b62]">Post link is embedded — copy and go.</p>
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
                <div className="flex items-center gap-1.5">
                  <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-[#0077B5]/30 px-2.5 py-1 text-xs font-medium text-[#0077B5] hover:bg-[#0077B5]/5">
                    <Linkedin className="h-3 w-3" /> Post
                  </a>
                  <button type="button" onClick={() => void copy(liContent, "li")}
                    className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#6f6b62] hover:bg-[#f7f4ea]">
                    {copiedLi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedLi ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.linkedin_post}</p>
              {postUrl && <p className="mt-2 text-xs text-[#0077B5] break-all">{postUrl}</p>}
              {hashtagStr && <p className="mt-1 text-xs text-[#6f6b62]">{hashtagStr}</p>}
            </div>
          )}
          {social.instagram_caption && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-[#E1306C]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">Instagram caption</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-[#E1306C]/30 px-2.5 py-1 text-xs font-medium text-[#E1306C] hover:bg-[#E1306C]/5">
                    <Instagram className="h-3 w-3" /> Post
                  </a>
                  <button type="button" onClick={() => void copy(igContent, "ig")}
                    className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#6f6b62] hover:bg-[#f7f4ea]">
                    {copiedIg ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedIg ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.instagram_caption}</p>
              {postUrl && <p className="mt-2 text-xs text-[#E1306C] break-all">{postUrl}</p>}
              {hashtagStr && <p className="mt-1 text-xs text-[#6f6b62]">{hashtagStr}</p>}
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
  const [linkedSocial, setLinkedSocial] = useState<LinkedSocialPost[]>([]);

  // Social draft from sessionStorage (set by ContentCreateModal)
  const [socialDraft, setSocialDraft] = useState<SocialDraft | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Tags collapsible
  const [tagsOpen, setTagsOpen] = useState(false);

  // Add connected social post
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [addSocialForm, setAddSocialForm] = useState<{ platform: string; title: string; content: string; scheduled_date: string }>({ platform: "linkedin", title: "", content: "", scheduled_date: "" });
  const [addingSocial, setAddingSocial] = useState(false);

  // Modals
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSocialPreview, setActiveSocialPreview] = useState<SocialPostPreview | null>(null);

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/posts/${id}`).then((r) => r.json() as Promise<{ data: Post }>),
      fetch("/api/admin/authors").then((r) => r.json() as Promise<{ data: Author[] }>),
      fetch("/api/admin/social-posts").then((r) => r.json() as Promise<{ data: LinkedSocialPost[] }>),
    ]).then(([postRes, authorsRes, socialRes]) => {
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
      setLinkedSocial((socialRes.data ?? []).filter((social) => social.link === `/admin/posts/${id}`));

      // Load social content from DB, fall back to localStorage for posts created before DB persistence
      if (p && (p.sharing_caption || p.linkedin_post || p.instagram_caption)) {
        const draft: SocialDraft = {
          sharing_caption: p.sharing_caption ?? undefined,
          linkedin_post: p.linkedin_post ?? undefined,
          instagram_caption: p.instagram_caption ?? undefined,
          hashtags: p.social_hashtags ?? [],
        };
        setSocialDraft(draft);
        setPanelOpen(true);
      } else {
        try {
          const raw = localStorage.getItem(`vaxai_social_${id}`);
          if (raw) {
            const draft = JSON.parse(raw) as SocialDraft;
            setSocialDraft(draft);
            if (draft.linkedin_post || draft.instagram_caption || draft.sharing_caption) {
              setPanelOpen(true);
            }
          }
        } catch { /* ignore */ }
      }

      setLoading(false);
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
        sharing_caption: socialDraft?.sharing_caption ?? null,
        linkedin_post: socialDraft?.linkedin_post ?? null,
        instagram_caption: socialDraft?.instagram_caption ?? null,
        social_hashtags: socialDraft?.hashtags ?? [],
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
    router.push("/admin/posts");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const copyLink = () => { navigator.clipboard.writeText(postUrl); };

  const addConnectedPost = async () => {
    if (!addSocialForm.title || !addSocialForm.scheduled_date) return;
    setAddingSocial(true);
    await fetch("/api/admin/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: addSocialForm.title,
        platform: addSocialForm.platform,
        content: addSocialForm.content,
        description: "",
        scheduled_date: addSocialForm.scheduled_date,
        tags: [],
        link: `/admin/posts/${id}`,
      }),
    });
    setAddingSocial(false);
    setShowAddSocial(false);
    setAddSocialForm({ platform: "linkedin", title: "", content: "", scheduled_date: "" });
    // Reload linked social posts
    const res = await fetch("/api/admin/social-posts");
    const json = await res.json() as { data: LinkedSocialPost[] };
    setLinkedSocial((json.data ?? []).filter((social) => social.link === `/admin/posts/${id}`));
  };

  const deleteLinkedSocial = async (socialId: string) => {
    await fetch(`/api/admin/social-posts/${socialId}`, { method: "DELETE" });
    setLinkedSocial((prev) => prev.filter((s) => s.id !== socialId));
  };

  const panelHashtagStr = (socialDraft?.hashtags ?? []).map((h) => `#${h}`).join(" ");
  const panelLiContent = [socialDraft?.linkedin_post, postUrl || null, panelHashtagStr || null].filter(Boolean).join("\n\n");
  const panelIgContent = [socialDraft?.instagram_caption, postUrl || null, panelHashtagStr || null].filter(Boolean).join("\n\n");
  const linkedPlatforms = new Set(linkedSocial.map((social) => social.platform));
  const socialPreviews: SocialPostPreview[] = [
    ...(socialDraft?.sharing_caption ? [{
      id: `share-${id}`,
      title: "Share text",
      platform: "share" as const,
      content: socialDraft.sharing_caption,
    }] : []),
    ...linkedSocial,
    ...(socialDraft?.linkedin_post && !linkedPlatforms.has("linkedin") ? [{
      id: `linkedin-${id}`,
      title: `${title || "Post"} — LinkedIn`,
      platform: "linkedin" as const,
      content: panelLiContent,
    }] : []),
    ...(socialDraft?.instagram_caption && !linkedPlatforms.has("instagram") ? [{
      id: `instagram-${id}`,
      title: `${title || "Post"} — Instagram`,
      platform: "instagram" as const,
      content: panelIgContent,
    }] : []),
  ];

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
          postUrl={postUrl}
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

      {showAddSocial && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddSocial(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <h3 className="text-sm font-semibold text-[#111111]">Add connected post</h3>
              <button type="button" onClick={() => setShowAddSocial(false)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {/* Platform */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "linkedin", Icon: Linkedin, label: "LinkedIn", color: "#0077b5" },
                    { key: "instagram", Icon: Instagram, label: "Instagram", color: "#E1306C" },
                    { key: "facebook", Icon: Facebook, label: "Facebook", color: "#1877f2" },
                    { key: "twitter", Icon: XIcon, label: "X", color: "#000" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setAddSocialForm((f) => ({ ...f, platform: p.key }))}
                      className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-colors ${addSocialForm.platform === p.key ? "border-current bg-gray-50" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                      style={addSocialForm.platform === p.key ? { color: p.color, borderColor: p.color } : {}}
                    >
                      <p.Icon className="h-4 w-4" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Title <span className="text-red-500">*</span></label>
                <input
                  value={addSocialForm.title}
                  onChange={(e) => setAddSocialForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="A short label for this post"
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
              {/* Date */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Publish date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={addSocialForm.scheduled_date}
                  onChange={(e) => setAddSocialForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
              {/* Content */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Post content</label>
                <textarea
                  rows={4}
                  value={addSocialForm.content}
                  onChange={(e) => setAddSocialForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the post copy here…"
                  className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]"
                />
              </div>
            </div>
            <div className="border-t border-[#111111]/10 px-5 py-4">
              <button
                type="button"
                disabled={addingSocial || !addSocialForm.title || !addSocialForm.scheduled_date}
                onClick={() => void addConnectedPost()}
                className="w-full rounded-lg bg-[#063b32] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {addingSocial ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span> : "Save post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSocialPreview && (
        <PlatformPreviewModal
          social={activeSocialPreview}
          onClose={() => setActiveSocialPreview(null)}
          onDelete={() => { void deleteLinkedSocial(activeSocialPreview.id); setActiveSocialPreview(null); }}
          onSaved={(updated) => {
            setLinkedSocial((prev) =>
              prev.map((s) =>
                s.id === updated.id
                  ? { ...s, ...updated, scheduled_date: updated.scheduled_date ?? s.scheduled_date }
                  : s
              )
            );
            setActiveSocialPreview(null);
          }}
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
        <div className="flex-1 overflow-y-auto bg-white">
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
          <div className="flex w-80 shrink-0 flex-col border-l border-[#111111]/10 bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f6b62]">
                {isPublished ? "Post settings" : "Publish post"}
              </p>
              <button onClick={() => setPanelOpen(false)} className="grid h-7 w-7 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Share caption */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Share caption</label>
                <textarea
                  value={socialDraft?.sharing_caption ?? ""}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, sharing_caption: e.target.value || undefined }))}
                  rows={3}
                  placeholder="Add a short sharing caption…"
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[#063b32] resize-none"
                />
              </div>

              {/* Share on LinkedIn + Copy link */}
              {isPublished && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Share</p>
                  <div className="space-y-2">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#0077B5] hover:bg-[#0077B5]/5"
                    >
                      <Linkedin className="h-4 w-4" /> Share on LinkedIn
                    </a>
                    <button
                      onClick={copyLink}
                      className="flex w-full items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" /> Copy link
                    </button>
                  </div>
                </div>
              )}

              {/* Connected posts */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Connected posts</p>
                {linkedSocial.length > 0 ? (
                  <div className="space-y-2 mb-2">
                    {linkedSocial.map((social) => (
                      <SocialPostSummaryCard
                        key={social.id}
                        social={social}
                        onOpen={() => setActiveSocialPreview(social)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mb-2 text-xs text-[#6f6b62]/70">No connected social posts yet.</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddSocial(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#111111]/20 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:border-[#063b32]/40 hover:text-[#063b32]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add connected post
                </button>
              </div>

              {/* URL Slug */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">URL Slug</label>
                <div className="flex items-center rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-xs">
                  <span className="mr-1 text-[#6f6b62]">/posts/</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 bg-transparent text-[#111111] outline-none" />
                </div>
              </div>

              {/* Type */}
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
                    className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                )}
              </div>

              {/* Tags (collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setTagsOpen((o) => !o)}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]"
                >
                  <span>Tags {tags.length > 0 && <span className="ml-1 rounded-full bg-[#063b32]/10 px-1.5 py-0.5 text-[10px] text-[#063b32]">{tags.length}</span>}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${tagsOpen ? "rotate-180" : ""}`} />
                </button>
                {tagsOpen && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1.5 rounded-md border border-[#111111]/15 bg-white p-2">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-[#111111]">
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
                )}
              </div>

              {/* Author */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">Author</label>
                <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full appearance-none rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]">
                  <option value="">No author assigned</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
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
                      className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
                  )}
                </div>
              )}
            </div>

            {/* Sticky publish footer */}
            <div className="shrink-0 border-t border-[#111111]/10 px-5 py-4">
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
        )}
      </div>
    </div>
  );
}
