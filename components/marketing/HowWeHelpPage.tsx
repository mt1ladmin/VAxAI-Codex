"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
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

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
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

type SupportArea = {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  listLabel: string;
  items: string[];
  example: string;
};

const supportAreas: SupportArea[] = [
  {
    id: "area-backlog",
    number: "Support area 01",
    title: "Backlog recovery",
    paragraphs: [
      "When routine administration builds faster than your team can manage, everything else slows down: delayed services, pressure on staff, rising error risk and time pulled away from core work.",
      "Backlogs rarely happen because people aren't working hard enough. They happen because demand grows, resources are limited and routine work loses to urgent priorities.",
    ],
    listLabel: "We help you",
    items: [
      "Review, clean and organise documents and records",
      "Improve data quality and remove duplicates",
      "Process outstanding reports and compliance work",
      "Document workflows so the backlog doesn't rebuild",
    ],
    example:
      "A local authority team with unprocessed records, correspondence volumes and outdated databases. We organise the information, reduce the backlog and prepare processes for future improvement.",
  },
  {
    id: "area-ai",
    number: "Support area 02",
    title: "AI & automation readiness",
    paragraphs: [
      "AI can accelerate good processes. It cannot replace the groundwork. Successful adoption depends on accurate information, clear workflows, appropriate access controls and human oversight.",
      "We prepare your organisation so the tools you choose can actually work. We don't build or sell the AI itself, which means our only interest is your readiness.",
    ],
    listLabel: "We help you",
    items: [
      "Organise documents and knowledge for AI tools",
      "Separate internal, confidential and shareable information",
      "Standardise data so automation behaves predictably",
      "Map and document processes worth automating",
    ],
    example:
      "A founder wants an AI assistant that answers questions about their business. Before it can work reliably, the shared drive needs reviewing so it isn't pulling from outdated policies, duplicates or files it should never access.",
  },
  {
    id: "area-ongoing",
    number: "Support area 03",
    title: "Ongoing admin support",
    paragraphs: [
      "Even with AI, essential tasks still need human attention: judgement calls, exceptions, coordination and the routine work that keeps an organisation moving.",
      "We provide reliable administrative capacity so your team spends less time managing routine tasks and more time on higher-value priorities.",
    ],
    listLabel: "We help with",
    items: [
      "Inbox, calendar and meeting coordination",
      "Reporting and data collection",
      "Document management",
      "HR, finance, compliance and project administration",
    ],
    example:
      "A growing SME automates invoicing, but still needs someone to review exceptions, update records and make sure nothing falls through the gaps.",
  },
  {
    id: "area-maintain",
    number: "Support area 04",
    title: "Maintain & improve",
    paragraphs: [
      "A cleared backlog returns if nobody maintains the system. New documents arrive, staff change, processes evolve and data grows.",
      "We help organisations move from constantly catching up to staying in control.",
    ],
    listLabel: "We help you",
    items: [
      "Run regular admin health checks",
      "Keep documents and data clean and current",
      "Review processes as your organisation changes",
      "Monitor AI outputs and catch new bottlenecks early",
    ],
    example:
      "A leadership team adopts AI meeting notes, but nobody reviews the actions or routes information to the right people. Human support keeps the process working.",
  },
];

const comparisonRows: [string, string, string][] = [
  [
    "Capacity",
    "Competes with day jobs, so preparation gets delayed and backlogs keep growing.",
    "Dedicated capacity, so groundwork actually gets done.",
  ],
  [
    "Focus",
    "Senior people absorbed by routine admin instead of strategy, funding and delivery.",
    "Your team stays on the work only they can do.",
  ],
  [
    "Quality & risk",
    "Rushed cleanup leads to inconsistent data, and expensive AI or automation failures later.",
    "Specialists who do this daily, working to consistent standards with compliance in mind.",
  ],
  [
    "Afterwards",
    "Improvements slip once the project pressure passes.",
    "Maintenance keeps systems in shape, with periodic reviews alongside your own oversight.",
  ],
];

