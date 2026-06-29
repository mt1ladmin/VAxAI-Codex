"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PublicContactModal({ open, onClose }: Props) {
  const [preferredContact, setPreferredContact] = useState("Email");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name")),
        email: String(data.get("email")),
        supportType: String(data.get("supportType")),
        preferredContact,
        telephone: String(data.get("telephone") ?? ""),
        details: String(data.get("details")),
        wantsDiscoveryCall,
      }),
    }).catch(() => null);
    setSubmitting(false);
    if (response?.ok) setSubmitted(true);
  }

  const fieldClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#063b32] focus:ring-2 focus:ring-[#063b32]/10";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-6 rounded-t-3xl bg-[#063b32] px-6 py-5 text-white sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f274]">VAxAI</p>
            <h2 id="contact-modal-title" className="text-2xl font-bold">Let&apos;s talk</h2>
            <p className="mt-1 text-sm text-white/65">Tell us what you need help with. A short note is plenty.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close contact form">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-7 text-center sm:p-10">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#063b32]">
              <Check className="h-6 w-6 text-[#f5f274]" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">Message sent</h3>
            <p className="mt-2 text-sm text-gray-500">Thanks — the VAxAI team will be in touch shortly.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
            <label className="text-xs font-semibold text-gray-600">
              Name
              <input required name="name" className={`${fieldClass} mt-1.5`} placeholder="Your name" />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Email
              <input required type="email" name="email" className={`${fieldClass} mt-1.5`} placeholder="you@example.com" />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Support type
              <select required name="supportType" defaultValue="" className={`${fieldClass} mt-1.5`}>
                <option value="" disabled>Select support</option>
                <option>Virtual assistant support</option>
                <option>AI &amp; automation</option>
                <option>Admin &amp; operations</option>
                <option>General enquiry</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Preferred contact
              <select value={preferredContact} onChange={(event) => setPreferredContact(event.target.value)} className={`${fieldClass} mt-1.5`}>
                <option>Email</option>
                <option>Telephone</option>
              </select>
            </label>
            {preferredContact === "Telephone" && (
              <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
                Telephone
                <input required name="telephone" type="tel" className={`${fieldClass} mt-1.5`} placeholder="Your telephone number" />
              </label>
            )}
            <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
              How can we help?
              <textarea required name="details" rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder="A few lines about what you would like to explore…" />
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#063b32]/10 bg-[#f7f4ea]/60 p-4 sm:col-span-2">
              <input type="checkbox" checked={wantsDiscoveryCall} onChange={(event) => setWantsDiscoveryCall(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#063b32]" />
              <span>
                <span className="block text-sm font-semibold text-gray-800">I&apos;d also like a discovery call</span>
                <span className="mt-0.5 block text-xs text-gray-500">Optional — we can arrange a suitable time after reviewing your message.</span>
              </span>
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#063b32] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {submitting ? "Sending…" : "Send message"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
