"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

type ContentType = "blog" | "linkedin" | "instagram" | "facebook" | "all";

type BlogResult = {
  title: string;
  seo_description: string;
  body_html: string;
  sharing_caption: string;
  hashtags: string[];
};

type AllResult = {
  title: string;
  seo_description: string;
  body_html: string;
  sharing_caption: string;
  linkedin_post: string;
  instagram_caption: string;
  facebook_post: string;
  hashtags: string[];
};

type LinkedInResult = {
  post_text: string;
  hashtags: string[];
};

type InstagramResult = {
  caption: string;
  hashtags: string[];
};

type FacebookResult = {
  post_text: string;
  hashtags: string[];
};

type GeneratedResult = BlogResult | AllResult | LinkedInResult | InstagramResult | FacebookResult;

const STREAM_ERROR_MARKER = "__VAXAI_STREAM_ERROR__";

/**
 * Best-effort parse of a partially streamed JSON object so fields can be
 * previewed live. Closes any open string and unbalanced braces/brackets,
 * then attempts JSON.parse; returns null when nothing parseable yet.
 */
function tryParsePartial(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;
  const s = raw.slice(start);
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    /* fall through to repair */
  }

  let inString = false;
  let escape = false;
  const stack: string[] = [];
  for (const ch of s) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") stack.push("}");
      else if (ch === "[") stack.push("]");
      else if (ch === "}" || ch === "]") stack.pop();
    }
  }

  let repaired = s;
  if (escape) repaired = repaired.slice(0, -1);
  if (inString) repaired += '"';
  repaired = repaired.replace(/,\s*$/, "");
  if (repaired.trimEnd().endsWith(":")) repaired = `${repaired.trimEnd()}null`;
  for (let i = stack.length - 1; i >= 0; i--) repaired += stack[i];

  try {
    return JSON.parse(repaired) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** House-style cleanup: no em dashes, VAxAI always present in the tags. */
function postProcess(result: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      cleaned[key] = value.replace(/\s*—\s*/g, ", ");
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map((v) => (typeof v === "string" ? v.replace(/\s*—\s*/g, ", ") : v));
    } else {
      cleaned[key] = value;
    }
  }
  if (Array.isArray(cleaned.hashtags)) {
    const tags = (cleaned.hashtags as string[]).map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
    if (!tags.some((t) => t.toLowerCase() === "vaxai")) tags.unshift("VAxAI");
    cleaned.hashtags = tags;
  }
  return cleaned;
}

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="flex items-center bg-white px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F686A]">{label}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

const taClass =
  "w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#122428] resize-y leading-relaxed";
const inputClass =
  "w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#122428]";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "blog", label: "Blog Post" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "instagram", label: "Instagram Post" },
  { value: "facebook", label: "Facebook Post" },
  { value: "all", label: "All (Blog + Social)" },
];

const PLACEHOLDERS: Record<ContentType, string> = {
  blog: "Describe the topic — e.g. 'Why clearing an admin backlog is usually the first step before a charity can get value from AI'",
  linkedin:
    "Describe the message — e.g. 'AI projects rarely fail because of the technology. They fail because the information underneath was never organised.'",
  instagram:
    "Describe the idea — e.g. 'One shared drive tip that makes every future tool work better'",
  facebook:
    "Describe the idea — e.g. 'The relief of finally clearing the filing backlog everyone has been avoiding'",
  all: "Describe the topic — e.g. 'Why clearing an admin backlog is usually the first step before a charity can get value from AI'",
};

