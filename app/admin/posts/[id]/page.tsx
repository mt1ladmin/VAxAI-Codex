"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Instagram,
  Linkedin,
  Loader2,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { AppSelect } from "@/components/ui/AppSelect";

const PostEditor = dynamic(() => import("@/components/admin/PostEditor"), { ssr: false });
import {
  ConnectedPostsModal,
  type LinkedSocialPost,
  type PostedAts,
  type SocialDraft,
} from "@/components/admin/ConnectedPostsModal";

const ZERNIO_URL = "https://app.zernio.com";

function ZernioLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/zernio-logo.png"
      alt=""
      className={className ?? "h-4 w-4 rounded-sm object-contain"}
      width={16}
      height={16}
    />
  );
}

type Author = { id: string; name: string; avatar_url: string | null };
type Post = {
  id: string; title: string; description: string; body_html: string;
  cover_image_url: string | null; content_type: string; tags: string[];
  author_id: string | null; slug: string; status: string; scheduled_at: string | null;
  published_at: string | null;
  sharing_caption: string | null; linkedin_post: string | null;
  instagram_caption: string | null; facebook_post: string | null;
  social_hashtags: string[];
  linkedin_posted_at?: string | null;
  instagram_posted_at?: string | null;
  facebook_posted_at?: string | null;
  sharing_posted_at?: string | null;
};

