"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { CalendarItemPreviewModal } from "@/components/admin/CalendarItemPreviewModal";
import type { SocialPostPreview } from "@/components/admin/SocialPostPreviewModal";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Facebook,
  FileText,
  Instagram,
  Link2,
  Linkedin,
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

type Post = {
  id: string;
  title: string;
  description?: string | null;
  content_type: string;
  status: "draft" | "published" | "scheduled";
  cover_image_url?: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  updated_at: string;
  slug?: string | null;
  linkedin_post?: string | null;
  instagram_caption?: string | null;
  sharing_caption?: string | null;
  social_hashtags?: string[] | null;
  linkedin_posted_at?: string | null;
  instagram_posted_at?: string | null;
  sharing_posted_at?: string | null;
};

type SocialPost = {
  id: string;
  title: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter";
  description: string;
  content: string;
  scheduled_date: string;
  tags: string[];
  link: string | null;
  posted_at?: string | null;
};

const PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, color: "#0077b5", bg: "bg-[#0077b5]/10", text: "text-[#0077b5]" },
  { key: "instagram", label: "Instagram", Icon: Instagram, color: "#E1306C", bg: "bg-pink-50", text: "text-pink-600" },
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "#1877f2", bg: "bg-blue-50", text: "text-blue-600" },
  { key: "twitter", label: "X", Icon: XIcon, color: "#000000", bg: "bg-gray-100", text: "text-gray-900" },
];

function platformInfo(key: string) {
  return PLATFORMS.find((p) => p.key === key) ?? PLATFORMS[0];
}

/** Platform chips use the legend colours so social items are easy to scan. */
function platformChipClasses(platform: string, opts?: { posted?: boolean }) {
  if (opts?.posted) return "border border-pine-900/10 bg-white text-muted";
  const info = platformInfo(platform);
  return `border border-transparent ${info.bg} ${info.text}`;
}

/** Blog posts: published on published_at day; scheduled on scheduled_at day. */
function postCalendarDate(post: Post): string | null {
  if (post.status === "published") {
    return post.published_at ?? post.updated_at ?? null;
  }
  if (post.status === "scheduled") {
    return post.scheduled_at ?? null;
  }
  // Drafts only appear if they already have a schedule date (treat as scheduled)
  if (post.status === "draft" && post.scheduled_at) {
    return post.scheduled_at;
  }
  return null;
}