export default function HowWeHelpPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="dark" />
        </header>

        <main className="overflow-x-hidden">
          {/* Intro — dark editorial opening */}
          <section className="relative bg-pine-900 text-paper">
            <div className="simplified-hide pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 right-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
              <div className="absolute bottom-[-30%] left-[-6%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
            </div>
            <motion.div
              className="relative mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24"
              initial="hidden"
              animate="show"
              variants={fadeUp}
            >
              <Eyebrow light>How we help</Eyebrow>
              <h1 className="mt-6 max-w-3xl text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.025em] md:text-5xl">
                Practical support for the administrative challenges that slow organisations down
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-paper/70 md:text-lg">
                From clearing backlogs to preparing for AI and automation, we help organisations organise
                information, improve processes and maintain the systems they rely on every day.
              </p>
              <div className="mt-10">
                <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                  Get your free Admin Health Check
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </section>

          {/* Four support areas */}
          <section className="px-4 md:px-8">
            <div className="mx-auto max-w-6xl">
              {supportAreas.map((area, index) => (
                <Reveal
                  key={area.id}
                  id={area.id}
                  className={`grid scroll-mt-28 gap-10 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-20 ${
                    index < supportAreas.length - 1 ? "border-b border-ink/10" : ""
                  }`}
                >
                  <div>
                    <Eyebrow>{area.number}</Eyebrow>
                    <h2 className="mt-4 text-2xl font-semibold leading-[1.1] tracking-[-0.02em] md:text-3xl">
                      {area.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-base leading-8 text-muted">
                      {area.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="rounded-3xl border border-pine-900/10 bg-white/80 p-6 shadow-card md:p-8">
                      <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                        {area.listLabel}
                      </p>
                      <div className="grid gap-4">
                        {area.items.map((item) => (
                          <div key={item} className="flex gap-3">
                            <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                              ✓
                            </span>
                            <p className="text-sm leading-7 text-muted md:text-[15px]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-r-2xl border-l-[3px] border-pine-700 bg-pine-50/70 px-6 py-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">For example</p>
                      <p className="mt-2 text-sm leading-7 text-ink md:text-[15px]">{area.example}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* In-house or external comparison */}
          <section className="bg-cream/60 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow>In-house or external?</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
                  Why teams bring this work to us
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
                  In-house can make sense for small, simple backlogs where staff genuinely have spare
                  capacity. That&apos;s rarely the situation when a backlog exists in the first place.
                </p>
              </Reveal>
              <Reveal className="mt-10 overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 bg-cream/80">
                        <th className="px-6 py-4" aria-label="Comparison area" />
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                          Handled in-house
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-pine-800">
                          With VAxAI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map(([label, inHouse, withUs], index) => (
                        <tr
                          key={label}
                          className={index < comparisonRows.length - 1 ? "border-b border-ink/10" : ""}
                        >
                          <td className="w-[22%] px-6 py-5 align-top font-semibold text-ink">{label}</td>
                          <td className="px-6 py-5 align-top leading-7 text-muted">{inHouse}</td>
                          <td className="px-6 py-5 align-top leading-7 text-muted">{withUs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
              <Reveal>
                <p className="mt-8 max-w-2xl text-sm leading-7 text-muted">
                  The cost of inaction, in delays, lost opportunities, staff turnover and failed digital
                  projects, usually exceeds the cost of targeted external support.
                </p>
              </Reveal>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="px-4 py-16 md:px-8 md:py-24">
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
                  Not sure where to start?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-paper/65 md:text-base md:leading-8">
                  That&apos;s what the Admin Health Check is for. We&apos;ll look at where pressure is building and
                  tell you honestly what would help, and what wouldn&apos;t.
                </p>
                <button type="button" onClick={() => setContactOpen(true)} className={`${btn.accent} mt-9`}>
                  Get your free Admin Health Check
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-4 text-xs text-paper/50">A short conversation and review. No obligation.</p>
              </div>
            </Reveal>
          </section>
        </main>

        <SiteFooter />
        <SimplifiedModeToggle />
      </div>

      <PublicContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
