"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ExternalLink, ShieldCheck, X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type { AudiencePage } from "@/lib/seo/audience-pages";

export type RelatedAudienceLink = {
  href: string;
  label: string;
  description: string;
  linkLabel: string;
};

type ServiceLandingPageProps = {
  page: AudiencePage;
  relatedLinks: RelatedAudienceLink[];
};

/* Motion primitives — same easing and reveal language as the homepage */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const viewport = { once: true, margin: "-70px" } as const;

function Reveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

function Stagger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 ease-premium hover:bg-pine-800 hover:shadow-lift",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
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

export default function ServiceLandingPage({ page, relatedLinks }: ServiceLandingPageProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const { pressures, delayed, how, changes } = page;

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="light" />
        </header>

        <main>
          {/* Hero — light, editorial, generous air */}
          <section className="relative overflow-hidden px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
            <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-pine-100/60 blur-3xl" />
              <div className="absolute bottom-[-40%] left-[-6%] h-80 w-80 rounded-full bg-acid/[0.08] blur-3xl" />
            </div>
            <motion.div
              className="relative mx-auto max-w-6xl"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp}>
                <Eyebrow>Who we support · {page.audienceName}</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="mt-6 max-w-3xl text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.025em] text-ink md:text-6xl"
              >
                {page.title}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-2xl text-base leading-8 text-muted md:text-lg"
              >
                {page.intro}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <button type="button" onClick={() => setContactOpen(true)} className={btn.primary}>
                  Start your workflow review
                  <ArrowRight className="h-4 w-4" />
                </button>
                {page.heroHasAccessCta ? (
                  <button type="button" onClick={() => setAccessOpen(true)} className={btn.ghostLight}>
                    Learn about Access to Work
                  </button>
                ) : null}
              </motion.div>
            </motion.div>
          </section>

          {/* Lived understanding — optional editorial pause */}
          {page.understanding ? (
            <section className="px-4 pb-6 md:px-8">
              <Reveal className="mx-auto max-w-6xl rounded-[32px] border border-pine-900/10 bg-gradient-to-br from-pine-50 via-cream/70 to-paper p-8 md:p-12">
                <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
                  <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-3xl">
                    {page.understanding.heading}
                  </h2>
                  <div className="space-y-4 text-sm leading-7 text-muted md:text-base md:leading-8">
                    {page.understanding.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>
          ) : null}

          {/* Pressures — white panel, two-column list */}
          <section className="px-4 py-10 md:px-8 md:py-14">
            <Reveal className="mx-auto max-w-6xl rounded-[32px] border border-ink/5 bg-white p-7 shadow-card md:p-12">
              <div className="md:flex md:items-end md:justify-between md:gap-12">
                <div className="max-w-md">
                  <Eyebrow>Where pressure builds</Eyebrow>
                  <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                    {pressures.heading}
                  </h2>
                </div>
                <div className="mt-5 max-w-md space-y-4 text-sm leading-7 text-muted md:mt-0">
                  {pressures.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <Stagger className="mt-10 grid gap-x-10 gap-y-4 border-t border-ink/5 pt-8 md:grid-cols-2">
                {(pressures.bullets ?? []).map((item) => (
                  <motion.div key={item} variants={fadeUp} className="flex gap-3">
                    <span className="mt-[11px] h-1 w-3 shrink-0 rounded-full bg-ink/20" aria-hidden="true" />
                    <p className="text-sm leading-7 text-muted">{item}</p>
                  </motion.div>
                ))}
              </Stagger>
            </Reveal>
          </section>

          {/* Delayed — dark pine panel, the emotional pivot */}
          <section className="px-4 py-10 md:px-8 md:py-14">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-pine-900 px-7 py-14 text-paper md:px-12 md:py-20">
              <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-pine-700/40 blur-3xl" />
                <div className="absolute bottom-[-25%] left-[-6%] h-80 w-80 rounded-full bg-acid/[0.06] blur-3xl" />
              </div>
              <div className="relative">
                <Reveal className="max-w-2xl">
                  <Eyebrow light>The cost of waiting</Eyebrow>
                  <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] text-paper md:text-4xl">
                    {delayed.heading}
                  </h2>
                  <div className="mt-6 space-y-4 text-sm leading-7 text-paper/70 md:text-base md:leading-8">
                    {delayed.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
                {delayed.bullets && delayed.bullets.length > 0 ? (
                  <>
                    {delayed.bulletsLabel ? (
                      <Reveal className="mt-10">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid/80">
                          {delayed.bulletsLabel}
                        </p>
                      </Reveal>
                    ) : null}
                    <Stagger className="mt-5 grid gap-x-10 gap-y-4 border-t border-white/10 pt-7 md:grid-cols-2">
                      {delayed.bullets.map((item) => (
                        <motion.div key={item} variants={fadeUp} className="flex gap-3">
                          <span className="mt-[11px] h-1 w-3 shrink-0 rounded-full bg-acid/40" aria-hidden="true" />
                          <p className="text-sm leading-7 text-paper/70">{item}</p>
                        </motion.div>
                      ))}
                    </Stagger>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          {/* How we help — open split layout, numbered editorial list */}
          <section className="px-4 py-14 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
              <Reveal>
                <Eyebrow>Practical support</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  {how.heading}
                </h2>
                <div className="mt-6 max-w-prose space-y-4 text-sm leading-7 text-muted md:text-base md:leading-8">
                  {how.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
              <div className="md:pt-1">
                {how.bulletsLabel ? (
                  <Reveal>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                      {how.bulletsLabel}
                    </p>
                  </Reveal>
                ) : null}
                <Stagger className="mt-2">
                  {(how.bullets ?? []).map((item, index) => (
                    <motion.div
                      key={item}
                      variants={fadeUp}
                      className="grid grid-cols-[3.25rem_1fr] gap-4 border-t border-pine-900/10 py-5 first:border-t-0 md:py-6"
                    >
                      <span className="pt-0.5 text-sm font-bold text-pine-700/50">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-7 text-ink md:text-base">{item}</p>
                    </motion.div>
                  ))}
                </Stagger>
              </div>
            </div>
          </section>

          {/* What changes — tonal pine panel with acid checks */}
          <section className="px-4 py-2 md:px-8">
            <Reveal className="mx-auto max-w-6xl rounded-[40px] border border-pine-900/10 bg-pine-50 p-7 md:p-12">
              <div className="max-w-2xl">
                <Eyebrow>{changes.heading}</Eyebrow>
                <div className="mt-5 space-y-4 text-base leading-8 text-ink md:text-lg">
                  {changes.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="font-medium tracking-[-0.01em]">{paragraph}</p>
                  ))}
                </div>
              </div>
              {changes.bulletsLabel ? (
                <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                  {changes.bulletsLabel}
                </p>
              ) : null}
              <Stagger className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
                {(changes.bullets ?? []).map((item) => (
                  <motion.div key={item} variants={fadeUp} className="flex gap-3">
                    <span className="mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                      ✓
                    </span>
                    <p className="text-sm leading-7 text-muted">{item}</p>
                  </motion.div>
                ))}
              </Stagger>
              {changes.closing ? (
                <p className="mt-10 max-w-2xl border-t border-pine-900/10 pt-7 text-base font-medium leading-8 text-pine-800">
                  {changes.closing}
                </p>
              ) : null}
            </Reveal>
          </section>

          {/* Pricing — quiet centred note */}
          <section className="px-4 py-14 md:px-8 md:py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <div className="flex justify-center">
                <Eyebrow>Pricing</Eyebrow>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted md:text-base md:leading-8">{page.pricingNote}</p>
            </Reveal>
          </section>

          {/* Access to Work — only where the audience copy includes it */}
          {page.accessToWork ? (
            <section id="access-to-work" className="scroll-mt-24 px-4 pb-14 md:px-8 md:pb-20">
              <Reveal className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[32px] bg-pine-900 p-7 text-paper md:flex-row md:items-center md:justify-between md:gap-12 md:p-10">
                <div>
                  <Eyebrow light>Access to Work</Eyebrow>
                  <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                    {page.accessToWork.heading}
                  </h2>
                  <div className="mt-4 max-w-xl space-y-3 text-sm leading-7 text-paper/70">
                    {page.accessToWork.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAccessOpen(true)}
                  className={`${btn.accent} shrink-0`}
                >
                  Learn about Access to Work
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Reveal>
            </section>
          ) : null}

          {/* Who else we support */}
          {relatedLinks.length > 0 ? (
            <section className="relative px-4 py-16 md:px-8 md:py-20">
              <div
                className="simplified-hide pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent"
                aria-hidden="true"
              />
              <div className="mx-auto max-w-6xl">
                <Reveal>
                  <Eyebrow>Who else we support</Eyebrow>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                    Support shaped around other ways of working
                  </h2>
                </Reveal>
                <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
                  {relatedLinks.map((link) => (
                    <motion.div key={link.href} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }}>
                      <Link
                        href={link.href}
                        className="group flex h-full flex-col rounded-3xl border border-ink/5 bg-white p-6 shadow-card transition-shadow duration-500 ease-premium hover:shadow-lift md:p-7"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-700">{link.label}</p>
                        <p className="mt-3 flex-1 text-sm leading-7 text-muted">{link.description}</p>
                        <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-pine-800">
                          {link.linkLabel}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </Stagger>
              </div>
            </section>
          ) : null}

          {/* Closing CTA — pine panel bookend */}
          <section className="px-4 pb-20 md:px-8 md:pb-24">
            <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-pine-900 px-6 py-14 text-center text-paper md:px-12 md:py-16">
              <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-24 left-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
                <div className="absolute bottom-[-30%] right-[25%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
              </div>
              <div className="relative">
                <div className="flex justify-center">
                  <Eyebrow light>Work with VAxAI</Eyebrow>
                </div>
                <h2 className="mx-auto mt-4 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  Ready to understand where support would help most?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-paper/65 md:text-base md:leading-8">
                  We start with how work happens today, then recommend the right mix of virtual assistance, AI,
                  automation, better processes and human support for your context.
                </p>
                <button type="button" onClick={() => setContactOpen(true)} className={`${btn.accent} mt-9`}>
                  Book a discovery call
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
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
                    className={btn.primary}
                  >
                    Talk to us about Access to Work
                  </button>
                  <a
                    href="https://www.gov.uk/access-to-work"
                    target="_blank"
                    rel="noreferrer"
                    className={btn.ghostLight}
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
