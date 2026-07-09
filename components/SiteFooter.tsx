"use client";

import { useState } from "react";
import PublicContactModal from "@/components/PublicContactModal";
import NewsletterForm from "@/components/NewsletterForm";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export default function SiteFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-white/10 bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <div className="flex items-center">
                <img src="/vaxai-logo.png" alt="VAxAI" className="h-10 w-auto" />
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-paper/65">
                Admin support with AI, automation and human VA oversight.
              </p>
              <NewsletterForm />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Services</p>
                <div className="grid gap-3.5 text-paper/62">
                  <a href="/founders-entrepreneurs" className="transition-colors duration-200 hover:text-paper">Founders &amp; Entrepreneurs</a>
                  <a href="/small-business" className="transition-colors duration-200 hover:text-paper">Small Businesses</a>
                  <a href="/charities-non-profits" className="transition-colors duration-200 hover:text-paper">Charities &amp; Non-Profits</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Company</p>
                <div className="grid gap-3.5 text-paper/62">
                  <a href="/#experts" className="transition-colors duration-200 hover:text-paper">About</a>
                  <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-paper">MT1L</a>
                  <button type="button" onClick={() => setContactOpen(true)} className="text-left transition-colors duration-200 hover:text-paper">
                    Contact
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Support</p>
                <div className="grid gap-3.5 text-paper/62">
                  <a href="/#faq" className="transition-colors duration-200 hover:text-paper">FAQ</a>
                  <a href="/founders-entrepreneurs#access-to-work" className="transition-colors duration-200 hover:text-paper">Access to Work</a>
                  <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors duration-200 hover:text-paper">VAT Framework</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Insights</p>
                <div className="grid gap-3.5 text-paper/62">
                  <a href="/insights" className="transition-colors duration-200 hover:text-paper">Insights &amp; Resources</a>
                </div>
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Legal</p>
                <div className="grid gap-3.5 text-paper/62">
                  <a href="/privacy" className="transition-colors duration-200 hover:text-paper">Privacy</a>
                  <a href="/terms" className="transition-colors duration-200 hover:text-paper">Terms</a>
                  <a href="/edi-policy" className="transition-colors duration-200 hover:text-paper">JEF Policy</a>
                  <a href="/ai-use-policy" className="transition-colors duration-200 hover:text-paper">AI Use</a>
                  <CookieSettingsButton />
                  <a href="/admin/login" className="mt-1 text-xs text-paper/45 transition-colors duration-200 hover:text-paper/70">VAxAI Studio</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-6 text-xs text-paper/50">
            © {new Date().getFullYear()} VAxAI — a service by MT1L. All rights reserved.
          </div>
        </div>
      </footer>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
