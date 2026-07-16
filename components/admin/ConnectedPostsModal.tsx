"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export type SocialDraft = {
  sharing_caption?: string;
  linkedin_post?: string;
  instagram_caption?: string;
  facebook_post?: string;
  hashtags?: string[];
};

export type LinkedSocialPost = {
  id: string;
  title: string;
  platform: string;
  content: string;
  scheduled_date: string;
  posted_at?: string | null;
  link?: string | null;
  description?: string | null;
  tags?: string[];
};

export type PostedAts = {
  linkedin_posted_at?: string | null;
  instagram_posted_at?: string | null;
  facebook_posted_at?: string | null;
  sharing_posted_at?: string | null;
};

type PlatformKey = "linkedin" | "instagram" | "facebook" | "twitter";

const ZERNIO_URL = "https://zernio.com/";

const PLATFORM_META: Record<
  PlatformKey,
  { label: string; Icon: React.FC<{ className?: string }>; color: string; style: string }
> = {
  linkedin: {
    label: "LinkedIn",
    Icon: Linkedin,
    color: "#0077b5",
    style: "text-[#0077b5] bg-[#0077b5]/10",
  },
  instagram: {
    label: "Instagram",
    Icon: Instagram,
    color: "#E1306C",
    style: "text-pink-600 bg-pink-50",
  },
  facebook: {
    label: "Facebook",
    Icon: Facebook,
    color: "#1877f2",
    style: "text-blue-600 bg-blue-50",
  },
  twitter: {
    label: "X",
    Icon: XIcon,
    color: "#000",
    style: "text-gray-900 bg-gray-100",
  },
};

const INLINE_PLATFORMS: PlatformKey[] = ["linkedin", "instagram", "facebook"];

type DraftContentField = "linkedin_post" | "instagram_caption" | "facebook_post";

function draftField(platform: PlatformKey): DraftContentField | null {
  if (platform === "linkedin") return "linkedin_post";
  if (platform === "instagram") return "instagram_caption";
  if (platform === "facebook") return "facebook_post";
  return null;
}

