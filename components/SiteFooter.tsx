"use client";

import { useState } from "react";
import PublicContactModal from "@/components/PublicContactModal";

export default function SiteFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-gray-200 bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#063b32] text-sm font-bold text-[#f5f274]">
              VA
            </span>
            <span>VAxAI</span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="mb-5 font-semibold text-gray-900">Services</p>
              <div className="grid gap-4 text-gray-500">
                <a href="/#pricing" className="hover:text-gray-900">Assess</a>
                <a href="/#pricing" className="hover:text-gray-900">Assess &amp; Implement</a>
                <a href="/#pricing" className="hover:text-gray-900">Assess, Implement &amp; Support</a>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold text-gray-900">Company</p>
              <div className="grid gap-4 text-gray-500">
                <a href="/#experts" className="hover:text-gray-900">About</a>
                <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="hover:text-gray-900">MT1L</a>
                <button type="button" onClick={() => setContactOpen(true)} className="text-left hover:text-gray-900">
                  Contact
                </button>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold text-gray-900">Support</p>
              <div className="grid gap-4 text-gray-500">
                <a href="/#faq" className="hover:text-gray-900">FAQ</a>
                <a href="/#access-to-work" className="hover:text-gray-900">Access to Work</a>
                <a href="/#vat-framework" className="hover:text-gray-900">VAT Framework</a>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold text-gray-900">Insights</p>
              <div className="grid gap-4 text-gray-500">
                <a href="/insights" className="hover:text-gray-900">Insights &amp; Resources</a>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold text-gray-900">Legal</p>
              <div className="grid gap-4 text-gray-500">
                <a href="/privacy" className="hover:text-gray-900">Privacy</a>
                <a href="/terms" className="hover:text-gray-900">Terms</a>
                <a href="/edi-policy" className="hover:text-gray-900">EDI &amp; Social Mobility</a>
                <a href="/ai-use-policy" className="hover:text-gray-900">AI Use</a>
                <a href="/admin/login" className="mt-1 text-xs text-gray-400 hover:text-gray-500">VAxAI Studio</a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-gray-100 pt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} VAxAI — a service by MT1L. All rights reserved.
          </div>
        </div>
      </footer>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
