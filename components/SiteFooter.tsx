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
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1.85fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3 text-2xl font-semibold text-ink">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#063b32] text-sm font-bold text-[#f5f274] shadow-[0_4px_20px_rgba(6,59,50,0.15)]">
                  VA
                </span>
                <span>VAxAI</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
                Practical admin support for small businesses, charities and busy teams — combining AI, automation and human oversight.
              </p>
              <div className="mt-8">
                <NewsletterForm />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-4">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#063b32]/80">Pathways</p>
                <div className="grid gap-3 text-muted">
                  <a href="/#pricing" className="transition-colors hover:text-ink">Assess</a>
                  <a href="/#pricing" className="transition-colors hover:text-ink">Implement</a>
                  <a href="/#pricing" className="transition-colors hover:text-ink">Strategic Ongoing Support</a>
                </div>
              </div>
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#063b32]/80">Company</p>
                <div className="grid gap-3 text-muted">
                  <a href="/#experts" className="transition-colors hover:text-ink">About</a>
                  <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">MT1L</a>
                  <button type="button" onClick={() => setContactOpen(true)} className="text-left transition-colors hover:text-ink">
                    Contact
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#063b32]/80">Resources</p>
                <div className="grid gap-3 text-muted">
                  <a href="/insights" className="transition-colors hover:text-ink">Insights &amp; Resources</a>
                  <a href="/#faq" className="transition-colors hover:text-ink">FAQ</a>
                  <a href="/#access-to-work" className="transition-colors hover:text-ink">Access to Work</a>
                  <a href="/#vat-framework" className="transition-colors hover:text-ink">VAT Framework</a>
                </div>
              </div>
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#063b32]/80">Legal</p>
                <div className="grid gap-3 text-muted">
                  <a href="/privacy" className="transition-colors hover:text-ink">Privacy</a>
                  <a href="/terms" className="transition-colors hover:text-ink">Terms</a>
                  <a href="/edi-policy" className="transition-colors hover:text-ink">JEF Policy</a>
                  <a href="/ai-use-policy" className="transition-colors hover:text-ink">AI Use</a>
                  <CookieSettingsButton />
                  <a href="/admin/login" className="mt-1 text-xs text-muted/70 transition-colors hover:text-muted">VAxAI Studio</a>
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