export function ContentCreateModal({
  open,
  onClose,
  initialBrief = "",
  topicIds = [],
  onTopicsConsumed,
}: {
  open: boolean;
  onClose: () => void;
  /** Optional brief from the topic library (does not change generate API). */
  initialBrief?: string;
  /** Topic library ids used for this brief — archived after a successful generate. */
  topicIds?: string[];
  onTopicsConsumed?: (ids: string[]) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  // Editable draft state — typed via contentType at render time
  const [editableResult, setEditableResult] = useState<GeneratedResult | null>(null);
  const [hashtagsInput, setHashtagsInput] = useState("");

  // Actions
  const [converting, setConverting] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduledSocial, setScheduledSocial] = useState(false);

  const reset = () => {
    setStep("form");
    setBrief("");
    setEditableResult(null);
    setHashtagsInput("");
    setError("");
    setContentType("blog");
    setScheduleDate("");
    setScheduledSocial(false);
    setStreaming(false);
  };

  useEffect(() => {
    if (open && initialBrief.trim()) {
      setBrief(initialBrief);
      setStep("form");
      setError("");
    }
  }, [open, initialBrief]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const generate = async () => {
    setGenerating(true);
    setStreaming(true);
    setError("");
    setEditableResult(null);
    setHashtagsInput("");
    try {
      const res = await fetch("/api/admin/engagement/content-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, brief }),
      });
      if (!res.ok || !res.body) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Generation failed");
      }

      // Stream the draft in and preview fields as they arrive
      setStep("preview");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      let lastPreview = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const now = Date.now();
        if (now - lastPreview > 150) {
          lastPreview = now;
          const partial = tryParsePartial(raw);
          if (partial) setEditableResult(partial as GeneratedResult);
        }
      }
      raw += decoder.decode();

      const errIndex = raw.indexOf(STREAM_ERROR_MARKER);
      if (errIndex !== -1) {
        throw new Error(raw.slice(errIndex + STREAM_ERROR_MARKER.length) || "Generation failed");
      }

      const jsonStart = raw.indexOf("{");
      if (jsonStart === -1) throw new Error("AI did not return valid JSON");
      const data = postProcess(JSON.parse(raw.slice(jsonStart)) as Record<string, unknown>);
      setEditableResult(data as GeneratedResult);
      if (Array.isArray(data.hashtags)) {
        setHashtagsInput((data.hashtags as string[]).join(", "));
      }
      // Archive library topics so the same idea is not offered again
      if (topicIds.length) {
        void fetch("/api/admin/content-topics", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: topicIds, action: "use" }),
        }).then(() => onTopicsConsumed?.(topicIds));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("form");
    } finally {
      setGenerating(false);
      setStreaming(false);
    }
  };

  const currentHashtags = hashtagsInput
    .split(",")
    .map((h) => h.trim().replace(/^#/, ""))
    .filter(Boolean);

  const hashtagString = currentHashtags.map((h) => `#${h}`).join(" ");

  const defaultTitle =
    editableResult && "title" in editableResult && (editableResult as BlogResult).title
      ? (editableResult as BlogResult).title
      : brief.slice(0, 80);

  // Create a blog/all draft post and navigate to post editor
  const convertToDraftPost = async () => {
    if (!editableResult) return;
    const blog = editableResult as BlogResult | AllResult;
    setConverting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          description: blog.seo_description,
          body_html: blog.body_html,
          content_type: "Article",
          tags: currentHashtags,
          status: "draft",
          sharing_caption: blog.sharing_caption,
          social_hashtags: currentHashtags,
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create post");
      const postId = json.data.id;

      onClose();
      router.push(`/admin/posts/${postId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setConverting(false);
    }
  };

  // For "all" type: schedule the social posts then create draft post
  const saveAll = async () => {
    if (!editableResult) return;
    const all = editableResult as AllResult;
    setConverting(true);
    setError("");
    try {
      // Create draft post
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: all.title,
          description: all.seo_description,
          body_html: all.body_html,
          content_type: "Article",
          tags: currentHashtags,
          status: "draft",
          sharing_caption: all.sharing_caption,
          linkedin_post: all.linkedin_post,
          instagram_caption: all.instagram_caption,
          social_hashtags: currentHashtags,
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create post");
      const postId = json.data.id;

      // Schedule social posts if date is set
      if (scheduleDate) {
        setScheduling(true);
        const socials: { platform: string; content: string }[] = [
          { platform: "linkedin", content: all.linkedin_post },
          { platform: "instagram", content: all.instagram_caption },
        ];
        if (all.facebook_post) {
          socials.push({ platform: "facebook", content: all.facebook_post });
        }
        await Promise.all(
          socials.map(({ platform, content }) =>
            fetch("/api/admin/social-posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `${defaultTitle} — ${platform.charAt(0).toUpperCase()}${platform.slice(1)}`,
                platform,
                content: `${content}\n\n${hashtagString}`,
                scheduled_date: scheduleDate,
                link: `/admin/posts/${postId}`,
              }),
            }),
          ),
        );
        setScheduling(false);
        setScheduledSocial(true);
      }

      onClose();
      router.push(`/admin/posts/${postId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setConverting(false);
      setScheduling(false);
    }
  };

  // For individual linkedin/instagram/facebook types — schedule single platform
  const [singleScheduleDate, setSingleScheduleDate] = useState("");
  const [singleSaved, setSingleSaved] = useState(false);
  const [singleSaving, setSingleSaving] = useState(false);

  const saveSingleToCalendar = async () => {
    if (!singleScheduleDate || !editableResult) return;
    setSingleSaving(true);
    const text =
      contentType === "instagram"
        ? (editableResult as InstagramResult).caption
        : (editableResult as LinkedInResult | FacebookResult).post_text;
    const label = CONTENT_TYPES.find((t) => t.value === contentType)?.label ?? contentType;
    await fetch("/api/admin/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${brief.slice(0, 80)} — ${label.replace(" Post", "")}`,
        platform: contentType,
        content: `${text}\n\n${hashtagString}`,
        scheduled_date: singleScheduleDate,
      }),
    });
    setSingleSaving(false);
    setSingleSaved(true);
  };

  if (!open) return null;

  const blog = editableResult as BlogResult | null;
  const all = editableResult as AllResult | null;
  const li = editableResult as LinkedInResult | null;
  const ig = editableResult as InstagramResult | null;
  const fb = editableResult as FacebookResult | null;

  const isBlogLike = contentType === "blog" || contentType === "all";
  const isSingleSocial =
    contentType === "linkedin" || contentType === "instagram" || contentType === "facebook";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[min(92dvh,100%)] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">
              {step === "form"
                ? "Create content with AI"
                : streaming
                  ? `${CONTENT_TYPES.find((t) => t.value === contentType)?.label} — Writing…`
                  : `${CONTENT_TYPES.find((t) => t.value === contentType)?.label} — Edit & Save`}
            </h2>
            {step === "preview" && (
              <p className="text-xs text-[#5F686A] mt-0.5">
                {streaming
                  ? "The draft is streaming in — fields fill as they are written"
                  : "Edit the AI draft below, then save or schedule"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-pine-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "form" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setContentType(t.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      contentType === t.value
                        ? "bg-[#122428] text-white"
                        : "border border-[#111111]/15 text-[#5F686A] hover:border-[#122428]/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#5F686A]">
                  Brief / topic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={5}
                  placeholder={PLACEHOLDERS[contentType]}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#122428] resize-y"
                />
              </div>

              <p className="text-xs text-[#5F686A]">
                Every piece is written to VAxAI&apos;s positioning: strong administrative foundations
                first, AI and automation second. The AI knows the four service areas, the audiences and
                each platform&apos;s purpose, keeps examples honest, and closes with a call to action
                tailored to the topic.
              </p>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Blog / All — blog fields */}
              {isBlogLike && blog && (
                <>
                  <EditSection label="Title">
                    <input
                      value={blog.title ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                      }
                      readOnly={streaming}
                      className={inputClass}
                    />
                  </EditSection>

                  <EditSection label="SEO Description">
                    <textarea
                      value={blog.seo_description ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, seo_description: e.target.value } : prev,
                        )
                      }
                      readOnly={streaming}
                      rows={2}
                      className={taClass}
                    />
                    <p className="mt-1 text-[10px] text-[#5F686A]">{(blog.seo_description ?? "").length} / 160 chars</p>
                  </EditSection>

                  <EditSection label="Blog post body">
                    <div
                      className="prose prose-sm max-w-none text-[#111111] max-h-48 overflow-y-auto text-sm [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: blog.body_html ?? "" }}
                    />
                    <p className="mt-2 text-[10px] text-[#5F686A]">
                      Body is fully editable in the post editor after saving.
                    </p>
                  </EditSection>

                  <EditSection label="Sharing caption">
                    <textarea
                      value={blog.sharing_caption ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, sharing_caption: e.target.value } : prev,
                        )
                      }
                      readOnly={streaming}
                      rows={3}
                      className={taClass}
                    />
                  </EditSection>
                </>
              )}

              {/* All type — social sections */}
              {contentType === "all" && all && (
                <>
                  <EditSection label="LinkedIn post">
                    <textarea
                      value={all.linkedin_post ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, linkedin_post: e.target.value } : prev,
                        )
                      }
                      readOnly={streaming}
                      rows={6}
                      className={taClass}
                    />
                  </EditSection>

                  <EditSection label="Instagram caption">
                    <textarea
                      value={all.instagram_caption ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, instagram_caption: e.target.value } : prev,
                        )
                      }
                      readOnly={streaming}
                      rows={3}
                      className={taClass}
                    />
                  </EditSection>

                  <EditSection label="Facebook post">
                    <textarea
                      value={all.facebook_post ?? ""}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, facebook_post: e.target.value } : prev,
                        )
                      }
                      readOnly={streaming}
                      rows={4}
                      className={taClass}
                    />
                  </EditSection>
                </>
              )}

              {/* LinkedIn only */}
              {contentType === "linkedin" && li && (
                <EditSection label="LinkedIn post">
                  <textarea
                    value={li.post_text ?? ""}
                    onChange={(e) =>
                      setEditableResult((prev) => (prev ? { ...prev, post_text: e.target.value } : prev))
                    }
                    readOnly={streaming}
                    rows={8}
                    className={taClass}
                  />
                </EditSection>
              )}

              {/* Instagram only */}
              {contentType === "instagram" && ig && (
                <EditSection label="Instagram caption">
                  <textarea
                    value={ig.caption ?? ""}
                    onChange={(e) =>
                      setEditableResult((prev) => (prev ? { ...prev, caption: e.target.value } : prev))
                    }
                    readOnly={streaming}
                    rows={5}
                    className={taClass}
                  />
                </EditSection>
              )}

              {/* Facebook only */}
              {contentType === "facebook" && fb && (
                <EditSection label="Facebook post">
                  <textarea
                    value={fb.post_text ?? ""}
                    onChange={(e) =>
                      setEditableResult((prev) => (prev ? { ...prev, post_text: e.target.value } : prev))
                    }
                    readOnly={streaming}
                    rows={6}
                    className={taClass}
                  />
                </EditSection>
              )}

              {/* Hashtags — shared across all versions */}
              {!streaming && (
                <EditSection label="Hashtags (added to all versions)">
                  <input
                    value={hashtagsInput}
                    onChange={(e) => setHashtagsInput(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className={inputClass}
                  />
                  <p className="mt-1 text-[10px] text-[#5F686A]">Comma-separated — no # needed.</p>
                </EditSection>
              )}

              {/* Single social — schedule */}
              {isSingleSocial && !streaming && (
                <EditSection label="Schedule to calendar">
                  {singleSaved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Saved to calendar
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={singleScheduleDate}
                        onChange={(e) => setSingleScheduleDate(e.target.value)}
                        className="rounded-md border border-[#111111]/15 px-2 py-1.5 text-sm outline-none focus:border-[#122428]"
                      />
                      <button
                        type="button"
                        disabled={!singleScheduleDate || singleSaving}
                        onClick={() => void saveSingleToCalendar()}
                        className="inline-flex items-center gap-1 rounded-md bg-[#122428] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
                      >
                        {singleSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                      </button>
                    </div>
                  )}
                </EditSection>
              )}

              {/* All type — single schedule date for the social posts */}
              {contentType === "all" && !streaming && (
                <EditSection label="Schedule social posts (one date for all)">
                  {scheduledSocial ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> LinkedIn, Instagram &amp; Facebook scheduled
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#5F686A]">
                        Optional — pick a date to schedule the LinkedIn, Instagram and Facebook posts at the same time.
                      </p>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="rounded-md border border-[#111111]/15 px-2 py-1.5 text-sm outline-none focus:border-[#122428]"
                      />
                    </div>
                  )}
                </EditSection>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#111111]/10 px-5 py-4">
          {step === "form" ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#5F686A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={brief.trim().length === 0 || generating}
                onClick={() => void generate()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#122428] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating…" : "Generate with AI"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={streaming}
                onClick={() => {
                  setStep("form");
                  setEditableResult(null);
                  setError("");
                  setScheduledSocial(false);
                  setSingleSaved(false);
                  setSingleScheduleDate("");
                }}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#5F686A] disabled:opacity-50"
              >
                ← Start over
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#5F686A]"
                >
                  Close
                </button>
                {contentType === "blog" && (
                  <button
                    type="button"
                    disabled={converting || streaming}
                    onClick={() => void convertToDraftPost()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#122428] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
                  >
                    {converting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save as draft post
                  </button>
                )}
                {contentType === "all" && (
                  <button
                    type="button"
                    disabled={converting || scheduling || streaming}
                    onClick={() => void saveAll()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#122428] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B343A] disabled:opacity-50"
                  >
                    {(converting || scheduling) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {scheduleDate ? "Schedule social & save post" : "Save as draft post"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