function postIsScheduledOnCalendar(post: Post): boolean {
  return post.status === "scheduled" || (post.status === "draft" && !!post.scheduled_at);
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getWeekDays(anchor: Date): Date[] {
  const dow = (anchor.getDay() + 6) % 7;
  const mon = new Date(anchor);
  mon.setDate(anchor.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Map a stored date/datetime onto the user's local calendar day.
 * - Date-only "YYYY-MM-DD" → that calendar day
 * - Full ISO timestamps → local wall-clock day (not the UTC date prefix,
 *   which can land a UK evening schedule on the previous day)
 */
function parseLocalDay(isoStr: string): Date {
  const trimmed = isoStr.trim();
  if (!trimmed) return new Date(NaN);

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const dt = new Date(trimmed);
  if (!Number.isNaN(dt.getTime())) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  const [y, m, d] = trimmed.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function moveIsoToDay(existingIso: string | null | undefined, targetDay: Date): string {
  const time = existingIso ? new Date(existingIso) : new Date();
  if (!existingIso) time.setHours(9, 0, 0, 0);
  const moved = new Date(targetDay);
  moved.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
  return moved.toISOString();
}

type CalendarDragPayload =
  | {
      kind: "post-group";
      postId: string;
      sourceDay: string;
      postOnSourceDay: boolean;
      connectedSocialIds: string[];
    }
  | {
      kind: "social";
      socialId: string;
      sourceDay: string;
    };

function isConnectedSocial(sp: SocialPost) {
  return !!sp.link?.includes("/admin/posts/");
}

function socialLinksToPost(link: string | null | undefined, postId: string) {
  if (!link) return false;
  return link.includes(`/admin/posts/${postId}`);
}

function postIdFromSocialLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const match = link.match(/\/admin\/posts\/([^/?#]+)/);
  return match?.[1] ?? null;
}

type DayCalendarGroup = {
  post: Post;
  connectedSocial: SocialPost[];
  inlineItems: ConnectedDisplayItem[];
};

function postOnCalendarDay(post: Post, day: Date): boolean {
  const dateStr = postCalendarDate(post);
  if (!dateStr) return false;
  // Use local calendar day so timezone offsets never shift the cell
  return isSameDay(parseLocalDay(dateStr), day);
}

function socialOnCalendarDay(social: SocialPost, day: Date): boolean {
  // Posted socials sit on the day they were marked posted
  if (social.posted_at) {
    return isSameDay(parseLocalDay(social.posted_at), day);
  }
  if (!social.scheduled_date?.trim()) return false;
  return isSameDay(parseLocalDay(social.scheduled_date), day);
}

function buildDayCalendarGroups(
  day: Date,
  posts: Post[],
  socialPosts: SocialPost[],
): { groups: DayCalendarGroup[]; standaloneSocial: SocialPost[] } {
  // Blog posts only on their own publish / schedule day — never dragged onto
  // a different day just because a connected social is due then.
  const dayPosts = posts.filter((p) => postOnCalendarDay(p, day));
  const dayPostIds = new Set(dayPosts.map((p) => p.id));
  const allDaySocial = socialPosts.filter((s) => socialOnCalendarDay(s, day));

  const connectedByPostId = new Map<string, SocialPost[]>();
  const standaloneSocial: SocialPost[] = [];

  for (const s of allDaySocial) {
    const postId = postIdFromSocialLink(s.link);
    if (!postId || !isConnectedSocial(s)) {
      standaloneSocial.push(s);
      continue;
    }
    // Nest under the blog only when the blog itself belongs on this day
    if (dayPostIds.has(postId)) {
      const list = connectedByPostId.get(postId) ?? [];
      list.push(s);
      connectedByPostId.set(postId, list);
    } else {
      // Social due today; parent blog lives on another day — show as social chip
      standaloneSocial.push(s);
    }
  }

  const groups: DayCalendarGroup[] = dayPosts.map((post) => ({
    post,
    connectedSocial: connectedByPostId.get(post.id) ?? [],
    inlineItems: [],
  }));

  return { groups, standaloneSocial };
}

function beginCalendarDrag(e: DragEvent, id: string) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", id);
}

function CalendarBlogGroupCard({
  group,
  minimal,
  sourceDay,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragConnectedStart,
  isDragging,
}: {
  group: DayCalendarGroup;
  minimal?: boolean;
  sourceDay: string;
  onOpen: () => void;
  onDragStart: (payload: CalendarDragPayload) => void;
  onDragEnd: () => void;
  onDragConnectedStart: (socialId: string, sourceDay: string) => void;
  isDragging?: boolean;
}) {
  const { post, connectedSocial, inlineItems } = group;
  const hasConnected = connectedSocial.length > 0 || inlineItems.length > 0;
  const isScheduled = postIsScheduledOnCalendar(post);
  const isPublished = post.status === "published";
  const postOnSourceDay = postOnCalendarDay(post, parseLocalDay(sourceDay));
  const didDragRef = useRef(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        didDragRef.current = false;
        beginCalendarDrag(e, post.id);
        onDragStart({
          kind: "post-group",
          postId: post.id,
          sourceDay,
          postOnSourceDay,
          connectedSocialIds: connectedSocial.map((s) => s.id),
        });
      }}
      onDrag={() => { didDragRef.current = true; }}
      onDragEnd={() => {
        setTimeout(() => { didDragRef.current = false; }, 50);
        onDragEnd();
      }}
      onClick={() => {
        if (didDragRef.current) return;
        onOpen();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
      className={`block w-full cursor-grab overflow-hidden rounded-lg border text-left transition-colors hover:border-pine-900/25 active:cursor-grabbing ${
        isScheduled
          ? "border-pine-900/10 border-l-[3px] border-l-amber-500 bg-amber-50/50"
          : isPublished
            ? "border-pine-900/15 border-l-[3px] border-l-pine-900 bg-white"
            : "border-pine-900/10 bg-white"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {post.cover_image_url && !minimal ? (
        <div className="h-10 w-full overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="px-2 py-1.5">
        <div className="mb-1 flex items-center gap-1">
          {isScheduled ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-amber-800">
              <CalendarClock className="h-2 w-2" />
              Scheduled
            </span>
          ) : isPublished ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-pine-900 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-paper">
              <CheckCircle2 className="h-2 w-2" />
              Published
            </span>
          ) : null}
        </div>
        <div className="flex items-start gap-1">
          <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-pine-900">
            {post.title || "Untitled"}
          </p>
        </div>
        {hasConnected && (
          <div className="mt-1.5 flex flex-wrap gap-1 border-t border-pine-900/8 pt-1.5">
            {connectedSocial.map((s) => {
              const info = platformInfo(s.platform);
              return (
                <div
                  key={s.id}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    beginCalendarDrag(e, s.id);
                    onDragConnectedStart(s.id, sourceDay);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    onDragEnd();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  title={info.label}
                  className={`flex cursor-grab items-center gap-0.5 rounded-md px-1 py-0.5 text-[9px] font-semibold active:cursor-grabbing ${platformChipClasses(s.platform)}`}
                >
                  <info.Icon className="h-2.5 w-2.5 shrink-0 opacity-70" style={{ color: info.color }} />
                  <span className="sr-only sm:not-sr-only sm:inline">{info.label.slice(0, 2)}</span>
                </div>
              );
            })}
            {inlineItems.slice(0, 3).map((item) => {
              const info = platformInfo(item.platform === "share" ? "linkedin" : item.platform);
              const isShare = item.platform === "share";
              return (
                <div
                  key={item.id}
                  title={isShare ? "Share" : info.label}
                  className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[9px] font-semibold ${platformChipClasses(item.platform)}`}
                >
                  {isShare ? <FileText className="h-2.5 w-2.5 shrink-0 text-muted" /> : <info.Icon className="h-2.5 w-2.5 shrink-0 opacity-70" style={{ color: info.color }} />}
                </div>
              );
            })}
            {inlineItems.length > 3 ? (
              <span className="text-[9px] font-semibold text-muted">+{inlineItems.length - 3}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

type ConnectedScheduleEntry = {
  post: Post;
  social?: SocialPost;
  kind: "inline" | "social";
  platform: string;
  label: string;
  preview: string;
};

type ConnectedDisplayItem = SocialPostPreview & {
  pending: boolean;
  scheduled: boolean;
  scheduleEntry?: ConnectedScheduleEntry;
  posted?: boolean;
};

type ConnectedPostGroup = {
  post: Post;
  items: ConnectedDisplayItem[];
  pendingCount: number;
};

type SchedulingTab = "published" | "draft" | "none";

function hasValidDate(iso: string | null | undefined) {
  return !!iso && iso.trim() !== "";
}

function buildInlineSocialPreview(post: Post, existingPlatforms: Set<string>): ConnectedDisplayItem[] {
  const out: ConnectedDisplayItem[] = [];
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
      pending: !post.linkedin_posted_at,
      posted: !!post.linkedin_posted_at,
      scheduled: false,
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
      pending: !post.instagram_posted_at,
      posted: !!post.instagram_posted_at,
      scheduled: false,
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
      pending: !post.sharing_posted_at,
      posted: !!post.sharing_posted_at,
      scheduled: false,
    });
  }
  return out;
}

function postHasConnectedContent(post: Post, socialPosts: SocialPost[]): boolean {
  const linked = socialPosts.filter((s) => socialLinksToPost(s.link, post.id));
  if (linked.length > 0) return true;
  if (post.linkedin_post?.trim()) return true;
  if (post.instagram_caption?.trim()) return true;
  if (post.sharing_caption?.trim()) return true;
  return false;
}

function buildNoConnectedPostGroups(posts: Post[], socialPosts: SocialPost[]): ConnectedPostGroup[] {
  return posts
    .filter((post) => !postHasConnectedContent(post, socialPosts))
    .map((post) => ({ post, items: [], pendingCount: 0 }));
}

function buildConnectedPostGroups(
  posts: Post[],
  socialPosts: SocialPost[],
  tab: Exclude<SchedulingTab, "none">,
): ConnectedPostGroup[] {
  const groups: ConnectedPostGroup[] = [];

  for (const post of posts) {
    const isPublishedTab = tab === "published";
    if (isPublishedTab && post.status !== "published") continue;
    if (!isPublishedTab && post.status !== "draft" && post.status !== "scheduled") continue;
    const linked = socialPosts.filter((s) => socialLinksToPost(s.link, post.id));
    const linkedByPlatform = new Map(linked.map((s) => [s.platform, s]));
    const inlinePlatforms: Array<{ key: string; label: string }> = [
      { key: "linkedin", label: "LinkedIn" },
      { key: "instagram", label: "Instagram" },
      { key: "share", label: "Share text" },
    ];

    let pendingCount = 0;
    let hasConnectedContent = false;

    for (const { key } of inlinePlatforms) {
      const body = inlineBodyForPlatform(post, key);
      if (!body) continue;
      hasConnectedContent = true;
      if (linkedByPlatform.has(key as SocialPost["platform"])) continue;
      if (!inlinePostedAt(post, key)) pendingCount += 1;
    }

    for (const social of linked) {
      hasConnectedContent = true;
      if (!social.posted_at) pendingCount += 1;
    }

    if (!hasConnectedContent || pendingCount === 0) continue;

    groups.push({
      post,
      items: [],
      pendingCount,
    });
  }

  return groups;
}

type ConnectedContentStatus = "none" | "pending" | "done";

function inlineBodyForPlatform(post: Post, platform: string): string {
  if (platform === "linkedin") return post.linkedin_post?.trim() ?? "";
  if (platform === "instagram") return post.instagram_caption?.trim() ?? "";
  if (platform === "share") return post.sharing_caption?.trim() ?? "";
  return "";
}

function inlinePostedAt(post: Post, platform: string): string | null | undefined {
  if (platform === "linkedin") return post.linkedin_posted_at;
  if (platform === "instagram") return post.instagram_posted_at;
  if (platform === "share") return post.sharing_posted_at;
  return null;
}

function inlinePostedField(platform: string): "linkedin_posted_at" | "instagram_posted_at" | "sharing_posted_at" | null {
  if (platform === "linkedin") return "linkedin_posted_at";
  if (platform === "instagram") return "instagram_posted_at";
  if (platform === "share") return "sharing_posted_at";
  return null;
}

function connectedContentStatus(post: Post, linked: SocialPost[]): ConnectedContentStatus {
  if (post.status !== "published") return "none";
  const linkedByPlatform = new Map(linked.map((s) => [s.platform, s]));
  const platforms: Array<{ key: string; body: string }> = [
    { key: "linkedin", body: post.linkedin_post?.trim() ?? "" },
    { key: "instagram", body: post.instagram_caption?.trim() ?? "" },
    { key: "share", body: post.sharing_caption?.trim() ?? "" },
  ];
  const withCopy = platforms.filter((p) => p.body);
  if (withCopy.length === 0) return "none";

  const allDone = withCopy.every((p) => {
    if (inlinePostedAt(post, p.key)) return true;
    if (p.key === "share") return false;
    const social = linkedByPlatform.get(p.key as SocialPost["platform"]);
    if (social?.posted_at) return true;
    if (social && social.scheduled_date?.trim()) return true;
    return false;
  });

  if (allDone) return "done";
  return "pending";
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ─── Social post form ─── */
function SocialPostForm({
  initial,
  defaultDate,
  onSave,
  onCancel,
}: {
  initial?: Partial<SocialPost>;
  defaultDate?: string;
  onSave: (data: Omit<SocialPost, "id">) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [platform, setPlatform] = useState<SocialPost["platform"]>(initial?.platform ?? "linkedin");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [date, setDate] = useState(initial?.scheduled_date ?? defaultDate ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    setSaving(true);
    await onSave({ title, platform, description, content, scheduled_date: date, tags: [], link: link || null });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900">{initial?.id ? "Edit social post" : "New social post"}</h2>
        <button type="button" onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* Platform */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Platform</label>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlatform(p.key as SocialPost["platform"])}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-semibold transition-colors ${
                  platform === p.key
                    ? "border-current " + p.bg + " " + p.text
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
                style={platform === p.key ? { borderColor: p.color } : {}}
              >
                <p.Icon className="h-5 w-5" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            Post title <span className="text-red-500">*</span>
          </label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="A short label for this post"
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]" />
        </div>

        {/* Scheduled date */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            Publish date <span className="text-red-500">*</span>
          </label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]" />
        </div>

        {/* Content / written post */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Written post content</label>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the full post copy here…"
            className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]" />
          <p className="mt-1 text-[10px] text-gray-400">{content.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Link */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Link (optional)</label>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]" />
        </div>
      </div>

      <div className="border-t border-gray-100 p-6">
        <button type="submit" disabled={saving || !title || !date}
          className="w-full rounded-md bg-[#122428] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving…" : initial?.id ? "Update post" : "Save post"}
        </button>
      </div>
    </form>
  );
}

/* ─── Social post detail modal ─── */
function SocialPostDetail({
  post,
  onClose,
  onDelete,
  onEdit,
  onMarkPosted,
  markingPosted,
}: {
  post: SocialPost;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onMarkPosted: () => void;
  markingPosted: boolean;
}) {
  const info = platformInfo(post.platform);
  const [copied, setCopied] = useState(false);
  const isPosted = !!post.posted_at;

  const copyContent = () => {
    navigator.clipboard.writeText(post.content || post.description || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConnectedPost = post.link?.startsWith("/admin/posts/");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${info.bg} ${info.text}`}>
            <info.Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-gray-900">{post.title}</p>
            <div className="flex items-center gap-2">
              <p className={`text-xs font-semibold ${info.text}`}>{info.label}</p>
              {isConnectedPost && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#122428]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#122428]">
                  <Link2 className="h-2.5 w-2.5" /> Connected
                </span>
              )}
              {isPosted && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-acid/50 px-1.5 py-0.5 text-[9px] font-semibold text-ink">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Posted
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
              {isPosted ? "Posted on" : "Publish date"}
            </p>
            <p className="mt-1 font-medium text-gray-800">
              {isPosted
                ? new Date(post.posted_at!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : post.scheduled_date?.trim()
                ? new Date(post.scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : "Not scheduled yet"}
            </p>
          </div>
          {post.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Connected blog post */}
        {isConnectedPost && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Connected blog post</p>
            <a
              href={post.link!}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-[#122428] hover:bg-pine-50"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open post editor
            </a>
          </div>
        )}

        {post.description && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Description</p>
            <p className="mt-1 text-sm text-gray-600">{post.description}</p>
          </div>
        )}

        {post.content && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Post copy</p>
            <div className="rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap">{post.content}</div>
          </div>
        )}

        {/* Post to platform */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Post to platform</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyContent}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy post text"}
            </button>
            {post.platform === "linkedin" && (
              <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0077b5] hover:bg-[#0077b5]/5">
                <Linkedin className="h-3.5 w-3.5" /> Open LinkedIn
              </a>
            )}
            {post.platform === "instagram" && (
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50">
                <Instagram className="h-3.5 w-3.5" /> Open Instagram
              </a>
            )}
            {post.platform === "facebook" && (
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                <Facebook className="h-3.5 w-3.5" /> Open Facebook
              </a>
            )}
            {post.platform === "twitter" && (
              <a href="https://x.com/i" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50">
                <XIcon className="h-3.5 w-3.5" /> Open X
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 p-6">
        {!isPosted && (
          <button
            type="button"
            onClick={onMarkPosted}
            disabled={markingPosted}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-pine-900/15 bg-acid/40 py-2.5 text-sm font-semibold text-ink hover:bg-acid/60 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {markingPosted ? "Marking…" : "Mark as posted"}
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Edit
          </button>
          <button onClick={onDelete} className="rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectedPostCard({
  group,
  onSelectPost,
  tab,
}: {
  group: ConnectedPostGroup;
  onSelectPost: (post: Post) => void;
  tab: SchedulingTab;
}) {
  const { post, pendingCount } = group;
  const statusLabel =
    tab === "none"
      ? post.status === "published"
        ? "Published blog post"
        : post.status === "scheduled"
          ? "Scheduled blog post"
          : "Draft blog post"
      : tab === "published"
        ? "Published blog post"
        : post.status === "scheduled"
          ? "Scheduled blog post"
          : "Draft blog post";

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectPost(post)}
        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
      >
        {post.cover_image_url ? (
          <div className="mb-2 aspect-[16/7] overflow-hidden rounded-md bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
          {post.title || "Untitled"}
        </p>
        {post.description ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500">{post.description}</p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-gray-600">
            <FileText className="h-2.5 w-2.5" />
            {statusLabel}
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pine-100 px-2 py-0.5 text-[9px] font-semibold text-pine-800">
              <Link2 className="h-2.5 w-2.5" />
              {pendingCount} to post
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function SchedulingPanel({
  publishedConnectedGroups,
  draftConnectedGroups,
  noConnectedGroups,
  onSelectPost,
}: {
  publishedConnectedGroups: ConnectedPostGroup[];
  draftConnectedGroups: ConnectedPostGroup[];
  noConnectedGroups: ConnectedPostGroup[];
  onSelectPost: (post: Post) => void;
}) {
  const [tab, setTab] = useState<SchedulingTab>("published");
  const activeGroups =
    tab === "published"
      ? publishedConnectedGroups
      : tab === "draft"
        ? draftConnectedGroups
        : noConnectedGroups;

  return (
    <aside className="flex max-h-[calc(100vh-7rem)] min-h-0 flex-col rounded-2xl border border-pine-900/10 bg-white shadow-sm">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3.5">
        <div className="flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={() => setTab("published")}
            className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
              tab === "published" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-[#111111]"
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setTab("draft")}
            className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
              tab === "draft" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-[#111111]"
            }`}
          >
            Drafts
          </button>
          <button
            type="button"
            onClick={() => setTab("none")}
            className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
              tab === "none" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-[#111111]"
            }`}
          >
            No connected content
          </button>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">Connected content</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
          {tab === "published"
            ? "Published posts with connected content still to post. Click a post to view, schedule, or mark items as posted."
            : tab === "draft"
              ? "Draft and scheduled posts with connected content still to post. Click a post to manage connected items."
              : "Posts with no connected social content yet. Click a post to open or set dates."}
        </p>
        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
          {activeGroups.length}
        </span>
      </div>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-3">
        {activeGroups.length === 0 ? (
          <li className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
            {tab === "published"
              ? "All connected content has been posted"
              : tab === "draft"
                ? "No draft posts with connected content to post"
                : "All posts have connected content"}
          </li>
        ) : (
          activeGroups.map((group) => (
            <ConnectedPostCard
              key={group.post.id}
              group={group}
              tab={tab}
              onSelectPost={onSelectPost}
            />
          ))
        )}
      </ul>
    </aside>
  );
}

/* ─── Main calendar page ─── */
export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week">("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekAnchor, setWeekAnchor] = useState(today);

  // Right panel state
  const [panelMode, setPanelMode] = useState<"none" | "new-social" | "edit-social" | "view-social">("none");
  const [panelDate, setPanelDate] = useState("");
  const [activeSocial, setActiveSocial] = useState<SocialPost | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [previewCalendarDay, setPreviewCalendarDay] = useState<string | null>(null);
  const [connectedBusy, setConnectedBusy] = useState(false);
  const draggingPayloadRef = useRef<CalendarDragPayload | null>(null);
  const [markingSocialPosted, setMarkingSocialPosted] = useState(false);
  const [draggingPayload, setDraggingPayload] = useState<CalendarDragPayload | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [postsRes, socialRes] = await Promise.all([
        fetch("/api/admin/posts").then((r) => r.json() as Promise<{ data?: Post[]; error?: string }>),
        fetch("/api/admin/social-posts").then((r) => r.json() as Promise<{ data?: SocialPost[]; error?: string }>),
      ]);
      if (postsRes.error) {
        setLoadError(postsRes.error);
        setPosts([]);
      } else {
        setPosts(postsRes.data ?? []);
      }
      if (socialRes.error) {
        setLoadError((prev) => prev ?? socialRes.error ?? null);
        setSocialPosts([]);
      } else {
        setSocialPosts(socialRes.data ?? []);
      }
    } catch {
      setLoadError("Could not load calendar data");
      setPosts([]);
      setSocialPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const publishedConnectedGroups = useMemo(
    () => buildConnectedPostGroups(posts, socialPosts, "published"),
    [posts, socialPosts],
  );

  const draftConnectedGroups = useMemo(
    () => buildConnectedPostGroups(posts, socialPosts, "draft"),
    [posts, socialPosts],
  );

  const noConnectedGroups = useMemo(
    () => buildNoConnectedPostGroups(posts, socialPosts),
    [posts, socialPosts],
  );

  const linkedSocialForPost = useCallback(
    (postId: string) => socialPosts.filter((s) => socialLinksToPost(s.link, postId)),
    [socialPosts],
  );

  function postsOnDay(day: Date) {
    return posts.filter((p) => postOnCalendarDay(p, day));
  }

  function socialOnDay(day: Date) {
    return socialPosts.filter((s) => socialOnCalendarDay(s, day));
  }

  const buildInlineSocialContent = (post: Post, platform: string) => {
    const body = inlineBodyForPlatform(post, platform);
    const postUrl = post.slug ? `/posts/${post.slug}` : "";
    const hashtags = (post.social_hashtags ?? []).map((h) => `#${h}`).join(" ");
    const suffix = [postUrl || null, hashtags || null].filter(Boolean).join("\n\n");
    return [body, suffix].filter(Boolean).join("\n\n");
  };

  const scheduleConnectedEntry = async (entry: ConnectedScheduleEntry, value: string) => {
    if (!value) return;
    setConnectedBusy(true);
    try {
      const scheduledDate = new Date(value).toISOString();
      if (entry.kind === "social" && entry.social) {
        await fetch(`/api/admin/social-posts/${entry.social.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_date: scheduledDate }),
        });
      } else if (entry.platform !== "share") {
        await fetch("/api/admin/social-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${entry.post.title || "Post"} — ${entry.label}`,
            platform: entry.platform,
            description: "",
            content: buildInlineSocialContent(entry.post, entry.platform),
            scheduled_date: scheduledDate,
            tags: [],
            link: `/admin/posts/${entry.post.id}`,
          }),
        });
      }
      await load();
    } finally {
      setConnectedBusy(false);
    }
  };

  const markConnectedEntryPosted = async (entry: ConnectedScheduleEntry) => {
    setConnectedBusy(true);
    try {
      const now = new Date().toISOString();
      if (entry.kind === "social" && entry.social) {
        await fetch(`/api/admin/social-posts/${entry.social.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ posted_at: now }),
        });
      } else {
        const field = inlinePostedField(entry.platform);
        if (!field) return;
        await fetch(`/api/admin/posts/${entry.post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: now }),
        });
      }
      await load();
    } finally {
      setConnectedBusy(false);
    }
  };

  const markSocialPosted = async (social: SocialPost) => {
    if (!confirm("Mark this social post as posted?")) return;
    setMarkingSocialPosted(true);
    try {
      await fetch(`/api/admin/social-posts/${social.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posted_at: new Date().toISOString() }),
      });
      setPanelMode("none");
      await load();
    } finally {
      setMarkingSocialPosted(false);
    }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };
  const prevWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
  const nextWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };

  const monthDays = getMonthDays(year, month);
  const weekDays = getWeekDays(weekAnchor);

  const openNewSocial = (date: string) => {
    setPanelDate(date);
    setActiveSocial(null);
    setPanelMode("new-social");
  };

  const saveSocial = async (data: Omit<SocialPost, "id">) => {
    if (activeSocial?.id) {
      await fetch(`/api/admin/social-posts/${activeSocial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setPanelMode("none");
    load();
  };

  const deleteSocialById = async (id: string) => {
    if (!confirm("Delete this social post?")) return;
    await fetch(`/api/admin/social-posts/${id}`, { method: "DELETE" });
    setPanelMode("none");
    await load();
  };

  const deleteSocial = async (id: string) => deleteSocialById(id);

  const setDragPayload = (payload: CalendarDragPayload | null) => {
    draggingPayloadRef.current = payload;
    setDraggingPayload(payload);
  };

  const clearDragState = () => {
    draggingPayloadRef.current = null;
    setDraggingPayload(null);
    setDropTargetDay(null);
  };

  const buildConnectedEntry = (
    post: Post,
    target: { type: "social"; socialId: string } | { type: "inline"; platform: string },
  ): ConnectedScheduleEntry | null => {
    const linked = socialPosts.filter((s) => socialLinksToPost(s.link, post.id));
    if (target.type === "social") {
      const social = linked.find((s) => s.id === target.socialId);
      if (!social) return null;
      return {
        post,
        social,
        kind: "social",
        platform: social.platform,
        label: platformInfo(social.platform).label,
        preview: social.content || social.description || "",
      };
    }
    const labels: Record<string, string> = {
      linkedin: "LinkedIn",
      instagram: "Instagram",
      share: "Share text",
    };
    const body = inlineBodyForPlatform(post, target.platform);
    if (!body) return null;
    return {
      post,
      kind: "inline",
      platform: target.platform,
      label: labels[target.platform] ?? target.platform,
      preview: body,
    };
  };

  const scheduleBlogFromPreview = async (iso: string) => {
    if (!previewPost || !iso) return;
    setConnectedBusy(true);
    try {
      const scheduledIso = new Date(iso).toISOString();
      const body =
        previewPost.status === "published"
          ? { published_at: scheduledIso }
          : { scheduled_at: scheduledIso, status: "scheduled" };
      await fetch(`/api/admin/posts/${previewPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await load();
      const res = await fetch(`/api/admin/posts/${previewPost.id}`).then(
        (r) => r.json() as Promise<{ data?: Post }>,
      );
      if (res.data) setPreviewPost(res.data);
    } finally {
      setConnectedBusy(false);
    }
  };

  const scheduleConnectedFromPreview = async (
    target: { type: "social"; socialId: string } | { type: "inline"; platform: string },
    iso: string,
  ) => {
    if (!previewPost || !iso) return;
    const post = posts.find((p) => p.id === previewPost.id) ?? previewPost;
    const entry = buildConnectedEntry(post, target);
    if (!entry) return;
    await scheduleConnectedEntry(entry, iso);
    const res = await fetch(`/api/admin/posts/${previewPost.id}`).then(
      (r) => r.json() as Promise<{ data?: Post }>,
    );
    if (res.data) setPreviewPost(res.data);
  };

  const saveAllDatesFromPreview = async (iso: string) => {
    if (!previewPost || !iso) return;
    setConnectedBusy(true);
    try {
      const scheduledIso = new Date(iso).toISOString();
      const post = posts.find((p) => p.id === previewPost.id) ?? previewPost;
      const blogBody =
        previewPost.status === "published"
          ? { published_at: scheduledIso }
          : { scheduled_at: scheduledIso, status: "scheduled" };
      await fetch(`/api/admin/posts/${previewPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogBody),
      });

      const linked = socialPosts.filter((s) => socialLinksToPost(s.link, post.id));
      const linkedPlatforms = new Set(linked.map((s) => s.platform));

      for (const social of linked) {
        if (social.posted_at) continue;
        await fetch(`/api/admin/social-posts/${social.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_date: scheduledIso }),
        });
      }

      for (const platform of ["linkedin", "instagram"] as const) {
        if (linkedPlatforms.has(platform)) continue;
        if (!inlineBodyForPlatform(post, platform)) continue;
        if (inlinePostedAt(post, platform)) continue;
        const entry = buildConnectedEntry(post, { type: "inline", platform });
        if (!entry) continue;
        await fetch("/api/admin/social-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${entry.post.title || "Post"} — ${entry.label}`,
            platform: entry.platform,
            description: "",
            content: buildInlineSocialContent(entry.post, entry.platform),
            scheduled_date: scheduledIso,
            tags: [],
            link: `/admin/posts/${entry.post.id}`,
          }),
        });
      }

      await load();
      const res = await fetch(`/api/admin/posts/${previewPost.id}`).then(
        (r) => r.json() as Promise<{ data?: Post }>,
      );
      if (res.data) setPreviewPost(res.data);
    } finally {
      setConnectedBusy(false);
    }
  };

  const deleteAllFromPreview = async () => {
    if (!previewPost) return;
    setConnectedBusy(true);
    try {
      const linked = socialPosts.filter((s) => socialLinksToPost(s.link, previewPost.id));
      for (const social of linked) {
        await fetch(`/api/admin/social-posts/${social.id}`, { method: "DELETE" });
      }
      await fetch(`/api/admin/posts/${previewPost.id}`, { method: "DELETE" });
      setPreviewPost(null);
      setPreviewCalendarDay(null);
      await load();
    } finally {
      setConnectedBusy(false);
    }
  };

  const markConnectedFromPreview = async (
    target: { type: "social"; socialId: string } | { type: "inline"; platform: string },
  ) => {
    if (!previewPost) return;
    const post = posts.find((p) => p.id === previewPost.id) ?? previewPost;
    const entry = buildConnectedEntry(post, target);
    if (!entry) return;
    const now = new Date().toISOString();
    if (target.type === "social") {
      setSocialPosts((prev) =>
        prev.map((s) => (s.id === target.socialId ? { ...s, posted_at: now } : s)),
      );
    } else {
      const field = inlinePostedField(target.platform);
      if (!field) return;
      setPosts((prev) =>
        prev.map((p) => (p.id === previewPost.id ? { ...p, [field]: now } : p)),
      );
      setPreviewPost((prev) => (prev ? { ...prev, [field]: now } : prev));
    }
    await markConnectedEntryPosted(entry);
  };

  const rescheduleToDay = async (payload: CalendarDragPayload, targetDayStr: string) => {
    if (payload.sourceDay === targetDayStr) return;
    const targetDay = parseLocalDay(targetDayStr);
    setRescheduling(true);

    try {
      if (payload.kind === "social") {
        const social = socialPosts.find((s) => s.id === payload.socialId);
        if (!social) return;
        const scheduled_date = moveIsoToDay(social.scheduled_date, targetDay);
        setSocialPosts((prev) =>
          prev.map((s) => (s.id === social.id ? { ...s, scheduled_date } : s)),
        );
        await fetch(`/api/admin/social-posts/${social.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_date }),
        });
        return;
      }

      const post = posts.find((p) => p.id === payload.postId);
      if (!post) return;

      if (payload.postOnSourceDay) {
        const scheduled_at =
          post.status === "published"
            ? undefined
            : moveIsoToDay(post.scheduled_at, targetDay);
        const published_at =
          post.status === "published"
            ? moveIsoToDay(post.published_at, targetDay)
            : undefined;

        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== post.id) return p;
            return {
              ...p,
              ...(scheduled_at ? { scheduled_at, status: "scheduled" as const } : {}),
              ...(published_at ? { published_at } : {}),
            };
          }),
        );

        await fetch(`/api/admin/posts/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(scheduled_at ? { scheduled_at, status: "scheduled" } : {}),
            ...(published_at ? { published_at } : {}),
          }),
        });
      }

      const sourceDayDate = parseLocalDay(payload.sourceDay);
      for (const socialId of payload.connectedSocialIds) {
        const social = socialPosts.find((s) => s.id === socialId);
        if (!social || !socialOnCalendarDay(social, sourceDayDate)) continue;
        const scheduled_date = moveIsoToDay(social.scheduled_date, targetDay);
        setSocialPosts((prev) =>
          prev.map((s) => (s.id === social.id ? { ...s, scheduled_date } : s)),
        );
        await fetch(`/api/admin/social-posts/${social.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_date }),
        });
      }
    } finally {
      setRescheduling(false);
      await load();
    }
  };

  function PostChip({ post }: { post: Post }) {
    const isScheduled = postIsScheduledOnCalendar(post);
    const isPublished = post.status === "published";
    const linked = linkedSocialForPost(post.id);
    const connStatus = connectedContentStatus(post, linked);
    return (
      <button
        type="button"
        onClick={() => {
          setPreviewPost(post);
          setPreviewCalendarDay(null);
        }}
        className={`flex w-full items-center gap-1 truncate rounded border px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight ${
          isScheduled
            ? "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100"
            : isPublished
              ? "border-pine-900/20 bg-white text-pine-900 hover:bg-pine-50"
              : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        {isScheduled ? (
          <CalendarClock className="h-2.5 w-2.5 shrink-0 text-amber-700" />
        ) : isPublished ? (
          <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-pine-900" />
        ) : null}
        <span className="truncate">{post.title || "Untitled"}</span>
        {post.status === "published" && connStatus === "pending" && (
          <span title="Connected content pending" className="shrink-0">
            <Link2 className="h-2.5 w-2.5 text-gray-500" />
          </span>
        )}
        {post.status === "published" && connStatus === "done" && (
          <span title="All connected content posted" className="shrink-0">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
          </span>
        )}
      </button>
    );
  }

  function SocialChip({
    sp,
    connected,
    nested,
    sourceDay,
    draggable = false,
    isDragging,
  }: {
    sp: SocialPost;
    connected?: boolean;
    nested?: boolean;
    sourceDay?: string;
    draggable?: boolean;
    isDragging?: boolean;
  }) {
    const info = platformInfo(sp.platform);
    const isPosted = !!sp.posted_at;
    return (
      <button
        type="button"
        draggable={draggable && !isPosted}
        onDragStart={(e) => {
          if (!draggable || !sourceDay || isPosted) return;
          e.stopPropagation();
          beginCalendarDrag(e, sp.id);
          setDragPayload({ kind: "social", socialId: sp.id, sourceDay });
        }}
        onDragEnd={clearDragState}
        onClick={() => { setActiveSocial(sp); setPanelMode("view-social"); }}
        className={`flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${
          isPosted
            ? "bg-gray-100 text-gray-500 hover:bg-gray-100"
            : platformChipClasses(sp.platform)
        } ${nested ? "ml-2" : ""} ${draggable && !isPosted ? "cursor-grab active:cursor-grabbing" : ""} ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <info.Icon className="h-2.5 w-2.5 shrink-0" />
        {connected && <Link2 className="h-2 w-2 shrink-0 opacity-50" />}
        {isPosted && <CheckCircle2 className="h-2 w-2 shrink-0" />}
        <span className="truncate">{sp.title}</span>
      </button>
    );
  }

  function DayCell({ day, minimal }: { day: Date; minimal?: boolean }) {
    const isToday = isSameDay(day, today);
    const { groups, standaloneSocial } = buildDayCalendarGroups(day, posts, socialPosts);
    const ds = toDateStr(day);
    const isDropTarget = dropTargetDay === ds && !!draggingPayload;

    return (
      <div
        className={`group relative ${minimal ? "min-h-[200px]" : "min-h-[120px]"} p-2.5 transition-colors ${
          isDropTarget ? "bg-gray-100 ring-2 ring-inset ring-gray-400" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (draggingPayloadRef.current) setDropTargetDay(ds);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDropTargetDay((prev) => (prev === ds ? null : prev));
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          const payload = draggingPayloadRef.current;
          clearDragState();
          if (payload) void rescheduleToDay(payload, ds);
        }}
      >
        <div className="flex items-center justify-between">
          <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${isToday ? "bg-pine-900 text-white" : "text-gray-500"}`}>
            {day.getDate()}
          </span>
          <button
            onClick={() => openNewSocial(ds)}
            className="hidden h-5 w-5 place-items-center rounded text-gray-300 hover:bg-gray-100 hover:text-gray-600 group-hover:grid"
            title="Add social post"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-1.5 space-y-1">
          {groups.map((group) => (
            <CalendarBlogGroupCard
              key={`${group.post.id}-${ds}`}
              group={group}
              minimal={minimal}
              sourceDay={ds}
              onOpen={() => {
                setPreviewPost(group.post);
                setPreviewCalendarDay(ds);
              }}
              onDragStart={setDragPayload}
              onDragEnd={clearDragState}
              onDragConnectedStart={(socialId, sourceDay) =>
                setDragPayload({ kind: "social", socialId, sourceDay })
              }
              isDragging={
                draggingPayload?.kind === "post-group" && draggingPayload.postId === group.post.id
              }
            />
          ))}
          {standaloneSocial.map((s) => (
            <SocialChip
              key={s.id}
              sp={s}
              sourceDay={ds}
              draggable
              isDragging={draggingPayload?.kind === "social" && draggingPayload.socialId === s.id}
            />
          ))}
        </div>
      </div>
    );
  }

  const panelOpen = panelMode !== "none";

  const closePanel = () => setPanelMode("none");

  return (
    <div className="min-h-full bg-white">
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="border-b border-pine-900/8 bg-white px-4 py-5 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-muted">
              Schedule content and see when it goes live. Published posts sit on their publish day; scheduled posts on their go-live day. Drag to reschedule.
            </p>
            <div className="flex shrink-0 overflow-hidden rounded-xl border border-pine-900/12 text-sm font-semibold">
              <button type="button" onClick={() => setView("month")} className={`px-4 py-2 ${view === "month" ? "bg-pine-900 text-white" : "bg-white text-muted hover:bg-pine-50"}`}>Month</button>
              <button type="button" onClick={() => setView("week")} className={`px-4 py-2 ${view === "week" ? "bg-pine-900 text-white" : "bg-white text-muted hover:bg-pine-50"}`}>Week</button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 md:px-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-start">
            <div className="order-2 lg:order-1 lg:sticky lg:top-4 lg:max-h-[calc(100vh-5rem)]">
              <SchedulingPanel
                publishedConnectedGroups={publishedConnectedGroups}
                draftConnectedGroups={draftConnectedGroups}
                noConnectedGroups={noConnectedGroups}
                onSelectPost={(post) => {
                  setPreviewPost(post);
                  setPreviewCalendarDay(null);
                }}
              />
            </div>

            <div className="order-1 min-w-0 lg:order-2">
          {/* Nav */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={view === "month" ? prevMonth : prevWeek} className="grid h-9 w-9 place-items-center rounded-xl border border-pine-900/12 bg-white text-muted hover:bg-pine-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[11rem] text-center text-base font-semibold text-pine-900">
              {view === "month"
                ? `${MONTHS[month]} ${year}`
                : `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`}
            </h2>
            <button type="button" onClick={view === "month" ? nextMonth : nextWeek} className="grid h-9 w-9 place-items-center rounded-xl border border-pine-900/12 bg-white text-muted hover:bg-pine-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setWeekAnchor(today); }}
              className="ml-1 rounded-xl border border-pine-900/12 bg-white px-3 py-2 text-sm font-semibold text-pine-900 hover:bg-pine-50">
              Today
            </button>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-pine-900/15 bg-white px-4 py-6 text-center text-sm text-pine-900">
              Could not load posts: {loadError}
            </div>
          ) : loading ? (
            <div className="py-20 text-center text-sm text-muted">Loading…</div>
          ) : view === "month" ? (
            <div className="overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-sm">
              <div className="grid grid-cols-7 border-b border-pine-900/8 bg-white">
                {DAYS.map((d) => (
                  <div key={d} className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted md:px-3">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 divide-x divide-y divide-pine-900/8">
                {monthDays.map((day, i) => (
                  <div key={i} className={`overflow-hidden${!day ? " min-h-[100px] bg-white" : ""}`}>
                    {day && <DayCell day={day} />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-pine-900/10 bg-white shadow-sm">
              <div className="grid grid-cols-7 divide-x divide-pine-900/8">
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div key={day.toISOString()} className="min-h-[360px] overflow-hidden">
                      <div className={`border-b border-pine-900/8 px-2 py-3 text-center md:px-3 ${isToday ? "bg-pine-900" : "bg-white"}`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isToday ? "text-paper/70" : "text-muted"}`}>
                          {DAYS[(day.getDay() + 6) % 7]}
                        </p>
                        <p className={`mt-0.5 text-xl font-semibold ${isToday ? "text-paper" : "text-pine-900"}`}>{day.getDate()}</p>
                      </div>
                      <DayCell day={day} minimal />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend — matches chips on the grid */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border border-pine-900/15 border-l-[3px] border-l-pine-900 bg-white" />
              Published blog
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border border-pine-900/10 border-l-[3px] border-l-amber-500 bg-amber-50" />
              Scheduled blog
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0077b5]/15" /> LinkedIn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-pink-100" /> Instagram
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-100" /> Facebook
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gray-200" /> X
            </span>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="/admin/posts/new"
                className="flex items-center gap-1.5 rounded-md border border-[#122428] px-3 py-1.5 text-xs font-semibold text-[#122428] hover:bg-[#122428]/5"
              >
                <FileText className="h-3.5 w-3.5" /> New blog post
              </a>
              <button onClick={() => openNewSocial(toDateStr(today))}
                className="flex items-center gap-1.5 rounded-md bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> Add social post
              </button>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {panelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closePanel}
          role="presentation"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {panelMode === "view-social" && activeSocial ? (
              <SocialPostDetail
                post={activeSocial}
                onClose={closePanel}
                onDelete={() => deleteSocial(activeSocial.id)}
                onEdit={() => setPanelMode("edit-social")}
                onMarkPosted={() => markSocialPosted(activeSocial)}
                markingPosted={markingSocialPosted}
              />
            ) : (panelMode === "new-social" || panelMode === "edit-social") ? (
              <SocialPostForm
                key={panelMode + (activeSocial?.id ?? "")}
                initial={panelMode === "edit-social" ? activeSocial ?? undefined : undefined}
                defaultDate={panelDate}
                onSave={saveSocial}
                onCancel={closePanel}
              />
            ) : null}
          </div>
        </div>
      )}

      {previewPost ? (
        <CalendarItemPreviewModal
          post={previewPost}
          linkedSocial={linkedSocialForPost(previewPost.id)}
          calendarDay={previewCalendarDay ?? undefined}
          busy={connectedBusy}
          onClose={() => {
            setPreviewPost(null);
            setPreviewCalendarDay(null);
          }}
          onDeleteAll={deleteAllFromPreview}
          onMarkConnectedPosted={markConnectedFromPreview}
        />
      ) : null}
    </div>
  );
}
