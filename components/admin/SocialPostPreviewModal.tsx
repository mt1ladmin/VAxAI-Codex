"use client";

import { Check, Copy, ExternalLink, Facebook, Instagram, Linkedin, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "share";

export type SocialPostPreview = {
  id: string;
  title: string;
  platform: SocialPlatform;
  content: string;
  scheduled_date?: string | null;
  description?: string | null;
  link?: string | null;
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
  share: {
    label: "Share text",
    Icon: Share2,
    style: "text-[#063b32] bg-[#063b32]/10",
    openUrl: null,
  },
} satisfies Record<SocialPlatform, { label: string; Icon: typeof Linkedin; style: string; openUrl: string | null }>;

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
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-lg border border-[#111111]/10 p-3 text-left transition-colors hover:border-[#063b32]/25 hover:bg-[#f7f4ea]/40"
    >
      <div className="flex items-center gap-2">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${meta.style}`}>
          <meta.Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#111111]">{social.title}</span>
        <span className="shrink-0 text-[10px] text-[#6f6b62]">{formatShortDate(social.scheduled_date) || "Draft"}</span>
      </div>
      {(social.content || social.description) && (
        <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-[#6f6b62]">
          {social.content || social.description}
        </p>
      )}
      <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold ${meta.style.split(" ")[0]}`}>
        Open {meta.label}
        <ExternalLink className="h-3 w-3" />
      </span>
    </button>
  );
}

export function SocialPostPreviewModal({
  social,
  onClose,
}: {
  social: SocialPostPreview;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const meta = PLATFORM_META[social.platform];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const copy = async () => {
    await navigator.clipboard.writeText(social.content || social.description || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onClick={onClose} role="presentation">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#111111]/10 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`social-preview-${social.id}`}
      >
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.style}`}>
              <meta.Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p id={`social-preview-${social.id}`} className="truncate text-sm font-semibold text-[#111111]">{social.title}</p>
              <p className={`text-xs font-semibold ${meta.style.split(" ")[0]}`}>
                {meta.label}{formatShortDate(social.scheduled_date) ? ` · ${formatShortDate(social.scheduled_date)}` : " · Draft"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]" aria-label="Close social post">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {social.description && <p className="mb-4 text-sm text-[#6f6b62]">{social.description}</p>}
          <div className="rounded-xl bg-[#f7f4ea] p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#111111]">{social.content || "No copy has been added yet."}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#111111]/10 px-5 py-4">
          <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold text-[#6f6b62] hover:bg-[#f7f4ea]">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy text"}
          </button>
          {meta.openUrl && (
            <a href={meta.openUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 rounded-lg border border-[#111111]/15 px-3 py-2 text-xs font-semibold hover:opacity-80 ${meta.style}`}>
              <meta.Icon className="h-3.5 w-3.5" />
              Open {meta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
