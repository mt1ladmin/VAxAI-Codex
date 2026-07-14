"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { AppSelect } from "@/components/ui/AppSelect";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PublicContactModal({ open, onClose }: Props) {
  const [preferredContact, setPreferredContact] = useState("Email");
  const [supportType, setSupportType] = useState("Admin Health Check");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "submitted" | "calendly">("form");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setWantsDiscoveryCall(null);
      setSupportType("Admin Health Check");
      setPreferredContact("Email");
      return;
    }
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

  useEffect(() => {
    if (step !== "calendly") return;
    if (!document.querySelector('link[href*="calendly.com/assets"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="calendly.com/assets"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [step]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name")),
      email: String(data.get("email")),
      supportType: String(data.get("supportType")),
      preferredContact,
      telephone: String(data.get("telephone") ?? ""),
      details: String(data.get("details")),
      wantsDiscoveryCall: wantsDiscoveryCall === true,
    };
    await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    setSubmitting(false);
    if (wantsDiscoveryCall === true) {
      setStep("calendly");
    } else {
      setStep("submitted");
    }
  }

  const fieldClass =
    "rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#122428]";

  const modal = (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {step === "calendly" ? (
        <div className="flex h-full max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
          <div className="flex shrink-0 items-center justify-between gap-6 bg-[#122428] px-6 py-5 text-paper md:px-10 rounded-t-3xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Discovery call</p>
              <h2 id="contact-modal-title" className="mt-1 text-xl font-semibold leading-tight">Book a time with us</h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <div
              className="calendly-inline-widget h-full w-full"
              data-url="https://calendly.com/thesia-mt1l"
              style={{ minHeight: "660px" }}
            />
          </div>
        </div>
      ) : (
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
          <div className="flex items-start justify-between gap-6 bg-[#122428] px-6 py-6 text-paper md:px-10 rounded-t-3xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Contact VAxAI</p>
              <h2 id="contact-modal-title" className="mt-3 text-3xl font-semibold leading-tight">
                {step === "submitted" ? "Enquiry sent" : "Tell us what support you need"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper" aria-label="Close contact form">
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === "submitted" ? (
            <div className="p-6 md:p-10">
              <p className="text-sm leading-7 text-muted">
                Thank you — we have received your message and will be in touch shortly.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
              >
                Close
              </button>
            </div>
          ) : (
            <form
              className="grid gap-5 p-6 md:grid-cols-2 md:p-10"
              onSubmit={handleSubmit}
            >
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <input required name="name" autoComplete="name" className={fieldClass} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email address
                <input required type="email" name="email" autoComplete="email" className={fieldClass} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Support type
                <AppSelect
                  value={supportType}
                  onChange={setSupportType}
                  options={[
                    { value: "Admin Health Check", label: "Admin Health Check (free)" },
                    { value: "Admin Review", label: "Admin Review" },
                    { value: "Admin Support", label: "Admin Support" },
                    { value: "Access to Work", label: "Access to Work" },
                    { value: "General enquiry", label: "General enquiry" },
                  ]}
                  name="supportType"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Preferred method of contact
                <AppSelect
                  value={preferredContact}
                  onChange={setPreferredContact}
                  options={[{ value: "Email", label: "Email" }, { value: "Telephone", label: "Telephone" }]}
                  name="preferredContact"
                />
              </label>
              {preferredContact === "Telephone" && (
                <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                  Telephone number
                  <input required type="tel" name="telephone" autoComplete="tel" className={fieldClass} />
                </label>
              )}
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Tell us more
                <textarea required name="details" rows={5} className={`${fieldClass} resize-y`} />
              </label>
              <div className="rounded-2xl border border-[#122428]/20 bg-[#f3f9f5] p-5 md:col-span-2">
                <p className="font-semibold text-ink">Would you like to book a discovery call?</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  A 30-minute conversation to explore your challenge and whether we are the right fit.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setWantsDiscoveryCall(true)}
                    className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      wantsDiscoveryCall === true
                        ? "border-[#122428] bg-[#122428] text-acid"
                        : "border-ink/15 bg-white text-ink hover:border-[#122428]/40"
                    }`}
                  >
                    Yes, book a call
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantsDiscoveryCall(false)}
                    className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      wantsDiscoveryCall === false
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/15 bg-white text-ink hover:border-ink/30"
                    }`}
                  >
                    No, just send my message
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-[#122428] px-5 py-3 text-sm font-semibold text-paper disabled:opacity-50"
                >
                  {submitting ? "Sending…" : wantsDiscoveryCall === true ? "Continue to book a call" : "Send my message"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );

  return mounted ? createPortal(modal, document.body) : null;
}
