"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck, X } from "lucide-react";
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
  pricingNotes: string[];
  relatedLinks?: RelatedLink[];
};

export default function ServiceLandingPage({
  eyebrow,
  title,
  intro,
  sections,
  pricingNotes,
  relatedLinks,
}: ServiceLandingPageProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

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
                  href="#access-to-work"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white"
                >
                  Learn about Access to Work
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

          <section className="px-4 md:px-8">
            <div className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-pine-900/10 bg-pine-50/70 p-6 text-sm leading-7 text-muted md:grid-cols-2 md:gap-10 md:p-8">
              {pricingNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </section>

          <section id="access-to-work" className="scroll-mt-24 px-4 pb-4 md:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-pine-900/10 bg-pine-900 px-7 py-8 text-paper md:flex-row md:items-center md:justify-between md:p-9">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">Access to Work</p>
                <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight tracking-tight">
                  Your VAxAI support could cost you nothing
                </h2>
                <p className="mt-2 text-sm leading-7 text-paper/65">Want to find out more?</p>
              </div>
              <button
                type="button"
                onClick={() => setAccessOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:brightness-[1.04]"
              >
                Learn about Access to Work
                <ArrowRight className="h-4 w-4" />
              </button>
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

      {accessOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-work-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-6 rounded-t-[28px] bg-pine-900 px-6 py-6 text-paper md:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Access to Work</p>
                <h2 id="access-work-title" className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                  Your support might cost you nothing
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAccessOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper transition-colors duration-200 hover:bg-white/20"
                aria-label="Close Access to Work information"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.9fr] md:p-10">
              <div>
                <p className="text-base leading-7 text-muted">
                  If you are eligible, Access to Work may cover some or all of your VAxAI support. We can help you
                  understand what evidence and admin may be needed, while Access to Work makes the final decision.
                </p>

                <div className="mt-6 rounded-2xl border border-ink/10 bg-cream/70 p-5">
                  <p className="text-sm font-semibold text-ink">What we do not do</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
                    <li>We do not decide whether you are eligible or guarantee funding.</li>
                    <li>We do not make decisions on behalf of Access to Work.</li>
                    <li>Access to Work assesses each application and confirms approved support.</li>
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessOpen(false);
                      setContactOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:bg-pine-800"
                  >
                    Talk to us about Access to Work
                  </button>
                  <a
                    href="https://www.gov.uk/access-to-work"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white"
                  >
                    Official GOV.UK guidance
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-pine-900/15 bg-white p-5">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-900 text-acid">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">Government-backed support</h3>
                    <p className="mt-1 text-sm text-muted">A grant, not a loan or benefit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}