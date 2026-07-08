"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";

export type ServiceSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type RelatedLink = {
  href: string;
  label: string;
  description: string;
};

type ServiceLandingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ServiceSection[];
  relatedLinks?: RelatedLink[];
};

export default function ServiceLandingPage({
  eyebrow,
  title,
  intro,
  sections,
  relatedLinks,
}: ServiceLandingPageProps) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-paper">
        <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="light" />
        </header>

        <main>
          <section className="border-b border-ink/5 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-700">{eyebrow}</p>
              <h1 className="mt-6 max-w-3xl text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink md:text-5xl">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">{intro}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:bg-pine-800"
                >
                  Start your workflow review
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white"
                >
                  See how we work
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto max-w-6xl space-y-6">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-[28px] border border-ink/5 bg-white p-7 shadow-card md:p-10"
                >
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">{section.heading}</h2>
                  <div className="mt-5 space-y-4 text-sm leading-7 text-muted md:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="mt-5 grid gap-3">
                      {section.bullets.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-7 text-muted md:text-base">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine-800" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {relatedLinks && relatedLinks.length > 0 ? (
            <section className="border-t border-ink/5 px-4 py-16 md:px-8">
              <div className="mx-auto max-w-6xl">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">Who else we support</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group rounded-3xl border border-ink/5 bg-white p-6 transition-colors hover:border-pine-900/15 hover:shadow-card"
                    >
                      <p className="text-sm font-semibold text-ink group-hover:text-pine-800">{link.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="px-4 pb-20 md:px-8">
            <div className="mx-auto max-w-6xl rounded-[32px] bg-pine-900 px-6 py-14 text-center text-paper md:px-12 md:py-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Work with VAxAI</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                Ready to understand where support would help most?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-paper/65 md:text-base">
                We start with how work happens today, then recommend the right mix of virtual assistance, AI,
                automation and human support for your organisation.
              </p>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:brightness-[1.04]"
              >
                Book a discovery call
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>

        <SiteFooter />
        <SimplifiedModeToggle />
      </div>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}