"use client";

import { Check, Copy, Facebook, Instagram, Linkedin, Loader2, Pencil, Save, Share2, Trash2, X } from "lucide-react";
import type React from "react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
import { useEffect, useState } from "react";

export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "twitter" | "share";

export type SocialPostPreview = {
  id: string;
  title: string;
  platform: SocialPlatform;
  content: string;
  scheduled_date?: string | null;
  description?: string | null;
  link?: string | null;
  tags?: string[];
};

const PLATFORM_META = {
  linkedin: {
    label: "LinkedIn",
    Icon: Linkedin,
    style: "text-[#0077b5] bg-[#0077b5]/10",
    openUrl: "https://www.linkedin.com/feed/",
  },
  instagram: {
    label: "Instagram",
    Icon: Instagram,
    style: "text-pink-600 bg-pink-50",
    openUrl: "https://www.instagram.com/",
  },
  facebook: {
    label: "Facebook",
    Icon: Facebook,
    style: "text-blue-600 bg-blue-50",
    openUrl: "https://www.facebook.com/",
  },
  twitter: {
    label: "X",
    Icon: XIcon,
    style: "text-gray-900 bg-gray-100",
    openUrl: "https://x.com/i",
  },
  share: {
    label: "Share text",
    Icon: Share2,
    style: "text-[#122428] bg-[#122428]/10",
    openUrl: null,
  },
} satisfies Record<SocialPlatform, { label: string; Icon: React.FC<{ className?: string }>; style: string; openUrl: string | null }>;

function formatShortDate(value?: string | null) {
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function SocialPostSummaryCard({
  social,
  onOpen,
}: {
  social: SocialPostPreview;
  onOpen: () => void;
}) {
  const meta = PLATFORM_META[social.platform];
  const [copied, setCopied] = useState(false);

  const copyText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(social.content || social.description || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[#111111]/10 p-3 transition-colors hover:border-[#122428]/25 hover:bg-white/20">
      <div className="flex items-center gap-2">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${meta.style}`}>
          <meta.Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#111111]">{social.title}</span>
        <span className="shrink-0 text-[10px] text-[#5F686A]">{formatShortDate(social.scheduled_date) || "Draft"}</span>
      </div>
      {(social.content || social.description) && (
        <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-[#5F686A]">
          {social.content || social.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-[10px] font-semibold text-[#111111] hover:bg-pine-50"
        >
          Open post
        </button>
        <button
          type="button"
          onClick={copyText}
          className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-[10px] font-semibold text-[#5F686A] hover:bg-pine-50"
        >
          {copied ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
          {copied ? "Copied!" : "Copy text"}
        </button>
        {meta.openUrl && (
          <a
            href={meta.openUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-[10px] font-semibold hover:opacity-80 ${meta.style}`}
          >
            <meta.Icon className="h-2.5 w-2.5" />
            Open {meta.label}
          </a>
        )}
      </div>
    </div>
  );
}

const EDIT_PLATFORMS: { key: SocialPlatform; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "twitter", label: "X", Icon: XIcon },
];

