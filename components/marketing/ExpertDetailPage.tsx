"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type { Expert } from "@/lib/experts";

const MT1L_URL = "https://www.mt1l.com";

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 ease-premium hover:bg-pine-800 hover:shadow-lift",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pine-700">
      <span className="simplified-hide h-1.5 w-1.5 rounded-full bg-pine-700" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function ExpertDetailPage({ expert }: { expert: Expert }) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="light" />
        </header>

        <main className="px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <div className="relative overflow-hidden rounded-[28px] ring-1 ring-ink/10">
              <div className="aspect-[0.9]">
                <Image
                  src={expert.photo}
                  alt={expert.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
              </div>
            </div>

            <div>
              <Eyebrow>{expert.role}</Eyebrow>
              <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
                {expert.name}
              </h1>
              <p className="mt-6 text-base leading-8 text-muted md:text-lg">{expert.copy}</p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={expert.linkedin} target="_blank" rel="noreferrer" className={btn.ghostLight}>
                  Let&apos;s connect
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button type="button" onClick={() => setContactOpen(true)} className={btn.primary}>
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </button>
                {expert.showMt1lLink ? (
                  <a href={MT1L_URL} target="_blank" rel="noreferrer" className={btn.ghostLight}>
                    Learn more about MT1L
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
                {expert.showStartConversation ? (
                  <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                    Start a conversation
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
        <SimplifiedModeToggle />
      </div>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}