"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SocialPostPreviewModal,
  SocialPostSummaryCard,
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
  onDelete?: () => void;
  onScheduleBlog?: (iso: string) => Promise<void>;
  onScheduleConnected?: (target: ConnectedTarget, iso: string) => Promise<void>;
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

function formatShortDate(value?: string | null) {
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function defaultScheduleValue(calendarDay?: string, existingIso?: string | null) {
  if (existingIso) {
    const d = new Date(existingIso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (calendarDay) return `${calendarDay}T09:00`;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`;
}

const STATUS_STYLES: Record<CalendarBlogPreview["status"], string> = {
  published: "bg-[#063b32]/10 text-[#063b32]",
  scheduled: "bg-amber-100 text-amber-800",
  draft: "bg-[#f5f274]/70 text-[#6f6b62]",
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

function ConnectedPostRow({
  row,
  busy,
  calendarDay,
  onSchedule,
  onMarkPosted,
  onOpen,
}: {
  row: ConnectedRow;
  busy?: boolean;
  calendarDay?: string;
  onSchedule?: (target: ConnectedTarget, iso: string) => Promise<void>;
  onMarkPosted?: (target: ConnectedTarget) => Promise<void>;
  onOpen: () => void;
}) {
  const [date, setDate] = useState(() =>
    defaultScheduleValue(calendarDay, row.scheduled_date || null),
  );

  return (
    <div>
      <SocialPostSummaryCard social={row} onOpen={onOpen} />
      <div className="mt-1.5 flex flex-wrap items-center gap-2 px-1">
        {row.isPosted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
            <CheckCircle2 className="h-3 w-3" />
            Posted
          </span>
        ) : row.isScheduled ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Scheduled {formatShortDate(row.scheduled_date)}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
            Not scheduled
          </span>
        )}
        {!row.isPosted && !row.isScheduled && row.platform !== "share" && onSchedule && (
          <>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-[#111111]/15 px-2 py-1 text-[10px] text-[#111111] outline-none focus:border-[#063b32]/40"
            />
            <button
              type="button"
              disabled={!date || busy}
              onClick={() => void onSchedule(row.target, date)}
              className="rounded-md bg-[#063b32] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
            >
              Schedule
            </button>
          </>
        )}
        {!row.isPosted && onMarkPosted && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onMarkPosted(row.target)}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
          >
            Mark as posted
          </button>
        )}
      </div>
    </div>
  );
}

export function CalendarItemPreviewModal({
  post,
  linkedSocial: linkedSocialProp,
  calendarDay,
  busy,
  onClose,
  onDelete,
  onScheduleBlog,
  onScheduleConnected,
  onMarkConnectedPosted,
}: Props) {
  const [linkedSocial, setLinkedSocial] = useState<SocialPost[]>(linkedSocialProp ?? []);
  const [activeSocial, setActiveSocial] = useState<SocialPost | null>(null);
  const [fullPost, setFullPost] = useState<CalendarBlogPreview | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blogScheduleDate, setBlogScheduleDate] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (linkedSocialProp) {
      setLinkedSocial(linkedSocialProp);
    }
  }, [linkedSocialProp]);

  useEffect(() => {
    const path = `/admin/posts/${post.id}`;
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

  useEffect(() => {
    const existing =
      displayPost.status === "published"
        ? displayPost.published_at
        : displayPost.scheduled_at;
    setBlogScheduleDate(defaultScheduleValue(calendarDay, existing));
  }, [displayPost, calendarDay]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

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

  const displayDate =
    displayPost.status === "published"
      ? formatDate(displayPost.published_at)
      : displayPost.status === "scheduled"
        ? formatDate(displayPost.scheduled_at)
        : formatDate(displayPost.updated_at);

  const hasScheduleActions = Boolean(onScheduleBlog || onScheduleConnected);

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
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          {hasScheduleActions && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]"
                aria-label="Schedule options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-64 rounded-lg border border-[#111111]/10 bg-white p-3 shadow-lg">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6b62]">
                    Schedule
                  </p>
                  {onScheduleBlog && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs font-semibold text-[#111111]">Blog post</p>
                      <input
                        type="datetime-local"
                        value={blogScheduleDate}
                        onChange={(e) => setBlogScheduleDate(e.target.value)}
                        className="w-full rounded-md border border-[#111111]/15 px-2 py-1.5 text-xs text-[#111111] outline-none focus:border-[#063b32]/40"
                      />
                      <button
                        type="button"
                        disabled={!blogScheduleDate || busy}
                        onClick={() => {
                          void onScheduleBlog(blogScheduleDate);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#063b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-40"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        {displayPost.status === "published" ? "Set publish date" : "Schedule blog"}
                      </button>
                    </div>
                  )}
                  {calendarDay && (
                    <p className="mt-2 text-[10px] text-[#6f6b62]">
                      Defaults to {formatShortDate(calendarDay)} from calendar
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {displayPost.cover_image_url ? (
          <div className="aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#f7f4ea]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPost.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2 pr-16">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[displayPost.status]}`}
            >
              {displayPost.status}
            </span>
            {displayPost.content_type ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6f6b62]">
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
            <p className="text-xs text-[#6f6b62]">
              {displayPost.status === "scheduled" ? "Scheduled for " : displayPost.status === "published" ? "Published " : "Updated "}
              {displayDate}
            </p>
          ) : null}

          {displayPost.description ? (
            <p className="text-sm leading-relaxed text-[#6f6b62]">
              {displayPost.description}
            </p>
          ) : (
            <p className="text-sm italic text-[#6f6b62]/60">No description</p>
          )}

          {connectedRows.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Connected posts
              </p>
              <div className="space-y-2">
                {connectedRows.map((row) => (
                  <ConnectedPostRow
                    key={row.id}
                    row={row}
                    busy={busy}
                    calendarDay={calendarDay}
                    onSchedule={onScheduleConnected}
                    onMarkPosted={onMarkConnectedPosted}
                    onOpen={() => setActiveSocial(row)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Link
              href={`/admin/posts/${displayPost.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#063b32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5c42]"
            >
              Open full post
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      {activeSocial && !activeSocial.id.startsWith("inline-") && (
        <SocialPostPreviewModal
          social={activeSocial}
          onClose={() => setActiveSocial(null)}
          onDelete={async () => {
            await fetch(`/api/admin/social-posts/${activeSocial.id}`, { method: "DELETE" });
            setLinkedSocial((prev) => prev.filter((s) => s.id !== activeSocial.id));
            setActiveSocial(null);
          }}
        />
      )}
      {activeSocial && activeSocial.id.startsWith("inline-") && (
        <SocialPostPreviewModal
          social={activeSocial}
          onClose={() => setActiveSocial(null)}
        />
      )}
    </div>
  );
}