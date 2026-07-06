"use client";

import Link from "next/link";
import { ExternalLink, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
};

type SocialPost = SocialPostPreview & { scheduled_date: string };

type Props = {
  post: CalendarBlogPreview;
  linkedSocial?: SocialPost[];
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

function socialLinksToPost(link: string | null | undefined, postId: string) {
  if (!link) return false;
  return link.includes(`/admin/posts/${postId}`);
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

export function CalendarItemPreviewModal({ post, linkedSocial: linkedSocialProp, onClose, onDelete }: Props) {
  const [linkedSocial, setLinkedSocial] = useState<SocialPost[]>(linkedSocialProp ?? []);
  const [activeSocial, setActiveSocial] = useState<SocialPost | null>(null);
  const [fullPost, setFullPost] = useState<CalendarBlogPreview | null>(null);

  useEffect(() => {
    if (linkedSocialProp) {
      setLinkedSocial(linkedSocialProp);
      return;
    }
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
  }, [post.id, linkedSocialProp]);

  const displayPost = fullPost ?? post;

  const allLinkedSocial = useMemo(() => {
    const fromTable = linkedSocial;
    const platforms = new Set(fromTable.map((s) => s.platform));
    const inline = buildInlineSocial(displayPost, platforms);
    return [...fromTable, ...inline];
  }, [linkedSocial, displayPost]);

  const displayDate =
    displayPost.status === "published"
      ? formatDate(displayPost.published_at)
      : displayPost.status === "scheduled"
        ? formatDate(displayPost.scheduled_at)
        : formatDate(displayPost.updated_at);

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
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md text-[#6f6b62] hover:bg-[#f7f4ea]"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>

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
          <div className="flex flex-wrap items-center gap-2 pr-8">
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

          {allLinkedSocial.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">
                Connected posts
              </p>
              <div className="space-y-2">
                {allLinkedSocial.map((s) => (
                  <SocialPostSummaryCard key={s.id} social={s} onOpen={() => setActiveSocial(s)} />
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