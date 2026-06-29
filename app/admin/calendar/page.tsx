"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarItemPreviewModal } from "@/components/admin/CalendarItemPreviewModal";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Facebook,
  FileText,
  Instagram,
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

// Parse an ISO date/datetime string into a LOCAL Date so timezone offsets never
// shift the calendar day. "2025-07-15T09:00:00Z" → local July 15, not July 14.
function parseLocalDay(isoStr: string): Date {
  const datePart = isoStr.slice(0, 10); // "YYYY-MM-DD"
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
        </div>

        {/* Scheduled date */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            Publish date <span className="text-red-500">*</span>
          </label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
        </div>

        {/* Content / written post */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Written post content</label>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the full post copy here…"
            className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
          <p className="mt-1 text-[10px] text-gray-400">{content.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Link */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Link (optional)</label>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#063b32]" />
        </div>
      </div>

      <div className="border-t border-gray-100 p-6">
        <button type="submit" disabled={saving || !title || !date}
          className="w-full rounded-md bg-[#063b32] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
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
}: {
  post: SocialPost;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const info = platformInfo(post.platform);
  const [copied, setCopied] = useState(false);

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
            <p className={`text-xs font-semibold ${info.text}`}>{info.label}</p>
          </div>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Publish date</p>
            <p className="mt-1 font-medium text-gray-800">
              {new Date(post.scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
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
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-[#063b32] hover:bg-[#f7f4ea]"
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

      <div className="flex gap-2 border-t border-gray-100 p-6">
        <button onClick={onEdit} className="flex-1 rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Edit
        </button>
        <button onClick={onDelete} className="rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
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

  const load = useCallback(async () => {
    setLoading(true);
    const [postsRes, socialRes] = await Promise.all([
      fetch("/api/admin/posts").then((r) => r.json() as Promise<{ data: Post[] }>),
      fetch("/api/admin/social-posts").then((r) => r.json() as Promise<{ data: SocialPost[] }>),
    ]);
    setPosts(postsRes.data ?? []);
    setSocialPosts(socialRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function postsOnDay(day: Date) {
    return posts.filter((p) => {
      if (p.status === "draft") return false;
      // scheduled_at is a full UTC ISO timestamp — use new Date() so local
      // getters (.getDate etc.) return the correct local calendar day.
      // Fall back to updated_at for older scheduled posts that lack scheduled_at.
      const dateStr = p.status === "published"
        ? (p.published_at ?? p.updated_at)
        : (p.scheduled_at ?? p.updated_at);
      if (!dateStr) return false;
      return isSameDay(new Date(dateStr), day);
    });
  }

  function socialOnDay(day: Date) {
    return socialPosts.filter((s) => {
      if (s.link?.startsWith("/admin/posts/")) return false;
      return isSameDay(parseLocalDay(s.scheduled_date), day);
    });
  }

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

  const deleteSocial = async (id: string) => {
    if (!confirm("Delete this social post?")) return;
    await fetch(`/api/admin/social-posts/${id}`, { method: "DELETE" });
    setPanelMode("none");
    load();
  };

  function PostChip({ post }: { post: Post }) {
    const isScheduled = post.status === "scheduled";
    return (
      <button
        type="button"
        onClick={() => setPreviewPost(post)}
        className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight ${
          post.status === "published"
            ? "bg-[#063b32]/10 text-[#063b32] hover:bg-[#063b32]/20"
            : isScheduled
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
            : "bg-[#f5f274]/60 text-[#6f6b62] hover:bg-[#f5f274]"
        }`}
      >
        {isScheduled && <span className="shrink-0">⏰</span>}
        <span className="truncate">{post.title || "Untitled"}</span>
      </button>
    );
  }

  function SocialChip({ sp }: { sp: SocialPost }) {
    const info = platformInfo(sp.platform);
    return (
      <button
        onClick={() => { setActiveSocial(sp); setPanelMode("view-social"); }}
        className={`flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight border ${info.bg} ${info.text} hover:opacity-80 border-transparent`}
      >
        <info.Icon className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{sp.title}</span>
      </button>
    );
  }

  function DayCell({ day, minimal }: { day: Date; minimal?: boolean }) {
    const isToday = isSameDay(day, today);
    const dayPosts = postsOnDay(day);
    const daySocial = socialOnDay(day);
    const ds = toDateStr(day);

    return (
      <div className={`group relative ${minimal ? "min-h-[200px]" : "min-h-[120px]"} p-2.5`}>
        <div className="flex items-center justify-between">
          <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${isToday ? "bg-[#063b32] text-white" : "text-gray-500"}`}>
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
          {dayPosts.map((p) => <PostChip key={p.id} post={p} />)}
          {daySocial.map((s) => <SocialChip key={s.id} sp={s} />)}
        </div>
      </div>
    );
  }

  const panelOpen = panelMode !== "none";

  const closePanel = () => setPanelMode("none");

  return (
    <div className="min-h-screen bg-white">
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI Studio</p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900">Content Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-md border border-gray-200 text-sm font-semibold">
                <button onClick={() => setView("month")} className={`px-4 py-2 ${view === "month" ? "bg-[#063b32] text-white" : "text-gray-500 hover:bg-gray-50"}`}>Month</button>
                <button onClick={() => setView("week")} className={`px-4 py-2 ${view === "week" ? "bg-[#063b32] text-white" : "text-gray-500 hover:bg-gray-50"}`}>Week</button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Nav */}
          <div className="mb-5 flex items-center gap-3">
            <button onClick={view === "month" ? prevMonth : prevWeek} className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[200px] text-center text-base font-semibold text-gray-900">
              {view === "month"
                ? `${MONTHS[month]} ${year}`
                : `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`}
            </h2>
            <button onClick={view === "month" ? nextMonth : nextWeek} className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setWeekAnchor(today); }}
              className="ml-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">
              Today
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">Loading…</div>
          ) : view === "month" ? (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((d) => (
                  <div key={d} className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                {monthDays.map((day, i) => (
                  <div key={i} className={`overflow-hidden${!day ? " bg-gray-50/50 min-h-[110px]" : ""}`}>
                    {day && <DayCell day={day} />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="grid grid-cols-7 divide-x divide-gray-100">
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div key={day.toISOString()} className="min-h-[380px] overflow-hidden">
                      <div className={`border-b border-gray-100 px-3 py-3 text-center ${isToday ? "bg-[#063b32]" : ""}`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isToday ? "text-[#f5f274]" : "text-gray-400"}`}>
                          {DAYS[(day.getDay() + 6) % 7]}
                        </p>
                        <p className={`mt-0.5 text-xl font-semibold ${isToday ? "text-white" : "text-gray-900"}`}>{day.getDate()}</p>
                      </div>
                      <DayCell day={day} minimal />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#063b32]/20" /> Blog — published</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-100" /> Blog — scheduled</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0077b5]/15" /> LinkedIn</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-pink-100" /> Instagram</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-100" /> Facebook</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gray-200" /> X</span>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="/admin/posts/new"
                className="flex items-center gap-1.5 rounded-md border border-[#063b32] px-3 py-1.5 text-xs font-semibold text-[#063b32] hover:bg-[#063b32]/5"
              >
                <FileText className="h-3.5 w-3.5" /> New blog post
              </a>
              <button onClick={() => openNewSocial(toDateStr(today))}
                className="flex items-center gap-1.5 rounded-md bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> Add social post
              </button>
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
          onClose={() => setPreviewPost(null)}
        />
      ) : null}
    </div>
  );
}
