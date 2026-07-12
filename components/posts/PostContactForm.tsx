"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, X } from "lucide-react";

type Props = { postId: string; postTitle: string };

export default function PostContactForm({ postId, postTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        supportType: "General enquiry",
        preferredContact: "Email",
        details: message,
        wantsDiscoveryCall: false,
        connected_post_id: postId,
        connected_post_title: postTitle,
      }),
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-6 rounded-t-3xl bg-[#122428] px-6 py-5 text-white sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D8FC2E]">VAxAI</p>
            <h2 className="text-xl font-bold">Get in touch</h2>
            <p className="mt-1 text-sm text-white/65">Your enquiry will be linked to this post.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-7 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#122428]">
              <Check className="h-6 w-6 text-[#D8FC2E]" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">Message sent</h3>
            <p className="mt-2 text-sm text-gray-500">
              Thanks, VAxAI will be in touch shortly. Your enquiry is linked to{" "}
              <span className="font-semibold text-gray-700">&ldquo;{postTitle}&rdquo;</span>.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-xl bg-[#122428] px-5 py-3 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 p-6 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#122428] focus:ring-2 focus:ring-[#122428]/10"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#122428] focus:ring-2 focus:ring-[#122428]/10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#122428] focus:ring-2 focus:ring-[#122428]/10"
                placeholder="What would you like to discuss?"
              />
            </div>
            <p className="text-xs text-gray-400">
              This message will be linked to{" "}
              <span className="font-semibold text-gray-600">&ldquo;{postTitle}&rdquo;</span>.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#122428] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send message"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#122428] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Get in touch
        <ArrowRight className="h-4 w-4" />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
