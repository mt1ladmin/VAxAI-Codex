"use client";

import { useState } from "react";
import PublicContactModal from "@/components/PublicContactModal";
import NewsletterForm from "@/components/NewsletterForm";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export default function SiteFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-ink/8 bg-gradient-to-b from-cream/40 to-paper px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3 text-2xl font-semibold tracking-tight text-ink">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-forest text-sm font-bold text-acid shadow-lift">
              VA
            </span>
            <span>VAxAI</span>
          </div>
          <NewsletterForm />

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="eyebrow mb-5 text-forest/80">Services</p>
              <div className="grid gap-3 text-muted">
                <a href="/#pricing" className="transition-colors hover:text-ink">Assess</a>
                <a href="/#pricing" className="transition-colors hover:text-ink">Implement</a>
                <a href="/#pricing" className="transition-colors hover:text-ink">Support</a>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-5 text-forest/80">Company</p>
              <div className="grid gap-3 text-muted">
                <a href="/#experts" className="transition-colors hover:text-ink">About</a>
                <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">MT1L</a>
                <button type="button" onClick={() => setContactOpen(true)} className="text-left transition-colors hover:text-ink">
                  Contact
                </button>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-5 text-forest/80">Support</p>
              <div className="grid gap-3 text-muted">
                <a href="/#faq" className="transition-colors hover:text-ink">FAQ</a>
                <a href="/#access-to-work" className="transition-colors hover:text-ink">Access to Work</a>
                <a href="/#vat-framework" className="transition-colors hover:text-ink">VAT Framework</a>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-5 text-forest/80">Insights</p>
              <div className="grid gap-3 text-muted">
                <a href="/insights" className="transition-colors hover:text-ink">Insights &amp; Resources</a>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-5 text-forest/80">Legal</p>
              <div className="grid gap-3 text-muted">
                <a href="/privacy" className="transition-colors hover:text-ink">Privacy</a>
                <a href="/terms" className="transition-colors hover:text-ink">Terms</a>
                <a href="/edi-policy" className="transition-colors hover:text-ink">JEF Policy</a>
                <a href="/ai-use-policy" className="transition-colors hover:text-ink">AI Use</a>
                <CookieSettingsButton />
                <a href="/admin/login" className="mt-1 text-xs text-muted/50 transition-colors hover:text-muted">VAxAI Studio</a>
              </div>
            </div>
          </div>

          <div className="section-divider-soft mt-14" />
          <p className="mt-6 text-xs text-muted/70">
            © {new Date().getFullYear()} VAxAI — a service by MT1L. All rights reserved.
          </p>
        </div>
      </footer>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