function postedField(
  platform: PlatformKey,
): keyof PostedAts | null {
  if (platform === "linkedin") return "linkedin_posted_at";
  if (platform === "instagram") return "instagram_posted_at";
  if (platform === "facebook") return "facebook_posted_at";
  return null;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDatetimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

type Props = {
  open: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  bodyText: string;
  description: string;
  socialDraft: SocialDraft | null;
  onSocialDraftChange: (draft: SocialDraft) => void;
  postedAts: PostedAts;
  onPostedAtsChange: (next: PostedAts) => void;
  linkedSocial: LinkedSocialPost[];
  onLinkedSocialChange: (next: LinkedSocialPost[]) => void;
  onToast: (message: string, isError?: boolean) => void;
};

export function ConnectedPostsModal({
  open,
  onClose,
  postId,
  postTitle,
  bodyText,
  description,
  socialDraft,
  onSocialDraftChange,
  postedAts,
  onPostedAtsChange,
  linkedSocial,
  onLinkedSocialChange,
  onToast,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingPlatform, setGeneratingPlatform] = useState<string | null>(null);
  const [genMenuOpen, setGenMenuOpen] = useState(false);
  const genMenuRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [savingPosted, setSavingPosted] = useState(false);
  const [selectedPublished, setSelectedPublished] = useState<Record<string, boolean>>({});
  const [publishedDates, setPublishedDates] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    platform: "linkedin" as PlatformKey,
    content: "",
    scheduled_date: "",
  });
  const [editingLinked, setEditingLinked] = useState<Record<string, string>>({});
  const [savingLinkedId, setSavingLinkedId] = useState<string | null>(null);

  useEffect(() => {
    if (!genMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (genMenuRef.current && !genMenuRef.current.contains(e.target as Node)) {
        setGenMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [genMenuOpen]);

  const draftTabs = useMemo(() => {
    const tabs: { key: string; platform: PlatformKey; kind: "inline" }[] = [];
    for (const p of INLINE_PLATFORMS) {
      const field = draftField(p);
      const value = field ? socialDraft?.[field] : undefined;
      if (value?.trim()) {
        tabs.push({ key: `inline-${p}`, platform: p, kind: "inline" });
      }
    }
    return tabs;
  }, [socialDraft]);

  const linkedTabs = useMemo(() => {
    return linkedSocial.map((s) => ({
      key: `social-${s.id}`,
      platform: (["linkedin", "instagram", "facebook", "twitter"].includes(s.platform)
        ? s.platform
        : "linkedin") as PlatformKey,
      kind: "social" as const,
      social: s,
    }));
  }, [linkedSocial]);

  /** Platforms that already have inline content — still shown even if also in linkedSocial. */
  const allTabs = useMemo(() => {
    // Prefer one tab per platform from draft; extra linked social posts for other platforms
    // or duplicates still appear as separate social rows under + / list.
    const byPlatform = new Map<string, (typeof draftTabs)[0] | (typeof linkedTabs)[0]>();
    for (const t of draftTabs) byPlatform.set(t.platform, t);
    for (const t of linkedTabs) {
      if (!byPlatform.has(t.platform)) byPlatform.set(t.platform, t);
    }
    // Keep stable order: LI, IG, FB, then any extras
    const order: PlatformKey[] = ["linkedin", "instagram", "facebook", "twitter"];
    const ordered: Array<(typeof draftTabs)[0] | (typeof linkedTabs)[0]> = [];
    for (const p of order) {
      const t = byPlatform.get(p);
      if (t) ordered.push(t);
    }
    // Linked posts for platforms already covered still available via extra list in panel
    return ordered;
  }, [draftTabs, linkedTabs]);

  const extraLinked = useMemo(() => {
    // Show linked social rows that are not already the primary tab for their platform.
    const primarySocialIds = new Set(
      allTabs
        .filter((t): t is Extract<typeof t, { kind: "social" }> => t.kind === "social")
        .map((t) => t.social.id),
    );
    return linkedSocial.filter((s) => !primarySocialIds.has(s.id));
  }, [allTabs, linkedSocial]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setShowAdd(false);
    // Init published selection from current posted state
    const sel: Record<string, boolean> = {};
    const dates: Record<string, string> = {};
    for (const p of INLINE_PLATFORMS) {
      const field = postedField(p);
      const iso = field ? postedAts[field] : null;
      const key = `inline-${p}`;
      sel[key] = !!iso;
      dates[key] = toDatetimeLocal(iso) || nowDatetimeLocal();
    }
    for (const s of linkedSocial) {
      const key = `social-${s.id}`;
      sel[key] = !!s.posted_at;
      dates[key] = toDatetimeLocal(s.posted_at) || nowDatetimeLocal();
      setEditingLinked((prev) => ({ ...prev, [s.id]: s.content ?? "" }));
    }
    setSelectedPublished(sel);
    setPublishedDates(dates);

    if (allTabs.length > 0) {
      setActiveTab((prev) => {
        if (prev && (prev === "add" || allTabs.some((t) => t.key === prev) || prev.startsWith("social-"))) {
          return prev;
        }
        return allTabs[0].key;
      });
    } else {
      setActiveTab("add");
      setShowAdd(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId]);

  useEffect(() => {
    // Keep active tab valid when content changes after generate
    if (!open) return;
    if (activeTab === "add") return;
    if (allTabs.some((t) => t.key === activeTab)) return;
    if (linkedSocial.some((s) => `social-${s.id}` === activeTab)) return;
    if (allTabs.length) setActiveTab(allTabs[0].key);
    else {
      setActiveTab("add");
      setShowAdd(true);
    }
  }, [open, allTabs, activeTab, linkedSocial]);

  if (!open) return null;

  const generate = async (platform?: "linkedin" | "instagram" | "facebook" | "all") => {
    if (!bodyText.trim()) {
      setError("Write some post content first, then generate connected posts.");
      return;
    }
    setError("");
    if (platform && platform !== "all") setGeneratingPlatform(platform);
    else setGeneratingAll(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}/generate-connected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim() || undefined,
          description: description.trim() || undefined,
          body_text: bodyText,
          platform: platform ?? "all",
        }),
      });
      const json = (await res.json()) as {
        data?: SocialDraft & { platform?: string };
        error?: string;
      };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Generation failed");

      onSocialDraftChange({
        ...socialDraft,
        sharing_caption:
          json.data.sharing_caption !== undefined
            ? json.data.sharing_caption || socialDraft?.sharing_caption
            : socialDraft?.sharing_caption,
        linkedin_post:
          json.data.linkedin_post !== undefined
            ? json.data.linkedin_post || socialDraft?.linkedin_post
            : socialDraft?.linkedin_post,
        instagram_caption:
          json.data.instagram_caption !== undefined
            ? json.data.instagram_caption || socialDraft?.instagram_caption
            : socialDraft?.instagram_caption,
        facebook_post:
          json.data.facebook_post !== undefined
            ? json.data.facebook_post || socialDraft?.facebook_post
            : socialDraft?.facebook_post,
        hashtags: json.data.hashtags?.length
          ? json.data.hashtags
          : socialDraft?.hashtags,
      });

      // Jump to the platform that was generated
      if (platform && platform !== "all") {
        setActiveTab(`inline-${platform}`);
        setShowAdd(false);
      } else if (json.data.linkedin_post) {
        setActiveTab("inline-linkedin");
        setShowAdd(false);
      }

      onToast(
        platform && platform !== "all"
          ? `${PLATFORM_META[platform].label} copy regenerated`
          : "Connected social copy generated",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingAll(false);
      setGeneratingPlatform(null);
    }
  };

  const updateInlineContent = (platform: PlatformKey, value: string) => {
    const field = draftField(platform);
    if (!field) return;
    onSocialDraftChange({
      ...socialDraft,
      [field]: value || undefined,
    });
  };

  const getInlineContent = (platform: PlatformKey): string => {
    const field = draftField(platform);
    if (!field) return "";
    return socialDraft?.[field] ?? "";
  };

  const canGeneratePlatform = (
    platform: PlatformKey,
  ): platform is "linkedin" | "instagram" | "facebook" =>
    platform === "linkedin" || platform === "instagram" || platform === "facebook";

  const saveLinkedContent = async (socialId: string) => {
    const content = editingLinked[socialId] ?? "";
    setSavingLinkedId(socialId);
    try {
      const res = await fetch(`/api/admin/social-posts/${socialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Save failed");
      }
      onLinkedSocialChange(
        linkedSocial.map((s) => (s.id === socialId ? { ...s, content } : s)),
      );
      onToast("Post updated");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Save failed", true);
    } finally {
      setSavingLinkedId(null);
    }
  };

  const persistPublished = async (keys: string[]) => {
    setSavingPosted(true);
    setError("");
    try {
      const nextPosted: PostedAts = { ...postedAts };
      let nextLinked = [...linkedSocial];

      for (const key of keys) {
        const isSelected = selectedPublished[key];
        const dateLocal = publishedDates[key] || nowDatetimeLocal();
        const iso = isSelected ? new Date(dateLocal).toISOString() : null;

        if (key.startsWith("inline-")) {
          const platform = key.replace("inline-", "") as PlatformKey;
          const field = postedField(platform);
          if (field) nextPosted[field] = iso;
        } else if (key.startsWith("social-")) {
          const socialId = key.replace("social-", "");
          const res = await fetch(`/api/admin/social-posts/${socialId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ posted_at: iso }),
          });
          if (!res.ok) {
            const json = (await res.json()) as { error?: string };
            throw new Error(json.error ?? "Failed to update posted status");
          }
          nextLinked = nextLinked.map((s) =>
            s.id === socialId ? { ...s, posted_at: iso } : s,
          );
        }
      }

      // Persist inline posted_at fields on the blog post
      const inlineKeys = keys.filter((k) => k.startsWith("inline-"));
      if (inlineKeys.length) {
        const body: Record<string, string | null> = {};
        for (const key of inlineKeys) {
          const platform = key.replace("inline-", "") as PlatformKey;
          const field = postedField(platform);
          if (field) body[field] = nextPosted[field] ?? null;
        }
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          throw new Error(json.error ?? "Failed to update published status");
        }
      }

      onPostedAtsChange(nextPosted);
      onLinkedSocialChange(nextLinked);
      onToast(
        keys.length > 1
          ? "Published status updated for selected posts"
          : "Published status updated",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save published status");
    } finally {
      setSavingPosted(false);
    }
  };

  const markAllPublished = async () => {
    const keys: string[] = [];
    const sel = { ...selectedPublished };
    const dates = { ...publishedDates };
    const now = nowDatetimeLocal();

    for (const t of allTabs) {
      keys.push(t.key);
      sel[t.key] = true;
      if (!dates[t.key]) dates[t.key] = now;
    }
    for (const s of extraLinked) {
      const key = `social-${s.id}`;
      keys.push(key);
      sel[key] = true;
      if (!dates[key]) dates[key] = now;
    }

    setSelectedPublished(sel);
    setPublishedDates(dates);
    // Apply after state set — use computed values directly
    setSavingPosted(true);
    setError("");
    try {
      const nextPosted: PostedAts = { ...postedAts };
      let nextLinked = [...linkedSocial];

      for (const key of keys) {
        const dateLocal = dates[key] || now;
        const iso = new Date(dateLocal).toISOString();
        if (key.startsWith("inline-")) {
          const platform = key.replace("inline-", "") as PlatformKey;
          const field = postedField(platform);
          if (field) nextPosted[field] = iso;
        } else if (key.startsWith("social-")) {
          const socialId = key.replace("social-", "");
          await fetch(`/api/admin/social-posts/${socialId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ posted_at: iso }),
          });
          nextLinked = nextLinked.map((s) =>
            s.id === socialId ? { ...s, posted_at: iso } : s,
          );
        }
      }

      const body: Record<string, string | null> = {};
      for (const p of INLINE_PLATFORMS) {
        const field = postedField(p);
        if (field && nextPosted[field]) body[field] = nextPosted[field] ?? null;
      }
      if (Object.keys(body).length) {
        await fetch(`/api/admin/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      onPostedAtsChange(nextPosted);
      onLinkedSocialChange(nextLinked);
      onToast("All connected posts marked as published");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as published");
    } finally {
      setSavingPosted(false);
    }
  };

  const addConnectedPost = async () => {
    if (!addForm.scheduled_date) return;
    setAdding(true);
    setError("");
    try {
      // Social posts don't need a user-facing title — store a platform label for calendar lists
      const autoTitle = PLATFORM_META[addForm.platform].label;
      const res = await fetch("/api/admin/social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle,
          platform: addForm.platform,
          content: addForm.content,
          description: "",
          scheduled_date: addForm.scheduled_date,
          tags: [],
          link: `/admin/posts/${postId}`,
        }),
      });
      const json = (await res.json()) as { data?: LinkedSocialPost; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to add post");

      // Optionally seed from AI draft for that platform if empty content and draft exists
      onLinkedSocialChange([...linkedSocial, json.data as LinkedSocialPost]);
      setEditingLinked((prev) => ({
        ...prev,
        [json.data!.id]: json.data!.content ?? "",
      }));
      setSelectedPublished((prev) => ({ ...prev, [`social-${json.data!.id}`]: false }));
      setPublishedDates((prev) => ({
        ...prev,
        [`social-${json.data!.id}`]: nowDatetimeLocal(),
      }));
      setAddForm({ platform: "linkedin", content: "", scheduled_date: "" });
      setShowAdd(false);
      setActiveTab(`social-${json.data.id}`);
      onToast("Connected post added");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add post");
    } finally {
      setAdding(false);
    }
  };

  const generateForAddFormPlatform = async (platform: PlatformKey) => {
    if (platform === "twitter") {
      setError("AI generation is available for LinkedIn, Instagram and Facebook.");
      return;
    }
    if (!bodyText.trim()) {
      setError("Write some post content first, then generate connected posts.");
      return;
    }
    setGeneratingPlatform(platform);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${postId}/generate-connected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim() || undefined,
          description: description.trim() || undefined,
          body_text: bodyText,
          platform,
        }),
      });
      const json = (await res.json()) as { data?: SocialDraft; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Generation failed");
      const fieldName = draftField(platform);
      const text = fieldName ? (json.data[fieldName] as string | undefined) ?? "" : "";
      onSocialDraftChange({
        ...socialDraft,
        ...(fieldName ? { [fieldName]: text } : {}),
        hashtags: json.data.hashtags?.length ? json.data.hashtags : socialDraft?.hashtags,
      });
      setAddForm((f) => ({
        ...f,
        platform,
        content: text,
      }));
      onToast(`${PLATFORM_META[platform].label} copy generated`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingPlatform(null);
    }
  };

  const regenerateSocialRow = async (social: LinkedSocialPost) => {
    const platform = (PLATFORM_META[social.platform as PlatformKey]
      ? social.platform
      : "linkedin") as PlatformKey;
    if (platform === "twitter") {
      setError("AI generation is available for LinkedIn, Instagram and Facebook.");
      return;
    }
    if (!bodyText.trim()) {
      setError("Write some post content first, then generate connected posts.");
      return;
    }
    setGeneratingPlatform(platform);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${postId}/generate-connected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim() || undefined,
          description: description.trim() || undefined,
          body_text: bodyText,
          platform,
        }),
      });
      const json = (await res.json()) as { data?: SocialDraft; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Generation failed");
      const field = draftField(platform);
      const text = field ? (json.data[field] as string | undefined) ?? "" : "";
      if (field) {
        onSocialDraftChange({
          ...socialDraft,
          [field]: text,
          hashtags: json.data.hashtags?.length
            ? json.data.hashtags
            : socialDraft?.hashtags,
        });
      }
      setEditingLinked((prev) => ({ ...prev, [social.id]: text }));
      onToast(`${PLATFORM_META[platform].label} copy regenerated`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingPlatform(null);
    }
  };

  const activeInline = allTabs.find(
    (t) => t.key === activeTab && t.kind === "inline",
  ) as { key: string; platform: PlatformKey; kind: "inline" } | undefined;

  const activeSocialTab = (() => {
    if (activeTab.startsWith("social-")) {
      const id = activeTab.replace("social-", "");
      const social = linkedSocial.find((s) => s.id === id);
      if (social) return social;
    }
    const tab = allTabs.find((t) => t.key === activeTab && t.kind === "social") as
      | { key: string; platform: PlatformKey; kind: "social"; social: LinkedSocialPost }
      | undefined;
    return tab?.social;
  })();

  const busy = generatingAll || !!generatingPlatform || savingPosted || adding;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,100%)] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <h3 className="text-base font-semibold text-[#111111]">Connected posts</h3>
            <p className="mt-0.5 text-xs text-[#5F686A]">
              Edit, regenerate, mark as published, or add social copy for this article.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-pine-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#111111]/8 px-4 py-3 sm:px-5">
          <div className="relative" ref={genMenuRef}>
            <button
              type="button"
              disabled={busy}
              onClick={() => setGenMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {generatingAll || generatingPlatform ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {generatingAll || generatingPlatform ? "Generating…" : "Generate with AI"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${genMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {genMenuOpen && (
              <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[12.5rem] overflow-hidden rounded-xl border border-pine-900/12 bg-white py-1 shadow-lg shadow-pine-900/10">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setGenMenuOpen(false);
                    void generate("all");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-pine-900 hover:bg-pine-50 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-pine-900" />
                  Generate all
                </button>
                <div className="my-1 border-t border-pine-900/8" />
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  One platform
                </p>
                {(["linkedin", "instagram", "facebook"] as const).map((p) => {
                  const meta = PLATFORM_META[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setGenMenuOpen(false);
                        // If adding a new post for this platform, fill the add form
                        if (showAdd || activeTab === "add") {
                          setAddForm((f) => ({ ...f, platform: p }));
                          void generateForAddFormPlatform(p);
                        } else {
                          void generate(p);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-pine-900 hover:bg-pine-50 disabled:opacity-50"
                    >
                      <span className={meta.style.split(" ")[0]}>
                        <meta.Icon className="h-3.5 w-3.5" />
                      </span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={busy || (allTabs.length === 0 && extraLinked.length === 0)}
            onClick={() => void markAllPublished()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-pine-900/15 bg-acid/40 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-acid/60 disabled:opacity-50"
          >
            {savingPosted ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Mark all as published
          </button>
          <a
            href={ZERNIO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-pine-50"
          >
            <ZernioLogo />
            Manage on Zernio
          </a>
        </div>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#111111]/8 px-4 py-2.5 sm:px-5">
          {allTabs.map((t) => {
            const meta = PLATFORM_META[t.platform];
            const isActive = activeTab === t.key && !showAdd;
            const postedKey = t.key;
            const isPosted = !!selectedPublished[postedKey];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setActiveTab(t.key);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#122428] text-white"
                    : "border border-[#111111]/15 text-[#5F686A] hover:border-[#122428]/40"
                }`}
              >
                <meta.Icon className="h-3.5 w-3.5" />
                {meta.label}
                {isPosted && (
                  <CheckCircle2
                    className={`h-3 w-3 ${isActive ? "text-emerald-300" : "text-emerald-600"}`}
                  />
                )}
              </button>
            );
          })}
          {extraLinked.map((s) => {
            const platform = (PLATFORM_META[s.platform as PlatformKey]
              ? s.platform
              : "linkedin") as PlatformKey;
            const meta = PLATFORM_META[platform];
            const key = `social-${s.id}`;
            const isActive = activeTab === key && !showAdd;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setActiveTab(key);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#122428] text-white"
                    : "border border-[#111111]/15 text-[#5F686A] hover:border-[#122428]/40"
                }`}
              >
                <meta.Icon className="h-3.5 w-3.5" />
                {s.title.slice(0, 18)}
                {s.title.length > 18 ? "…" : ""}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setShowAdd(true);
              setActiveTab("add");
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              showAdd || activeTab === "add"
                ? "bg-[#122428] text-white"
                : "border border-dashed border-[#111111]/25 text-[#5F686A] hover:border-[#122428]/40"
            }`}
            title="Add a new connected post"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {showAdd || activeTab === "add" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                  Platform
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(PLATFORM_META) as PlatformKey[]).map((key) => {
                    const p = PLATFORM_META[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAddForm((f) => ({ ...f, platform: key }))}
                        className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-colors ${
                          addForm.platform === key
                            ? "border-current bg-gray-50"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                        style={
                          addForm.platform === key
                            ? { color: p.color, borderColor: p.color }
                            : {}
                        }
                      >
                        <p.Icon className="h-4 w-4" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                  Publish date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={addForm.scheduled_date}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, scheduled_date: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-[#5F686A]">
                  Post content
                </label>
                <p className="mb-1.5 text-[11px] text-[#5F686A]/80">
                  Paste copy, or use <span className="font-semibold">Generate with AI</span> above to write for this platform.
                </p>
                <textarea
                  rows={6}
                  value={addForm.content}
                  onChange={(e) => setAddForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the post copy here…"
                  className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]"
                />
              </div>
              <button
                type="button"
                disabled={adding || !addForm.scheduled_date}
                onClick={() => void addConnectedPost()}
                className="w-full rounded-lg bg-[#122428] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {adding ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </span>
                ) : (
                  "Save connected post"
                )}
              </button>
            </div>
          ) : activeInline ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${PLATFORM_META[activeInline.platform].style}`}
                >
                  {(() => {
                    const Icon = PLATFORM_META[activeInline.platform].Icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">
                    {PLATFORM_META[activeInline.platform].label}
                  </p>
                  <p className="text-[11px] text-[#5F686A]">
                    Connected copy for this article — edits save with the post.
                  </p>
                </div>
                {canGeneratePlatform(activeInline.platform) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const p = activeInline.platform;
                    if (canGeneratePlatform(p)) void generate(p);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-[#122428]/20 px-2.5 py-1.5 text-[11px] font-semibold text-[#122428] hover:bg-[#122428]/5 disabled:opacity-50"
                >
                  {generatingPlatform === activeInline.platform ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Regenerate
                </button>
                )}
              </div>

              <textarea
                rows={10}
                value={getInlineContent(activeInline.platform)}
                onChange={(e) =>
                  updateInlineContent(activeInline.platform, e.target.value)
                }
                className="w-full resize-y rounded-xl border border-[#111111]/15 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#122428]"
              />

              {/* Published controls */}
              <div className="rounded-xl border border-[#111111]/10 bg-gray-50/80 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
                  Published status
                </p>
                <label className="flex items-center gap-2 text-sm text-[#111111]">
                  <input
                    type="checkbox"
                    checked={!!selectedPublished[activeInline.key]}
                    onChange={(e) =>
                      setSelectedPublished((prev) => ({
                        ...prev,
                        [activeInline.key]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Mark as published
                </label>
                {selectedPublished[activeInline.key] && (
                  <div className="mt-2">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
                      Date published
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedDates[activeInline.key] || nowDatetimeLocal()}
                      onChange={(e) =>
                        setPublishedDates((prev) => ({
                          ...prev,
                          [activeInline.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]"
                    />
                  </div>
                )}
                <button
                  type="button"
                  disabled={savingPosted}
                  onClick={() => void persistPublished([activeInline.key])}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {savingPosted ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save published status
                </button>
              </div>
            </div>
          ) : activeSocialTab ? (
            <div className="space-y-4">
              {(() => {
                const platform = (PLATFORM_META[activeSocialTab.platform as PlatformKey]
                  ? activeSocialTab.platform
                  : "linkedin") as PlatformKey;
                const meta = PLATFORM_META[platform];
                const key = `social-${activeSocialTab.id}`;
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${meta.style}`}>
                        <meta.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#111111]">
                          {activeSocialTab.title}
                        </p>
                        <p className="text-[11px] text-[#5F686A]">
                          {meta.label}
                          {activeSocialTab.scheduled_date
                            ? ` · scheduled ${activeSocialTab.scheduled_date}`
                            : ""}
                        </p>
                      </div>
                      {platform !== "twitter" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void regenerateSocialRow(activeSocialTab)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#122428]/20 px-2.5 py-1.5 text-[11px] font-semibold text-[#122428] hover:bg-[#122428]/5 disabled:opacity-50"
                        >
                          {generatingPlatform === platform ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          Regenerate
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={10}
                      value={editingLinked[activeSocialTab.id] ?? activeSocialTab.content}
                      onChange={(e) =>
                        setEditingLinked((prev) => ({
                          ...prev,
                          [activeSocialTab.id]: e.target.value,
                        }))
                      }
                      className="w-full resize-y rounded-xl border border-[#111111]/15 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#122428]"
                    />
                    <button
                      type="button"
                      disabled={savingLinkedId === activeSocialTab.id}
                      onClick={() => void saveLinkedContent(activeSocialTab.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#111111]/15 px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-pine-50 disabled:opacity-50"
                    >
                      {savingLinkedId === activeSocialTab.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Save edits
                    </button>

                    <div className="rounded-xl border border-[#111111]/10 bg-gray-50/80 p-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
                        Published status
                      </p>
                      <label className="flex items-center gap-2 text-sm text-[#111111]">
                        <input
                          type="checkbox"
                          checked={!!selectedPublished[key]}
                          onChange={(e) =>
                            setSelectedPublished((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        Mark as published
                      </label>
                      {selectedPublished[key] && (
                        <div className="mt-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
                            Date published
                          </label>
                          <input
                            type="datetime-local"
                            value={publishedDates[key] || nowDatetimeLocal()}
                            onChange={(e) =>
                              setPublishedDates((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#122428]"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={savingPosted}
                        onClick={() => void persistPublished([key])}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {savingPosted ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save published status
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-[#5F686A]">No connected posts yet.</p>
              <p className="mt-1 text-xs text-[#5F686A]/80">
                Use Generate with AI above, or + to add a platform.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#111111]/10 px-4 py-4 sm:px-5">
          <a
            href={ZERNIO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F686A] hover:text-[#111111]"
          >
            <ZernioLogo />
            Manage on Zernio
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#122428] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
