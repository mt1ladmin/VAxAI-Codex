"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import PublicContactModal from "@/components/PublicContactModal";

type Props = {
  variant?: "dark" | "light";
};

const audienceLinks = [
  { label: "Founders & Entrepreneurs", href: "/founders-entrepreneurs", image: "/founder-laptop-graph-meeting.jpg" },
  { label: "SMEs", href: "/small-business", image: "/small-business-boxes.jpg" },
  { label: "Charities & Non-Profits", href: "/charities-non-profits", image: "/charity-volunteers-garden.jpg" },
];

export default function SiteNav({ variant = "dark" }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const audienceRef = useRef<HTMLDivElement>(null);

  const isDark = variant === "dark";

  const linkClass = isDark
    ? "text-paper/70 hover:text-paper"
    : "text-gray-500 hover:text-gray-900";

  const ctaClass = isDark
    ? "bg-[#D8FC2E] text-[#111111] hover:bg-[#D8FC2E]/90"
    : "bg-[#122428] text-white hover:opacity-90";

  const mobileMenuBg = isDark ? "bg-[#122428]" : "bg-white";
  const mobileLinkClass = isDark ? "text-paper/80 hover:text-paper" : "text-gray-600 hover:text-gray-900";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (audienceRef.current && !audienceRef.current.contains(event.target as Node)) {
        setAudienceOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <nav className="relative mx-auto flex max-w-6xl items-center justify-between py-1">
      {/* Logo */}
      <a
        href="/"
        className={isDark ? "flex items-center" : "flex items-center rounded-md bg-[#122428] px-2.5 py-1.5"}
        aria-label="VAxAI home"
      >
        <img src="/vaxai-logo.png" alt="VAxAI" className="h-8 w-auto" />
      </a>

      {/* Desktop links */}
      <div className={`hidden items-center gap-5 text-xs font-semibold md:flex ${linkClass}`}>
        <div ref={audienceRef} className="relative">
          <button
            type="button"
            onClick={() => setAudienceOpen((open) => !open)}
            className={`inline-flex items-center gap-1 ${linkClass}`}
            aria-expanded={audienceOpen}
            aria-haspopup="true"
          >
            Who we support
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${audienceOpen ? "rotate-180" : ""}`} />
          </button>
          {audienceOpen ? (
            <div
              className={`absolute left-0 top-full z-50 mt-2 min-w-[15rem] rounded-xl border p-2 shadow-xl ${
                isDark ? "border-white/10 bg-[#122428]" : "border-gray-200 bg-white"
              }`}
            >
              {audienceLinks.map(({ label, href, image }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setAudienceOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${mobileLinkClass}`}
                >
                  <span className="h-10 w-12 shrink-0 overflow-hidden rounded-md bg-white/10">
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <a href="/#experts" className={linkClass}>About</a>
        <a href="/#faq" className={linkClass}>FAQ</a>
        <a href="/insights" className={`${isDark ? "text-[#D8FC2E]/80 hover:text-[#D8FC2E]" : "text-[#122428] hover:text-[#122428]/80"} font-semibold`}>
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
          <p className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${isDark ? "text-paper/50" : "text-gray-400"}`}>
            Who we support
          </p>
          {audienceLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-md px-4 py-2.5 text-sm font-semibold ${mobileLinkClass}`}
            >
              {label}
            </a>
          ))}
          {[
            { label: "About", href: "/#experts" },
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
