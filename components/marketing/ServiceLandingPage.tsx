"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck, X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type { AudienceWayOfWorking, WaysOfWorkingBlock } from "@/lib/seo/audience-pages";

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
  waysOfWorking: WaysOfWorkingBlock;
  relatedLinks?: RelatedLink[];
  showAccessToWork?: boolean;
};

function AudiencePlanCard({
  plan,
  onContact,
}: {
  plan: AudienceWayOfWorking;
  onContact: () => void;
}) {
  const featured = Boolean(plan.featured);

  return (
    <article
      className={`relative flex flex-col rounded-[28px] border p-7 md:p-8 ${
        featured
          ? "border-pine-900 bg-pine-900 text-paper shadow-lift lg:-mt-4"
          : "border-ink/10 bg-white shadow-card"
      }`}
    >
      <div className="flex min-h-7 items-center justify-between gap-4">
        <span
          className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${
            featured
              ? "border border-white/15 bg-white/10 text-acid"
              : "border border-pine-900/15 bg-pine-50 text-pine-800"
          }`}
        >
          {plan.step}
        </span>
        {featured ? (
          <span className="rounded-full bg-acid px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
            Recommended
          </span>
        ) : null}
      </div>
      <p
        className={`mt-7 text-[11px] font-bold uppercase tracking-[0.16em] ${
          featured ? "text-acid/80" : "text-muted"
        }`}
      >
        {plan.title}
      </p>
      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{plan.label}</h3>
      <div className={`mt-4 space-y-3 text-sm leading-7 ${featured ? "text-paper/70" : "text-muted"}`}>
        {plan.copy.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {featured ? (
        <button
          type="button"
          onClick={onContact}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:brightness-[1.04]"
        >
          Book a discovery call
        </button>
      ) : null}
    </article>
  );
}

export default function ServiceLandingPage({
  eyebrow,
  title,
  intro,
  sections,
  waysOfWorking,
  relatedLinks,
  showAccessToWork = false,
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
                  href="#ways-of-working"
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

          <section id="ways-of-working" className="border-t border-ink/5 bg-white px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-700">
                  {waysOfWorking.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink md:text-[2.75rem]">
                  {waysOfWorking.title}
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted md:text-base md:leading-8">
                  {waysOfWorking.intro}
                </p>
              </div>

              <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
                {waysOfWorking.plans.map((plan) => (
                  <AudiencePlanCard key={plan.step} plan={plan} onContact={() => setContactOpen(true)} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 rounded-3xl border border-pine-900/10 bg-pine-50/70 p-6 text-sm leading-7 text-muted md:grid-cols-2 md:gap-10 md:p-8">
                {waysOfWorking.pricingNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          </section>

          {showAccessToWork ? (
            <section className="px-4 pb-4 md:px-8">
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
          ) : null}

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