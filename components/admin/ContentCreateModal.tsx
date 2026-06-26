"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";

type ContentType = "blog" | "linkedin" | "instagram" | "all";

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

type GeneratedResult = BlogResult | AllResult | LinkedInResult | InstagramResult;

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="flex items-center bg-[#f7f4ea] px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">{label}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

const taClass =
  "w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y leading-relaxed";
const inputClass =
  "w-full rounded-lg border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32]";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "blog", label: "Blog Post" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "instagram", label: "Instagram Post" },
  { value: "all", label: "All (Blog + Social)" },
];

const PLACEHOLDERS: Record<ContentType, string> = {
  blog: "Describe the topic — e.g. 'How small charities can review their admin systems to find where AI and automation would save the most time'",
  linkedin:
    "Describe the message — e.g. 'The value of reviewing your current systems before adopting AI — what you'll learn that no vendor demo can tell you'",
  instagram:
    "Describe the idea — e.g. 'The moment you realise your systems are holding you back more than your workload is'",
  all: "Describe the topic — e.g. 'How small charities can review their admin systems to find where AI and automation would save the most time'",
};

export function ContentCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
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
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/engagement/content-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, brief }),
      });
      const json = (await res.json()) as { data?: GeneratedResult; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Generation failed");
      setEditableResult(json.data);
      if ("hashtags" in json.data) {
        setHashtagsInput((json.data.hashtags as string[]).join(", "));
      }
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const currentHashtags = hashtagsInput
    .split(",")
    .map((h) => h.trim().replace(/^#/, ""))
    .filter(Boolean);

  const hashtagString = currentHashtags.map((h) => `#${h}`).join(" ");

  const defaultTitle =
    editableResult && "title" in editableResult
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
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create post");
      const postId = json.data.id;

      // Store social content in localStorage for the post editor (persists across sessions)
      const socialData: Record<string, unknown> = {
        sharing_caption: blog.sharing_caption,
        hashtags: currentHashtags,
      };
      if ("linkedin_post" in blog) socialData.linkedin_post = (blog as AllResult).linkedin_post;
      if ("instagram_caption" in blog) socialData.instagram_caption = (blog as AllResult).instagram_caption;
      localStorage.setItem(`vaxai_social_${postId}`, JSON.stringify(socialData));

      onClose();
      router.push(`/admin/posts/${postId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setConverting(false);
    }
  };

  // For "all" type: schedule both social posts then create draft post
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
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create post");
      const postId = json.data.id;

      // Schedule social posts if date is set
      if (scheduleDate) {
        setScheduling(true);
        await Promise.all([
          fetch("/api/admin/social-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${defaultTitle} — LinkedIn`,
              platform: "linkedin",
              content: `${all.linkedin_post}\n\n${hashtagString}`,
              scheduled_date: scheduleDate,
              link: `/admin/posts/${postId}`,
            }),
          }),
          fetch("/api/admin/social-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${defaultTitle} — Instagram`,
              platform: "instagram",
              content: `${all.instagram_caption}\n\n${hashtagString}`,
              scheduled_date: scheduleDate,
              link: `/admin/posts/${postId}`,
            }),
          }),
        ]);
        setScheduling(false);
        setScheduledSocial(true);
      }

      // Store social content in localStorage for post editor publish popup (persists across sessions)
      localStorage.setItem(
        `vaxai_social_${postId}`,
        JSON.stringify({
          sharing_caption: all.sharing_caption,
          linkedin_post: all.linkedin_post,
          instagram_caption: all.instagram_caption,
          hashtags: currentHashtags,
        }),
      );

      onClose();
      router.push(`/admin/posts/${postId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setConverting(false);
      setScheduling(false);
    }
  };

  // For individual linkedin/instagram types — schedule single platform
  const [liScheduleDate, setLiScheduleDate] = useState("");
  const [igScheduleDate, setIgScheduleDate] = useState("");
  const [liSaved, setLiSaved] = useState(false);
  const [igSaved, setIgSaved] = useState(false);
  const [liSaving, setLiSaving] = useState(false);
  const [igSaving, setIgSaving] = useState(false);

  const saveLiToCalendar = async () => {
    if (!liScheduleDate || !editableResult) return;
    setLiSaving(true);
    const li = editableResult as LinkedInResult;
    await fetch("/api/admin/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${brief.slice(0, 80)} — LinkedIn`,
        platform: "linkedin",
        content: `${li.post_text}\n\n${hashtagString}`,
        scheduled_date: liScheduleDate,
      }),
    });
    setLiSaving(false);
    setLiSaved(true);
  };

  const saveIgToCalendar = async () => {
    if (!igScheduleDate || !editableResult) return;
    setIgSaving(true);
    const ig = editableResult as InstagramResult;
    await fetch("/api/admin/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${brief.slice(0, 80)} — Instagram`,
        platform: "instagram",
        content: `${ig.caption}\n\n${hashtagString}`,
        scheduled_date: igScheduleDate,
      }),
    });
    setIgSaving(false);
    setIgSaved(true);
  };

  if (!open) return null;

  const blog = editableResult as BlogResult | null;
  const all = editableResult as AllResult | null;
  const li = editableResult as LinkedInResult | null;
  const ig = editableResult as InstagramResult | null;

  const isBlogLike = contentType === "blog" || contentType === "all";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">
              {step === "form"
                ? "Create content with AI"
                : `${CONTENT_TYPES.find((t) => t.value === contentType)?.label} — Edit & Save`}
            </h2>
            {step === "preview" && (
              <p className="text-xs text-[#6f6b62] mt-0.5">Edit the AI draft below, then save or schedule</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#f7f4ea]"
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
                        ? "bg-[#063b32] text-white"
                        : "border border-[#111111]/15 text-[#6f6b62] hover:border-[#063b32]/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6f6b62]">
                  Brief / topic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={5}
                  placeholder={PLACEHOLDERS[contentType]}
                  className="w-full rounded-xl border border-[#111111]/15 px-3 py-2 text-sm outline-none focus:border-[#063b32] resize-y"
                />
              </div>

              <p className="text-xs text-[#6f6b62]">
                The AI applies the MT1L VAT framework (Value, Alignment, Trust) as a natural lens through the content.
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
                      value={blog.title}
                      onChange={(e) =>
                        setEditableResult((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                      }
                      className={inputClass}
                    />
                  </EditSection>

                  <EditSection label="SEO Description">
                    <textarea
                      value={blog.seo_description}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, seo_description: e.target.value } : prev,
                        )
                      }
                      rows={2}
                      className={taClass}
                    />
                    <p className="mt-1 text-[10px] text-[#6f6b62]">{blog.seo_description.length} / 160 chars</p>
                  </EditSection>

                  <EditSection label="Blog post body">
                    <div
                      className="prose prose-sm max-w-none text-[#111111] max-h-48 overflow-y-auto text-sm [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: blog.body_html }}
                    />
                    <p className="mt-2 text-[10px] text-[#6f6b62]">
                      Body is fully editable in the post editor after saving.
                    </p>
                  </EditSection>

                  <EditSection label="Sharing caption">
                    <textarea
                      value={blog.sharing_caption}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, sharing_caption: e.target.value } : prev,
                        )
                      }
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
                      value={all.linkedin_post}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, linkedin_post: e.target.value } : prev,
                        )
                      }
                      rows={6}
                      className={taClass}
                    />
                  </EditSection>

                  <EditSection label="Instagram caption">
                    <textarea
                      value={all.instagram_caption}
                      onChange={(e) =>
                        setEditableResult((prev) =>
                          prev ? { ...prev, instagram_caption: e.target.value } : prev,
                        )
                      }
                      rows={3}
                      className={taClass}
                    />
                  </EditSection>
                </>
              )}

              {/* LinkedIn only */}
              {contentType === "linkedin" && li && (
                <EditSection label="LinkedIn post">
                  <textarea
                    value={li.post_text}
                    onChange={(e) =>
                      setEditableResult((prev) => (prev ? { ...prev, post_text: e.target.value } : prev))
                    }
                    rows={8}
                    className={taClass}
                  />
                </EditSection>
              )}

              {/* Instagram only */}
              {contentType === "instagram" && ig && (
                <EditSection label="Instagram caption">
                  <textarea
                    value={ig.caption}
                    onChange={(e) =>
                      setEditableResult((prev) => (prev ? { ...prev, caption: e.target.value } : prev))
                    }
                    rows={5}
                    className={taClass}
                  />
                </EditSection>
              )}

              {/* Hashtags — shared across all versions */}
              <EditSection label="Hashtags (added to all versions)">
                <input
                  value={hashtagsInput}
                  onChange={(e) => setHashtagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className={inputClass}
                />
                <p className="mt-1 text-[10px] text-[#6f6b62]">Comma-separated — no # needed.</p>
              </EditSection>

              {/* LinkedIn individual — schedule */}
              {contentType === "linkedin" && (
                <EditSection label="Schedule to calendar">
                  {liSaved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Saved to calendar
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={liScheduleDate}
                        onChange={(e) => setLiScheduleDate(e.target.value)}
                        className="rounded-md border border-[#111111]/15 px-2 py-1.5 text-sm outline-none focus:border-[#063b32]"
                      />
                      <button
                        type="button"
                        disabled={!liScheduleDate || liSaving}
                        onClick={() => void saveLiToCalendar()}
                        className="inline-flex items-center gap-1 rounded-md bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                      >
                        {liSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                      </button>
                    </div>
                  )}
                </EditSection>
              )}

              {/* Instagram individual — schedule */}
              {contentType === "instagram" && (
                <EditSection label="Schedule to calendar">
                  {igSaved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Saved to calendar
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={igScheduleDate}
                        onChange={(e) => setIgScheduleDate(e.target.value)}
                        className="rounded-md border border-[#111111]/15 px-2 py-1.5 text-sm outline-none focus:border-[#063b32]"
                      />
                      <button
                        type="button"
                        disabled={!igScheduleDate || igSaving}
                        onClick={() => void saveIgToCalendar()}
                        className="inline-flex items-center gap-1 rounded-md bg-[#063b32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                      >
                        {igSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                      </button>
                    </div>
                  )}
                </EditSection>
              )}

              {/* All type — single schedule date for both social posts */}
              {contentType === "all" && (
                <EditSection label="Schedule social posts (one date for both)">
                  {scheduledSocial ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> LinkedIn & Instagram scheduled
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#6f6b62]">
                        Optional — pick a date to schedule both LinkedIn and Instagram posts at the same time.
                      </p>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="rounded-md border border-[#111111]/15 px-2 py-1.5 text-sm outline-none focus:border-[#063b32]"
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
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={brief.trim().length === 0 || generating}
                onClick={() => void generate()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating…" : "Generate with AI"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setEditableResult(null);
                  setError("");
                  setScheduledSocial(false);
                  setLiSaved(false);
                  setIgSaved(false);
                }}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]"
              >
                ← Start over
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]"
                >
                  Close
                </button>
                {contentType === "blog" && (
                  <button
                    type="button"
                    disabled={converting}
                    onClick={() => void convertToDraftPost()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                  >
                    {converting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save as draft post
                  </button>
                )}
                {contentType === "all" && (
                  <button
                    type="button"
                    disabled={converting || scheduling}
                    onClick={() => void saveAll()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
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
