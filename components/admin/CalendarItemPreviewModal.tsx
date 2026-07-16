"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  SocialPostPreviewModal,
  type SocialPostPreview,
} from "@/components/admin/SocialPostPreviewModal";

export type CalendarBlogPreview = {
  id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  status: "draft" | "published" | "scheduled";
  published_at?: string | null;
  scheduled_at?: string | null;
  updated_at?: string;
  content_type?: string;
  slug?: string | null;
  linkedin_post?: string | null;
  instagram_caption?: string | null;
  sharing_caption?: string | null;
  social_hashtags?: string[] | null;
  linkedin_posted_at?: string | null;
  instagram_posted_at?: string | null;
  sharing_posted_at?: string | null;
};

type SocialPost = SocialPostPreview & {
  scheduled_date: string;
  posted_at?: string | null;
};

type ConnectedTarget =
  | { type: "social"; socialId: string }
  | { type: "inline"; platform: string };

type Props = {
  post: CalendarBlogPreview;
  linkedSocial?: SocialPost[];
  calendarDay?: string;
  busy?: boolean;
  onClose: () => void;
  onDeleteAll?: () => Promise<void>;
  onMarkConnectedPosted?: (target: ConnectedTarget) => Promise<void>;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<CalendarBlogPreview["status"], string> = {
  published: "bg-pine-900 text-paper",
  scheduled: "bg-pine-100 text-pine-800",
  draft: "bg-acid text-ink",
};

function socialLinksToPost(link: string | null | undefined, postId: string) {
  if (!link) return false;
  return link.includes(`/admin/posts/${postId}`);
}

function inlinePostedAt(post: CalendarBlogPreview, platform: string): string | null | undefined {
  if (platform === "linkedin") return post.linkedin_posted_at;
  if (platform === "instagram") return post.instagram_posted_at;
  if (platform === "share") return post.sharing_posted_at;
  return null;
}

function buildInlineSocial(post: CalendarBlogPreview, existingPlatforms: Set<string>): SocialPost[] {
  const out: SocialPost[] = [];
  const postUrl = post.slug ? `/posts/${post.slug}` : "";
  const hashtags = (post.social_hashtags ?? []).map((h) => `#${h}`).join(" ");
  const suffix = [postUrl || null, hashtags || null].filter(Boolean).join("\n\n");

  if (post.linkedin_post?.trim() && !existingPlatforms.has("linkedin")) {
    out.push({
      id: `inline-linkedin-${post.id}`,
      title: `${post.title || "Post"} — LinkedIn`,
      platform: "linkedin",
      content: [post.linkedin_post.trim(), suffix].filter(Boolean).join("\n\n"),
      scheduled_date: "",
      link: `/admin/posts/${post.id}`,
    });
  }
  if (post.instagram_caption?.trim() && !existingPlatforms.has("instagram")) {
    out.push({
      id: `inline-instagram-${post.id}`,
      title: `${post.title || "Post"} — Instagram`,
      platform: "instagram",
      content: [post.instagram_caption.trim(), suffix].filter(Boolean).join("\n\n"),
      scheduled_date: "",
      link: `/admin/posts/${post.id}`,
    });
  }
  if (post.sharing_caption?.trim()) {
    out.push({
      id: `inline-share-${post.id}`,
      title: "Share text",
      platform: "share",
      content: post.sharing_caption.trim(),
      scheduled_date: "",
      link: `/admin/posts/${post.id}`,
    });
  }
  return out;
}

type ConnectedRow = SocialPost & {
  isInline: boolean;
  isPosted: boolean;
  isScheduled: boolean;
  target: ConnectedTarget;
};

const CONNECTED_PLATFORM_META = {
  linkedin: { label: "LinkedIn", Icon: Linkedin, style: "text-[#0077b5] bg-[#0077b5]/10" },
  instagram: { label: "Instagram", Icon: Instagram, style: "text-pink-600 bg-pink-50" },
  facebook: { label: "Facebook", Icon: Facebook, style: "text-blue-600 bg-blue-50" },
  twitter: { label: "X", Icon: X, style: "text-gray-900 bg-gray-100" },
  share: { label: "Share text", Icon: Share2, style: "text-[#122428] bg-[#122428]/10" },
} as const;

function ConnectedPostRow({
  row,
  busy,
  onMarkPosted,
  onOpen,
}: {
  row: ConnectedRow;
  busy?: boolean;
  onMarkPosted?: (target: ConnectedTarget) => Promise<void>;
  onOpen: () => void;
}) {
  const [posted, setPosted] = useState(row.isPosted);
  const meta = CONNECTED_PLATFORM_META[row.platform as keyof typeof CONNECTED_PLATFORM_META]
    ?? CONNECTED_PLATFORM_META.share;

  useEffect(() => {
    setPosted(row.isPosted);
  }, [row.isPosted]);

  return (
    <div className="rounded-lg border border-[#111111]/10 p-3">
      <div className="flex items-center gap-2">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${meta.style}`}>
          <meta.Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#111111]">{row.title}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-[10px] font-semibold text-[#111111] hover:bg-pine-50"
        >
          Open post
          <ExternalLink className="h-2.5 w-2.5" />
        </button>
        {posted ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
            <CheckCircle2 className="h-3 w-3" />
            Posted
          </span>
        ) : onMarkPosted ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPosted(true);
              void onMarkPosted(row.target);
            }}
            className="rounded-md border border-pine-900/15 bg-acid/40 px-2.5 py-1 text-[10px] font-semibold text-ink hover:bg-acid/60 disabled:opacity-40"
          >
            Mark as posted
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CalendarItemPreviewModal({
  post,
  linkedSocial: linkedSocialProp,
  busy,
  onClose,
  onDeleteAll,
  onMarkConnectedPosted,
}: Props) {
  const [linkedSocial, setLinkedSocial] = useState<SocialPost[]>(linkedSocialProp ?? []);
  const [activeRow, setActiveRow] = useState<ConnectedRow | null>(null);
  const [fullPost, setFullPost] = useState<CalendarBlogPreview | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [markingActive, setMarkingActive] = useState(false);

  useEffect(() => {
    if (linkedSocialProp) {
      setLinkedSocial(linkedSocialProp);
    }
  }, [linkedSocialProp]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/social-posts").then((r) => r.json() as Promise<{ data: SocialPost[] }>),
      fetch(`/api/admin/posts/${post.id}`).then((r) => r.json() as Promise<{ data: CalendarBlogPreview }>),
    ])
      .then(([socialRes, postRes]) => {
        const fromTable = (socialRes.data ?? []).filter((s) => socialLinksToPost(s.link, post.id));
        setLinkedSocial(fromTable);
        if (postRes.data) setFullPost(postRes.data);
      })
      .catch(() => {});
  }, [post.id]);

  const displayPost = fullPost ?? post;

  const connectedRows = useMemo((): ConnectedRow[] => {
    const fromTable = linkedSocial;
    const platforms = new Set(fromTable.map((s) => s.platform));
    const inline = buildInlineSocial(displayPost, platforms);

    const tableRows: ConnectedRow[] = fromTable.map((s) => ({
      ...s,
      isInline: false,
      isPosted: !!s.posted_at,
      isScheduled: !!s.scheduled_date?.trim(),
      target: { type: "social", socialId: s.id },
    }));

    const inlineRows: ConnectedRow[] = inline.map((s) => ({
      ...s,
      isInline: true,
      isPosted: !!inlinePostedAt(displayPost, s.platform),
      isScheduled: false,
      target: { type: "inline", platform: s.platform },
    }));

    return [...tableRows, ...inlineRows];
  }, [linkedSocial, displayPost]);

  // Keep the open connected-post modal in sync after mark-as-posted
  const activeRowLive = useMemo(() => {
    if (!activeRow) return null;
    return connectedRows.find((r) => r.id === activeRow.id) ?? activeRow;
  }, [activeRow, connectedRows]);

  const displayDate =
    displayPost.status === "published"
      ? formatDate(displayPost.published_at)
      : displayPost.status === "scheduled"
        ? formatDate(displayPost.scheduled_at)
        : formatDate(displayPost.updated_at);

  const markRowPosted = async (target: ConnectedTarget) => {
    if (!onMarkConnectedPosted) return;
    setMarkingActive(true);
    try {
      await onMarkConnectedPosted(target);
      // Reflect locally so list + open modal update immediately
      if (target.type === "social") {
        const now = new Date().toISOString();
        setLinkedSocial((prev) =>
          prev.map((s) => (s.id === target.socialId ? { ...s, posted_at: now } : s)),
        );
      } else {
        const field =
          target.platform === "linkedin"
            ? "linkedin_posted_at"
            : target.platform === "instagram"
              ? "instagram_posted_at"
              : target.platform === "share"
                ? "sharing_posted_at"
                : null;
        if (field) {
          const now = new Date().toISOString();
          setFullPost((prev) => ({ ...(prev ?? post), [field]: now }));
        }
      }
    } finally {
      setMarkingActive(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>

        {displayPost.cover_image_url ? (
          <div className="aspect-[16/9] w-full shrink-0 overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPost.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2 pr-10">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[displayPost.status]}`}
            >
              {displayPost.status}
            </span>
            {displayPost.content_type ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5F686A]">
                {displayPost.content_type}
              </span>
            ) : null}
          </div>

          <h2
            id="calendar-preview-title"
            className="text-lg font-semibold text-[#111111]"
          >
            {displayPost.title || "Untitled"}
          </h2>

          {displayDate ? (
            <p className="text-xs text-[#5F686A]">
              {displayPost.status === "scheduled" ? "Scheduled for " : displayPost.status === "published" ? "Published " : "Updated "}
              {displayDate}
            </p>
          ) : null}

          {displayPost.description ? (
            <p className="text-sm leading-relaxed text-[#5F686A]">
              {displayPost.description}
            </p>
          ) : (
            <p className="text-sm italic text-[#5F686A]/60">No description</p>
          )}

          {connectedRows.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F686A]">
                Connected posts
              </p>
              <div className="space-y-2">
                {connectedRows.map((row) => (
                  <ConnectedPostRow
                    key={row.id}
                    row={row}
                    busy={busy || markingActive}
                    onMarkPosted={onMarkConnectedPosted ? markRowPosted : undefined}
                    onOpen={() => setActiveRow(row)}
                  />
                ))}
              </div>
            </div>
          )}

          {showDeleteConfirm && onDeleteAll && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Are you sure you want to delete all content?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-red-700">
                This will permanently delete this blog post and all connected social posts.
                If you only want to delete one item, open that post and delete it individually instead.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#111111] hover:bg-pine-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void onDeleteAll().then(() => setShowDeleteConfirm(false));
                  }}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Delete all
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-[#111111]/8 pt-4">
            <Link
              href={`/admin/posts/${displayPost.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#122428] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B343A]"
            >
              Open full post
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {onDeleteAll && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                title="Delete blog post and connected content"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {activeRowLive && (
        <SocialPostPreviewModal
          social={activeRowLive}
          postedAt={activeRowLive.isPosted ? (activeRowLive.posted_at ?? new Date().toISOString()) : null}
          onClose={() => setActiveRow(null)}
          onMarkPosted={
            !activeRowLive.isPosted && onMarkConnectedPosted
              ? () => markRowPosted(activeRowLive.target)
              : undefined
          }
          markingPosted={markingActive}
          onDelete={
            !activeRowLive.isInline
              ? async () => {
                  await fetch(`/api/admin/social-posts/${activeRowLive.id}`, { method: "DELETE" });
                  setLinkedSocial((prev) => prev.filter((s) => s.id !== activeRowLive.id));
                  setActiveRow(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}