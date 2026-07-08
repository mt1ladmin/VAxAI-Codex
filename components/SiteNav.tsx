"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import PublicContactModal from "@/components/PublicContactModal";

type Props = {
  variant?: "dark" | "light";
};

export default function SiteNav({ variant = "dark" }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const isDark = variant === "dark";

  const linkClass = isDark
    ? "text-paper/70 hover:text-paper"
    : "text-gray-500 hover:text-gray-900";

  const ctaClass = isDark
    ? "bg-[#f5f274] text-[#111111] hover:bg-[#f5f274]/90"
    : "bg-[#063b32] text-white hover:opacity-90";

  const mobileMenuBg = isDark ? "bg-[#063b32]" : "bg-white";
  const mobileLinkClass = isDark ? "text-paper/80 hover:text-paper" : "text-gray-600 hover:text-gray-900";

  return (
    <>
    <nav className="relative mx-auto flex max-w-6xl items-center justify-between py-1">
      {/* Logo */}
      <a href="/" className={`flex items-center gap-2 font-semibold ${isDark ? "text-paper" : "text-gray-900"}`}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f5f274] text-[11px] font-bold text-[#111111]">
          VA
        </span>
        <span className="text-sm tracking-tight">VAxAI</span>
      </a>

      {/* Desktop links */}
      <div className={`hidden items-center gap-5 text-xs font-semibold md:flex ${linkClass}`}>
        <a href="/founders-entrepreneurs" className={linkClass}>Founders</a>
        <a href="/small-business" className={linkClass}>Small Business</a>
        <a href="/charities-non-profits" className={linkClass}>Charities</a>
        <a href="/neurodivergent-professionals" className={linkClass}>Neurodivergent</a>
        <a href="/#experts" className={linkClass}>About</a>
        <a href="/#vat-framework" className={linkClass}>VAT Framework</a>
        <a href="/#access-to-work" className={linkClass}>Access to Work</a>
        <a href="/#faq" className={linkClass}>FAQ</a>
        <a href="/insights" className={`${isDark ? "text-[#f5f274]/80 hover:text-[#f5f274]" : "text-[#063b32] hover:text-[#063b32]/80"} font-semibold`}>
          Insights & Resources
        </a>
      </div>

      {/* Desktop CTA */}
      <button
        type="button"
        onClick={() => setContactOpen(true)}
        className={`hidden rounded-md px-4 py-2 text-xs font-semibold md:inline-flex ${ctaClass}`}
      >
        Get in touch
      </button>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className={`grid h-9 w-9 place-items-center rounded-md border md:hidden ${isDark ? "border-white/15 text-paper" : "border-gray-200 text-gray-600"}`}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`absolute left-0 right-0 top-full z-50 flex flex-col gap-1 rounded-xl border border-white/10 p-4 shadow-xl ${mobileMenuBg}`}>
          {[
            { label: "Founders", href: "/founders-entrepreneurs" },
            { label: "Small Business", href: "/small-business" },
            { label: "Charities", href: "/charities-non-profits" },
            { label: "Neurodivergent", href: "/neurodivergent-professionals" },
            { label: "About", href: "/#experts" },
            { label: "VAT Framework", href: "/#vat-framework" },
            { label: "Access to Work", href: "/#access-to-work" },
            { label: "FAQ", href: "/#faq" },
            { label: "Insights & Resources", href: "/insights" },
          ].map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMobileOpen(false)}
              className={`rounded-md px-4 py-2.5 text-sm font-semibold ${mobileLinkClass}`}>
              {label}
            </a>
          ))}
          <button type="button" onClick={() => { setMobileOpen(false); setContactOpen(true); }}
            className={`mt-2 rounded-md px-4 py-2.5 text-center text-sm font-semibold ${ctaClass}`}>
            Get in touch
          </button>
        </div>
      )}
    </nav>
    <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
