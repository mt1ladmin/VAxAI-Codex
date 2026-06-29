"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

type Props = { postId: string; postTitle: string };

export default function PostContactForm({ postId, postTitle }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[#f3f9f5] px-6 py-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#063b32]">
          <Check className="h-5 w-5 text-[#f5f274]" />
        </div>
        <div>
          <p className="font-semibold text-[#063b32]">Message sent</p>
          <p className="text-sm text-gray-500">We'll be in touch shortly. Your enquiry has been linked to this post.</p>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Get in touch
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#063b32] focus:ring-2 focus:ring-[#063b32]/10"
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
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#063b32] focus:ring-2 focus:ring-[#063b32]/10"
          placeholder="you@example.com"
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#063b32] focus:ring-2 focus:ring-[#063b32]/10"
          placeholder="What would you like to discuss?"
        />
      </div>
      <div className="md:col-span-2">
        <p className="mb-3 text-xs text-gray-400">
          This message will be linked to the post <span className="font-semibold text-gray-600">"{postTitle}"</span>.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send message"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
