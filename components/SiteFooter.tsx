"use client";

import { useState } from "react";
import PublicContactModal from "@/components/PublicContactModal";
import NewsletterForm from "@/components/NewsletterForm";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export default function SiteFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-ink/8 bg-paper px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3 text-2xl font-semibold text-ink">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-pine-900 text-sm font-bold text-acid">
                  VA
                </span>
                <span className="tracking-tight">VAxAI</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                Admin support with AI, automation and human VA oversight.
              </p>
              <NewsletterForm />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">Services</p>
                <div className="grid gap-3.5 text-muted">
                  <a href="/#pricing" className="transition-colors duration-200 hover:text-ink">Assess</a>
                  <a href="/#pricing" className="transition-colors duration-200 hover:text-ink">Assess &amp; Implement</a>
                  <a href="/#pricing" className="transition-colors duration-200 hover:text-ink">Assess, Implement &amp; Support</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">Company</p>
                <div className="grid gap-3.5 text-muted">
                  <a href="/#experts" className="transition-colors duration-200 hover:text-ink">About</a>
                  <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-ink">MT1L</a>
                  <button type="button" onClick={() => setContactOpen(true)} className="text-left transition-colors duration-200 hover:text-ink">
                    Contact
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">Support</p>
                <div className="grid gap-3.5 text-muted">
                  <a href="/#faq" className="transition-colors duration-200 hover:text-ink">FAQ</a>
                  <a href="/#access-to-work" className="transition-colors duration-200 hover:text-ink">Access to Work</a>
                  <a href="/#vat-framework" className="transition-colors duration-200 hover:text-ink">VAT Framework</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">Insights</p>
                <div className="grid gap-3.5 text-muted">
                  <a href="/insights" className="transition-colors duration-200 hover:text-ink">Insights &amp; Resources</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70">Legal</p>
                <div className="grid gap-3.5 text-muted">
                  <a href="/privacy" className="transition-colors duration-200 hover:text-ink">Privacy</a>
                  <a href="/terms" className="transition-colors duration-200 hover:text-ink">Terms</a>
                  <a href="/edi-policy" className="transition-colors duration-200 hover:text-ink">JEF Policy</a>
                  <a href="/ai-use-policy" className="transition-colors duration-200 hover:text-ink">AI Use</a>
                  <CookieSettingsButton />
                  <a href="/admin/login" className="mt-1 text-xs text-muted/60 transition-colors duration-200 hover:text-muted">VAxAI Studio</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-ink/8 pt-6 text-xs text-muted/80">
            © {new Date().getFullYear()} VAxAI — a service by MT1L. All rights reserved.
          </div>
        </div>
      </footer>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