const PRESET_TYPES = ["Insight", "Research", "Article", "Guide", "Case Study", "Video", "Framework Comparison"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Toast({ message, visible, action, isError }: { message: string; visible: boolean; action?: { label: string; href: string }; isError?: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${isError ? "bg-red-600" : "bg-pine-900"}`}>
        <Check className={`h-4 w-4 ${isError ? "text-red-200" : "text-emerald-400"}`} />
        {message}
        {action && (
          <a href={action.href} className="ml-1 underline underline-offset-2 opacity-80 hover:opacity-100">
            {action.label}
          </a>
        )}
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
  const [copiedFb, setCopiedFb] = useState(false);
  const hashtagStr = (social.hashtags ?? []).map((h) => `#${h}`).join(" ");

  const copy = async (text: string, which: "li" | "ig" | "fb") => {
    await navigator.clipboard.writeText(text);
    if (which === "li") { setCopiedLi(true); setTimeout(() => setCopiedLi(false), 2000); }
    else if (which === "ig") { setCopiedIg(true); setTimeout(() => setCopiedIg(false), 2000); }
    else { setCopiedFb(true); setTimeout(() => setCopiedFb(false), 2000); }
  };

  const liContent = [social.linkedin_post, postUrl || null, hashtagStr || null].filter(Boolean).join("\n\n");
  const igContent = [social.instagram_caption, postUrl || null, hashtagStr || null].filter(Boolean).join("\n\n");
  const fbContent = [social.facebook_post, postUrl || null, hashtagStr || null].filter(Boolean).join("\n\n");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Social versions ready to copy</h3>
            <p className="mt-0.5 text-xs text-[#5F686A]">Post link is embedded — copy and go.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-pine-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 p-5">
          {social.sharing_caption && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Sharing caption</p>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.sharing_caption}</p>
            </div>
          )}
          {social.linkedin_post && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Linkedin className="h-4 w-4 text-[#0077B5]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">LinkedIn post</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => void copy(liContent, "li")}
                    className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#5F686A] hover:bg-pine-50">
                    {copiedLi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedLi ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.linkedin_post}</p>
              {postUrl && <p className="mt-2 text-xs text-[#0077B5] break-all">{postUrl}</p>}
              {hashtagStr && <p className="mt-1 text-xs text-[#5F686A]">{hashtagStr}</p>}
            </div>
          )}
          {social.instagram_caption && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-[#E1306C]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Instagram caption</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => void copy(igContent, "ig")}
                    className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#5F686A] hover:bg-pine-50">
                    {copiedIg ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedIg ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.instagram_caption}</p>
              {postUrl && <p className="mt-2 text-xs text-[#E1306C] break-all">{postUrl}</p>}
              {hashtagStr && <p className="mt-1 text-xs text-[#5F686A]">{hashtagStr}</p>}
            </div>
          )}
          {social.facebook_post && (
            <div className="rounded-xl border border-[#111111]/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">Facebook post</p>
                <button type="button" onClick={() => void copy(fbContent, "fb")}
                  className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#5F686A] hover:bg-pine-50">
                  {copiedFb ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedFb ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-[#111111] whitespace-pre-line">{social.facebook_post}</p>
              {postUrl && <p className="mt-2 text-xs text-[#1877f2] break-all">{postUrl}</p>}
              {hashtagStr && <p className="mt-1 text-xs text-[#5F686A]">{hashtagStr}</p>}
            </div>
          )}
          <a
            href={ZERNIO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-pine-50"
          >
            <ZernioLogo />
            Manage on Zernio
          </a>
        </div>
        <div className="border-t border-[#111111]/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#122428] py-2.5 text-sm font-semibold text-white hover:bg-[#1B343A]"
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
        <p className="mt-1 text-sm text-[#5F686A]">This action cannot be undone.</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#5F686A] hover:bg-pine-50"
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
  const [publishedAt, setPublishedAt] = useState("");
  const [publishedAtSaved, setPublishedAtSaved] = useState(false);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [linkedSocial, setLinkedSocial] = useState<LinkedSocialPost[]>([]);

  // Social draft from sessionStorage (set by ContentCreateModal)
  const [socialDraft, setSocialDraft] = useState<SocialDraft | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastAction, setToastAction] = useState<{ label: string; href: string } | undefined>(undefined);
  const [toastIsError, setToastIsError] = useState(false);

  // Tags collapsible
  const [tagsOpen, setTagsOpen] = useState(false);

  const [postedAts, setPostedAts] = useState<PostedAts>({});

  // Modals
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConnectedPosts, setShowConnectedPosts] = useState(false);

  // Auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPublishedRef = useRef(false);
  const stateRef = useRef({ title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, socialDraft });

  const showToast = (message: string, action?: { label: string; href: string }, isError?: boolean) => {
    setToastMsg(message);
    setToastAction(action);
    setToastIsError(!!isError);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), isError ? 6000 : 4000);
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
        if (p.published_at) {
          const dt = new Date(p.published_at);
          const pad = (n: number) => String(n).padStart(2, "0");
          setPublishedAt(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
        }
        if (p.status === "scheduled" && p.scheduled_at) {
          const dt = new Date(p.scheduled_at);
          const pad = (n: number) => String(n).padStart(2, "0");
          setScheduledAt(`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
          setPublishMode("schedule");
        }
      }
      setAuthors(authorsRes.data ?? []);
      setLinkedSocial((socialRes.data ?? []).filter((social) => social.link === `/admin/posts/${id}`));

      if (p) {
        setPostedAts({
          linkedin_posted_at: p.linkedin_posted_at ?? null,
          instagram_posted_at: p.instagram_posted_at ?? null,
          facebook_posted_at: p.facebook_posted_at ?? null,
          sharing_posted_at: p.sharing_posted_at ?? null,
        });
      }

      // Load social content from DB, fall back to localStorage for posts created before DB persistence
      if (p && (p.sharing_caption || p.linkedin_post || p.instagram_caption || p.facebook_post)) {
        const draft: SocialDraft = {
          sharing_caption: p.sharing_caption ?? undefined,
          linkedin_post: p.linkedin_post ?? undefined,
          instagram_caption: p.instagram_caption ?? undefined,
          facebook_post: p.facebook_post ?? undefined,
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
            if (draft.linkedin_post || draft.instagram_caption || draft.facebook_post || draft.sharing_caption) {
              setPanelOpen(true);
            }
          }
        } catch { /* ignore */ }
      }

      setLoading(false);
    });
  }, [id]);

  // Keep stateRef in sync so auto-save always uses latest values
  useEffect(() => {
    stateRef.current = { title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, socialDraft };
  });
  useEffect(() => { isPublishedRef.current = isPublished; }, [isPublished]);

  // Auto-save: debounce 30s after any content change
  useEffect(() => {
    if (loading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const s = stateRef.current;
      const status = isPublishedRef.current ? "published" : "draft";
      setAutoSaveStatus("saving");
      try {
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: s.title || "Untitled",
            description: s.description,
            body_html: s.bodyHtml,
            cover_image_url: s.coverImageUrl || null,
            content_type: s.showCustomType && s.customType ? s.customType : s.contentType,
            tags: s.tags,
            author_id: s.authorId || null,
            slug: s.slug || slugify(s.title || "untitled"),
            status,
            scheduled_at: s.scheduledAt ? new Date(s.scheduledAt).toISOString() : null,
            sharing_caption: s.socialDraft?.sharing_caption ?? null,
            linkedin_post: s.socialDraft?.linkedin_post ?? null,
            instagram_caption: s.socialDraft?.instagram_caption ?? null,
            facebook_post: s.socialDraft?.facebook_post ?? null,
            social_hashtags: s.socialDraft?.hashtags ?? [],
          }),
        });
        if (res.ok) {
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 3000);
        } else {
          setAutoSaveStatus("idle");
        }
      } catch {
        setAutoSaveStatus("idle");
      }
    }, 30_000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, socialDraft, id]);

  const savePublishedAt = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        }),
      });
      if (res.ok) {
        setPublishedAtSaved(true);
        setTimeout(() => setPublishedAtSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const save = useCallback(async (status: "draft" | "published" | "scheduled") => {
    setSaving(true);
    // Cancel any pending auto-save
    if (autoSaveTimer.current) { clearTimeout(autoSaveTimer.current); autoSaveTimer.current = null; }
    const wasAlreadyPublished = isPublished;
    let json: { data?: unknown; error?: string; hint?: string } = {};
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
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
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          ...(publishedAt ? { published_at: new Date(publishedAt).toISOString() } : {}),
          sharing_caption: socialDraft?.sharing_caption ?? null,
          linkedin_post: socialDraft?.linkedin_post ?? null,
          instagram_caption: socialDraft?.instagram_caption ?? null,
          facebook_post: socialDraft?.facebook_post ?? null,
          social_hashtags: socialDraft?.hashtags ?? [],
        }),
      });
      json = await res.json() as typeof json;
      if (!res.ok || json.error) {
        const msg = json.hint ? `${json.error} — ${json.hint}` : (json.error ?? "Save failed");
        showToast(msg, undefined, true);
        setSaving(false);
        return;
      }
    } catch {
      showToast("Save failed — check your connection", undefined, true);
      setSaving(false);
      return;
    }
    setSaving(false);
    if (status === "published") {
      setIsPublished(true);
      setPostUrl(`${window.location.origin}/posts/${slug}`);
      setPanelOpen(true);
      // Always show the confirmation toast immediately
      showToast(wasAlreadyPublished ? "Post updated" : "Post published");
      // Show social preview popup if social content exists (non-blocking)
      if (socialDraft?.linkedin_post || socialDraft?.instagram_caption || socialDraft?.facebook_post) {
        setShowSocialPreview(true);
      }
    } else if (status === "draft" && isPublished) {
      setIsPublished(false);
      showToast("Moved to draft");
    } else if (status === "draft") {
      showToast("Draft saved");
    } else if (status === "scheduled") {
      showToast("Post scheduled", { label: "View calendar →", href: "/admin/calendar" });
    }
  }, [id, title, description, bodyHtml, coverImageUrl, contentType, customType, showCustomType, tags, authorId, slug, scheduledAt, publishedAt, socialDraft, isPublished]);

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

  const connectedCount =
    (socialDraft?.linkedin_post?.trim() ? 1 : 0) +
    (socialDraft?.instagram_caption?.trim() ? 1 : 0) +
    (socialDraft?.facebook_post?.trim() ? 1 : 0) +
    linkedSocial.length;

  const activeType = showCustomType && customType ? customType : contentType;

  if (loading) {
    return <div className="grid h-full place-items-center text-sm text-[#5F686A]">Loading…</div>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:h-full md:min-h-0">
      <Toast message={toastMsg} visible={toastVisible} action={toastAction} isError={toastIsError} />

      {showSocialPreview && socialDraft && (
        <SocialPreviewModal
          social={socialDraft}
          postUrl={postUrl}
          onClose={() => setShowSocialPreview(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => { setShowDeleteConfirm(false); void deletePost(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <ConnectedPostsModal
        open={showConnectedPosts}
        onClose={() => setShowConnectedPosts(false)}
        postId={id}
        postTitle={title}
        bodyText={htmlToPlainText(bodyHtml)}
        description={description}
        socialDraft={socialDraft}
        onSocialDraftChange={setSocialDraft}
        postedAts={postedAts}
        onPostedAtsChange={setPostedAts}
        linkedSocial={linkedSocial}
        onLinkedSocialChange={setLinkedSocial}
        onToast={(message, isError) => showToast(message, undefined, isError)}
      />

      {/* Top bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#111111]/10 bg-white px-3 py-3 sm:gap-3 sm:px-4">
        <Link href="/admin/posts" className="grid h-10 w-10 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-0 flex-1 truncate text-sm text-[#5F686A]">Edit post</span>
        {autoSaveStatus === "saving" && (
          <span className="flex items-center gap-1 text-xs text-[#5F686A]">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        )}
        {autoSaveStatus === "saved" && (
          <span className="hidden items-center gap-1 text-xs text-emerald-600 sm:flex">
            <Check className="h-3 w-3" /> Auto-saved
          </span>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleteConfirm(true)} className="grid h-10 w-10 place-items-center rounded-md text-[#5F686A] hover:bg-red-50 hover:text-red-600" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => void save("draft")}
            disabled={saving}
            className="rounded-md border border-[#111111]/15 px-3 py-2.5 text-sm font-semibold text-[#5F686A] hover:bg-pine-50 disabled:opacity-50"
          >
            <span className="sm:hidden">Draft</span>
            <span className="hidden sm:inline">Save draft</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#111111]/15 px-3 py-2.5 text-sm font-semibold text-[#5F686A] hover:bg-pine-50 disabled:opacity-50"
          >
            <Settings className="h-3.5 w-3.5" />
            {isPublished ? "Settings" : "Publish"}
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
          <div className="fixed inset-0 z-50 flex flex-col bg-white max-md:pt-[env(safe-area-inset-top)] md:static md:inset-auto md:z-auto md:w-80 md:shrink-0 md:border-l md:border-[#111111]/10">
            <div className="flex shrink-0 items-center justify-between border-b border-[#111111]/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F686A]">
                {isPublished ? "Post settings" : "Publish post"}
              </p>
              <button onClick={() => setPanelOpen(false)} className="grid h-10 w-10 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Share caption */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Share caption</label>
                <textarea
                  value={socialDraft?.sharing_caption ?? ""}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, sharing_caption: e.target.value || undefined }))}
                  rows={3}
                  placeholder="Add a short sharing caption…"
                  className="w-full rounded-lg border border-[#111111]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[#122428] resize-none"
                />
              </div>

              {/* Manage on Zernio + Copy link */}
              {isPublished && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Share</p>
                  <div className="space-y-2">
                    <a
                      href={ZERNIO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-md border border-[#111111]/10 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:bg-pine-50"
                    >
                      <ZernioLogo className="h-4 w-4 rounded-sm object-contain" /> Manage on Zernio
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

              {/* Connected posts — open modal */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Connected posts</p>
                <p className="mb-2 text-[11px] leading-relaxed text-[#5F686A]/80">
                  LinkedIn, Instagram and Facebook copy for this article — edit, regenerate, or mark as published.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConnectedPosts(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[#111111]/15 bg-white px-3 py-2.5 text-xs font-semibold text-[#122428] hover:border-[#122428]/40 hover:bg-pine-50"
                >
                  See connected posts
                  {connectedCount > 0 && (
                    <span className="rounded-full bg-[#122428]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#122428]">
                      {connectedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* URL Slug */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">URL Slug</label>
                <div className="flex items-center rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-xs">
                  <span className="mr-1 text-[#5F686A]">/posts/</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 bg-transparent text-[#111111] outline-none" />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => { setContentType(t); setShowCustomType(false); }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeType === t && !showCustomType ? "bg-[#122428] text-white" : "border border-[#111111]/15 bg-white text-[#5F686A] hover:border-[#122428]/40"}`}>
                      {t}
                    </button>
                  ))}
                  <button type="button" onClick={() => setShowCustomType(true)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${showCustomType ? "bg-[#122428] text-white" : "border border-dashed border-[#111111]/20 text-[#5F686A]"}`}>
                    + Custom
                  </button>
                </div>
                {showCustomType && (
                  <input autoFocus value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Custom type…"
                    className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]" />
                )}
              </div>

              {/* Tags (collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setTagsOpen((o) => !o)}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]"
                >
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
                      <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                        placeholder={tags.length === 0 ? "Add tags…" : ""}
                        className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#5F686A]/50" />
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
              </div>

              {/* Publication date shown on site */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                  Publication date
                </label>
                <p className="mb-2 text-[11px] leading-relaxed text-[#5F686A]/70">
                  The date shown on the article and across listings. Set this to reflect when the post first went live.
                </p>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => { setPublishedAt(e.target.value); setPublishedAtSaved(false); }}
                  className="w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void savePublishedAt()}
                    disabled={saving || !publishedAt}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${publishedAtSaved ? "bg-acid/50 text-ink" : "bg-[#122428] text-white hover:opacity-90"}`}
                  >
                    {publishedAtSaved ? "Saved" : "Save date"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, "0");
                      setPublishedAt(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
                      setPublishedAtSaved(false);
                    }}
                    className="text-xs text-[#5F686A] hover:text-[#122428]"
                  >
                    Use now
                  </button>
                </div>
                {!isPublished && (
                  <p className="mt-2 text-[10px] text-[#5F686A]/60">
                    For a draft, this becomes the publication date when you publish.
                  </p>
                )}
              </div>

              {/* Publish timing */}
              {!isPublished && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">When to publish</label>
                  <div className="flex overflow-hidden rounded-md border border-[#111111]/15 text-xs font-semibold">
                    <button type="button" onClick={() => setPublishMode("now")}
                      className={`flex-1 py-2 transition-colors ${publishMode === "now" ? "bg-[#122428] text-white" : "bg-white text-[#5F686A] hover:bg-gray-50"}`}>
                      Publish now
                    </button>
                    <button type="button" onClick={() => setPublishMode("schedule")}
                      className={`flex-1 py-2 transition-colors ${publishMode === "schedule" ? "bg-[#122428] text-white" : "bg-white text-[#5F686A] hover:bg-gray-50"}`}>
                      Schedule
                    </button>
                  </div>
                  {publishMode === "schedule" && (
                    <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                      className="mt-2 w-full rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]" />
                  )}
                </div>
              )}
            </div>

            {/* Sticky publish footer */}
            <div className="shrink-0 border-t border-[#111111]/10 px-5 py-4">
              {publishMode === "now" || isPublished ? (
                <button onClick={() => void save("published")} disabled={saving}
                  className="w-full rounded-md bg-[#122428] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving…" : isPublished ? "Update post" : "Publish post"}
                </button>
              ) : (
                <button onClick={() => void save("scheduled")} disabled={saving || !scheduledAt}
                  className="w-full rounded-md bg-pine-900 py-3 text-sm font-semibold text-paper hover:bg-pine-800 disabled:opacity-50">
                  {saving ? "Scheduling…" : "Schedule post"}
                </button>
              )}
              {isPublished && (
                <button onClick={() => void save("draft")} disabled={saving}
                  className="mt-2 w-full rounded-md border border-[#111111]/15 py-2.5 text-sm font-semibold text-[#5F686A] hover:bg-gray-100 disabled:opacity-50">
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