export function SocialPostPreviewModal({
  social,
  onClose,
  onSaved,
  onDelete,
}: {
  social: SocialPostPreview;
  onClose: () => void;
  onSaved?: (updated: SocialPostPreview) => void;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localSocial, setLocalSocial] = useState(social);
  const [editForm, setEditForm] = useState({
    title: social.title,
    platform: social.platform,
    content: social.content,
    scheduled_date: social.scheduled_date ?? "",
    link: social.link ?? "",
    tagInput: "",
    tags: social.tags ?? [],
  });
  const [saving, setSaving] = useState(false);
  const meta = PLATFORM_META[localSocial.platform];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { if (editing) setEditing(false); else onClose(); }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, editing]);

  const copy = async () => {
    await navigator.clipboard.writeText(localSocial.content || localSocial.description || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = () => {
    setEditForm({
      title: localSocial.title,
      platform: localSocial.platform,
      content: localSocial.content,
      scheduled_date: localSocial.scheduled_date ?? "",
      link: localSocial.link ?? "",
      tagInput: "",
      tags: localSocial.tags ?? [],
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editForm.title || !editForm.scheduled_date) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/social-posts/${localSocial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          platform: editForm.platform,
          content: editForm.content,
          scheduled_date: editForm.scheduled_date,
          link: editForm.link || null,
          tags: editForm.tags,
          description: localSocial.description ?? "",
        }),
      });
      const updated: SocialPostPreview = {
        ...localSocial,
        title: editForm.title,
        platform: editForm.platform,
        content: editForm.content,
        scheduled_date: editForm.scheduled_date,
        link: editForm.link || null,
        tags: editForm.tags,
      };
      setLocalSocial(updated);
      onSaved?.(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = editForm.tagInput.trim();
    if (t && !editForm.tags.includes(t)) setEditForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setEditForm((f) => ({ ...f, tagInput: "" }));
  };

  const inputCls = "w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#122428]";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onClick={editing ? undefined : onClose} role="presentation">
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#111111]/10 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`social-preview-${localSocial.id}`}
      >
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.style}`}>
              <meta.Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p id={`social-preview-${localSocial.id}`} className="truncate text-sm font-semibold text-[#111111]">{localSocial.title}</p>
              <p className={`text-xs font-semibold ${meta.style.split(" ")[0]}`}>
                {meta.label}{formatShortDate(localSocial.scheduled_date) ? ` · ${formatShortDate(localSocial.scheduled_date)}` : " · Draft"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[#5F686A] hover:bg-pine-50" aria-label="Close social post">
            <X className="h-4 w-4" />
          </button>
        </div>

        {editing ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {/* Platform */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Platform</label>
              <div className="flex gap-2">
                {EDIT_PLATFORMS.map((p) => {
                  const pm = PLATFORM_META[p.key];
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, platform: p.key }))}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors ${
                        editForm.platform === p.key ? `${pm.style}` : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <p.Icon className="h-4 w-4" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Post title <span className="text-red-500">*</span></label>
              <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} autoFocus />
            </div>
            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Publish date <span className="text-red-500">*</span></label>
              <input type="date" value={editForm.scheduled_date} onChange={(e) => setEditForm((f) => ({ ...f, scheduled_date: e.target.value }))} className={inputCls} />
            </div>
            {/* Content */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Written post content</label>
              <textarea rows={6} value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Paste the full post copy here…" className={`${inputCls} resize-y`} />
              <p className="mt-1 text-[10px] text-gray-400">{editForm.content.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-gray-200 bg-gray-50 p-2">
                {editForm.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-800 shadow-sm">
                    {t}
                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} className="text-gray-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={editForm.tagInput}
                  onChange={(e) => setEditForm((f) => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder={editForm.tags.length === 0 ? "Add tags…" : ""}
                  className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Press Enter or comma to add.</p>
            </div>
            {/* Link */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Link (optional)</label>
              <input type="url" value={editForm.link} onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://…" className={inputCls} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Publish date */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Publish date</p>
              <p className="mt-1 font-medium text-gray-800">
                {localSocial.scheduled_date
                  ? new Date(`${localSocial.scheduled_date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                  : "Not scheduled"}
              </p>
            </div>

            {/* Post copy */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Post copy</p>
              <div className="rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                {localSocial.content || "No copy has been added yet."}
              </div>
            </div>

            {/* Post to platform */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Post to platform</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void copy()} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy post text"}
                </button>
                {meta.openUrl && (
                  <a href={meta.openUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold hover:opacity-80 ${meta.style}`}>
                    <meta.Icon className="h-3.5 w-3.5" />
                    Open {meta.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          {editing ? (
            <>
              <button type="button" onClick={() => void saveEdit()} disabled={saving || !editForm.title || !editForm.scheduled_date}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#122428] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#5F686A] hover:bg-pine-50">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={startEdit}
                className="flex-1 rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Edit
              </button>
              {onDelete && (
                <button type="button" onClick={onDelete}
                  className="rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
