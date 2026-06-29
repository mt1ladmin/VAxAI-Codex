"use client";

import Link from "next/link";
import { ExternalLink, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
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
};

type SocialPost = SocialPostPreview & { scheduled_date: string };

type Props = {
  post: CalendarBlogPreview;
  onClose: () => void;
  onDelete?: () => void;
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
  published: "bg-[#063b32]/10 text-[#063b32]",
  scheduled: "bg-amber-100 text-amber-800",
  draft: "bg-[#f5f274]/70 text-[#6f6b62]",
};

export function CalendarItemPreviewModal({ post, onClose, onDelete }: Props) {
  const [linkedSocial, setLinkedSocial] = useState<SocialPost[]>([]);
  const [activeSocial, setActiveSocial] = useState<SocialPost | null>(null);

  useEffect(() => {
    const path = `/admin/posts/${post.id}`;
    fetch("/api/admin/social-posts")
      .then((r) => r.json() as Promise<{ data: (SocialPost & { link?: string | null })[] }>)
      .then(({ data }) => {
        setLinkedSocial((data ?? []).filter((s) => s.link === path));
      })
      .catch(() => {});
  }, [post.id]);

  const displayDate =
    post.status === "published"
      ? formatDate(post.published_at)
      : post.status === "scheduled"
        ? formatDate(post.scheduled_at)
        : formatDate(post.updated_at);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#111111]/10 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>

        {post.cover_image_url ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-[#f7f4ea]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[post.status]}`}
            >
              {post.status}
            </span>
            {post.content_type ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6f6b62]">
                {post.content_type}
              </span>
            ) : null}
          </div>

          <h2
            id="calendar-preview-title"
            className="text-lg font-semibold text-[#111111]"
          >
            {post.title || "Untitled"}
          </h2>

          {displayDate ? (
            <p className="text-xs text-[#6f6b62]">
              {post.status === "scheduled" ? "Scheduled for " : post.status === "published" ? "Published " : "Updated "}
              {displayDate}
            </p>
          ) : null}

          {post.description ? (
            <p className="text-sm leading-relaxed text-[#6f6b62] line-clamp-4">
              {post.description}
            </p>
          ) : (
            <p className="text-sm italic text-[#6f6b62]/60">No description</p>
          )}

          {linkedSocial.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Linked social posts
              </p>
              <div className="space-y-2">
                {linkedSocial.map((s) => (
                  <SocialPostSummaryCard key={s.id} social={s} onOpen={() => setActiveSocial(s)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/posts/${post.id}`}
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
      {activeSocial && (
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
    </div>
  );
}
