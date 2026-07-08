"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import { experts } from "@/lib/experts";
import type { Expert } from "@/lib/experts";
import { cn } from "@/lib/utils";

const MT1L_URL = "https://www.mt1l.com";

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 ease-premium hover:bg-pine-800 hover:shadow-lift",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper/90 transition-colors duration-300 hover:border-white/40 hover:text-paper",
};

function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
        light ? "text-acid/90" : "text-pine-700"
      }`}
    >
      <span
        className={`simplified-hide h-1.5 w-1.5 rounded-full ${light ? "bg-acid" : "bg-pine-700"}`}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

function splitCopyIntoParagraphs(copy: string): string[] {
  return copy
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
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
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Meet the people behind VAxAI</Eyebrow>
            <div
              className="mt-6 flex gap-2 overflow-x-auto border-b border-ink/10 pb-4"
              role="tablist"
              aria-label="VAxAI team members"
            >
              {experts.map((person) => {
                const isActive = person.slug === expert.slug;

                return (
                  <Link
                    key={person.slug}
                    href={`/about/${person.slug}`}
                    role="tab"
                    aria-selected={isActive}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "bg-pine-900 text-paper"
                        : "bg-cream/70 text-ink/75 hover:bg-cream hover:text-ink",
                    )}
                  >
                    {person.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
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
                <div className="mt-6 space-y-4 text-base leading-8 text-muted md:text-lg">
                  {splitCopyIntoParagraphs(expert.copy).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-16 overflow-hidden rounded-[40px] bg-pine-900 px-6 py-12 text-center text-paper md:px-12 md:py-14">
              <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-24 left-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
                <div className="absolute bottom-[-30%] right-[25%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
              </div>
              <div className="relative">
                <div className="flex justify-center">
                  <Eyebrow light>Work with VAxAI</Eyebrow>
                </div>
                <h2 className="mx-auto mt-4 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-3xl">
                  Ready to talk about how we can support you?
                </h2>
                <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                    Get in touch
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href={expert.linkedin} target="_blank" rel="noreferrer" className={btn.ghostDark}>
                    Let&apos;s connect
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {expert.showMt1lLink ? (
                    <a href={MT1L_URL} target="_blank" rel="noreferrer" className={btn.ghostDark}>
                      Learn more about MT1L
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  {expert.showStartConversation ? (
                    <button type="button" onClick={() => setContactOpen(true)} className={btn.ghostDark}>
                      Start a conversation
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
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