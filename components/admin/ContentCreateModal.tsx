"use client";

import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import { type ReactNode, useState } from "react";

type ContentType = "blog" | "linkedin" | "instagram";

type BlogResult = {
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

type GeneratedResult = BlogResult | LinkedInResult | InstagramResult;

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex items-center gap-1 rounded-md border border-[#111111]/15 px-2.5 py-1 text-xs font-medium text-[#6f6b62] hover:bg-[#f7f4ea] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function Section({ label, children, copyText }: { label: string; children: ReactNode; copyText?: string }) {
  return (
    <div className="rounded-xl border border-[#111111]/10 overflow-hidden">
      <div className="flex items-center justify-between bg-[#f7f4ea] px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6b62]">{label}</p>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "blog", label: "Blog Post" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "instagram", label: "Instagram Post" },
];

const PLACEHOLDERS: Record<ContentType, string> = {
  blog: "Describe the topic — e.g. 'How small charities can use AI to reduce trustee admin burden and improve board reporting'",
  linkedin: "Describe the message — e.g. 'Why delegating routine inbox management to a VA is one of the best investments a solo founder can make'",
  instagram: "Describe the idea — e.g. 'The feeling of finally clearing your inbox backlog with a bit of help'",
};

export function ContentCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [converting, setConverting] = useState(false);

  const reset = () => {
    setStep("form");
    setBrief("");
    setResult(null);
    setError("");
    setContentType("blog");
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
      setResult(json.data);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const convertToDraftPost = async () => {
    if (!result || contentType !== "blog") return;
    const blog = result as BlogResult;
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
          tags: blog.hashtags,
          status: "draft",
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create post");
      onClose();
      router.push(`/admin/posts/${json.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setConverting(false);
    }
  };

  if (!open) return null;

  const hashtagString = result && "hashtags" in result
    ? (result.hashtags as string[]).map((h) => `#${h}`).join(" ")
    : "";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">
              {step === "form" ? "Create content with AI" : `${CONTENT_TYPES.find(t => t.value === contentType)?.label} Preview`}
            </h2>
            {step === "preview" && (
              <p className="text-xs text-[#6f6b62] mt-0.5">Review and copy or convert to a draft post</p>
            )}
          </div>
          <button type="button" onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#f7f4ea]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "form" ? (
            <div className="space-y-4">
              <div className="flex gap-2">
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
                The AI will apply VAxAI&apos;s perspective naturally — concrete value, UK context, and honest credibility woven through the content.
              </p>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {contentType === "blog" && result && (() => {
                const blog = result as BlogResult;
                return (
                  <>
                    <Section label="Title" copyText={blog.title}>
                      <p className="text-sm font-semibold text-[#111111]">{blog.title}</p>
                    </Section>

                    <Section label="SEO Description" copyText={blog.seo_description}>
                      <p className="text-sm text-[#111111]">{blog.seo_description}</p>
                      <p className="mt-1 text-xs text-[#6f6b62]">{blog.seo_description.length} / 160 chars</p>
                    </Section>

                    <Section label="Blog post body" copyText={blog.body_html}>
                      <div
                        className="prose prose-sm max-w-none text-[#111111] max-h-64 overflow-y-auto text-sm [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-2"
                        dangerouslySetInnerHTML={{ __html: blog.body_html }}
                      />
                    </Section>

                    <Section label="Sharing caption" copyText={blog.sharing_caption}>
                      <p className="text-sm text-[#111111] whitespace-pre-line">{blog.sharing_caption}</p>
                    </Section>

                    <Section label="LinkedIn version" copyText={`${blog.linkedin_post}\n\n${hashtagString}`}>
                      <p className="text-sm text-[#111111] whitespace-pre-line">{blog.linkedin_post}</p>
                    </Section>

                    <Section label="Instagram caption" copyText={`${blog.instagram_caption}\n\n${hashtagString}`}>
                      <p className="text-sm text-[#111111] whitespace-pre-line">{blog.instagram_caption}</p>
                    </Section>

                    <Section label="Hashtags" copyText={hashtagString}>
                      <div className="flex flex-wrap gap-1.5">
                        {blog.hashtags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-xs text-[#6f6b62]">#{tag}</span>
                        ))}
                      </div>
                    </Section>
                  </>
                );
              })()}

              {contentType === "linkedin" && result && (() => {
                const li = result as LinkedInResult;
                const fullPost = `${li.post_text}\n\n${hashtagString}`;
                return (
                  <>
                    <Section label="LinkedIn post" copyText={fullPost}>
                      <p className="text-sm text-[#111111] whitespace-pre-line">{li.post_text}</p>
                    </Section>
                    <Section label="Hashtags" copyText={hashtagString}>
                      <div className="flex flex-wrap gap-1.5">
                        {li.hashtags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-xs text-[#6f6b62]">#{tag}</span>
                        ))}
                      </div>
                    </Section>
                  </>
                );
              })()}

              {contentType === "instagram" && result && (() => {
                const ig = result as InstagramResult;
                const fullCaption = `${ig.caption}\n\n${hashtagString}`;
                return (
                  <>
                    <Section label="Instagram caption" copyText={fullCaption}>
                      <p className="text-sm text-[#111111] whitespace-pre-line">{ig.caption}</p>
                    </Section>
                    <Section label="Hashtags" copyText={hashtagString}>
                      <div className="flex flex-wrap gap-1.5">
                        {ig.hashtags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#f7f4ea] px-2.5 py-0.5 text-xs text-[#6f6b62]">#{tag}</span>
                        ))}
                      </div>
                    </Section>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#111111]/10 px-5 py-4">
          {step === "form" ? (
            <>
              <button type="button" onClick={handleClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">
                Cancel
              </button>
              <button
                type="button"
                disabled={brief.trim().length === 0 || generating}
                onClick={() => void generate()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate with AI
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setStep("form"); setResult(null); setError(""); }}
                className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]"
              >
                ← Start over
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleClose} className="rounded-lg border border-[#111111]/15 px-4 py-2 text-sm font-semibold text-[#6f6b62]">
                  Close
                </button>
                {contentType === "blog" && (
                  <button
                    type="button"
                    disabled={converting}
                    onClick={() => void convertToDraftPost()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a5c42] disabled:opacity-50"
                  >
                    {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Convert to draft post
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
