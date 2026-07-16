"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import FilingTab from "@/components/FilingTab";
import { experts } from "@/lib/experts";
import type { Expert } from "@/lib/experts";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const viewport = { once: true, margin: "-70px" } as const;

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
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
  return <FilingTab light={light}>{children}</FilingTab>;
}

function ExpertProfileCard({ expert }: { expert: Expert }) {
  return (
    <article
      aria-label={`${expert.name}, ${expert.role}`}
      className="group relative overflow-hidden rounded-[24px] shadow-card ring-1 ring-ink/5"
    >
      <div
        className="simplified-photo aspect-[4/5] bg-cover bg-center transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${expert.photo})` }}
        aria-hidden="true"
      />
      <div
        className="photo-text-overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{expert.role}</p>
        <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white md:text-xl">{expert.name}</h3>
        <a
          href={expert.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 transition-colors hover:text-white"
        >
          Connect
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
}

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="dark" />
        </header>

        <main className="overflow-x-hidden">
          {/* Hero — geometric mark, no photo */}
          <section className="relative overflow-hidden bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-24">
            <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-pine-700/45 blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-8%] h-80 w-80 rounded-full bg-acid/[0.06] blur-3xl" />
            </div>
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <Eyebrow light>About VAxAI</Eyebrow>
                <h1 className="mt-5 max-w-xl text-[2.2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.5rem] md:mt-6 md:text-[2.75rem]">
                  Built through experience, not theory.
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-paper/70 md:text-base md:leading-8">
                  VAxAI is a service by MT1L, home of the Value, Trust and Alignment (VTA) Framework and
                  founded by Thesia Kouloungou. She and Rebecca Bradshaw, her virtual assistant turned
                  business partner and VAxAI co-founder, shaped the service together, one building the
                  business, one delivering the admin, so clients get support grounded in both sides of
                  the work.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
                className="relative mx-auto flex w-full max-w-sm items-center justify-center md:max-w-none"
                aria-hidden="true"
              >
                <div className="relative aspect-square w-full max-w-[320px]">
                  <div className="absolute inset-[8%] rotate-6 rounded-[32px] border border-white/10 bg-white/[0.04]" />
                  <div className="absolute inset-[16%] -rotate-3 rounded-[28px] border border-white/12 bg-pine-800/80" />
                  <div className="absolute inset-[22%] flex items-center justify-center rounded-[24px] bg-pine-950/60 ring-1 ring-acid/30">
                    <img
                      src="/vaxai-logo.png"
                      alt=""
                      className="h-14 w-auto opacity-95 sm:h-16"
                    />
                  </div>
                  <div className="absolute -right-2 top-1/4 h-16 w-16 rounded-full bg-acid/90 blur-[1px]" />
                  <div className="absolute bottom-[18%] left-0 h-10 w-10 rounded-full border-2 border-acid/50" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Story */}
          <section className="px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="mx-auto max-w-3xl">
                <div className="space-y-6 text-base leading-8 text-muted md:space-y-7 md:text-[1.0625rem] md:leading-8">
                  <p>
                    VAxAI wasn&apos;t created from a business plan. It grew from the way we were already
                    working.
                  </p>
                  <p>
                    While building MT1L, Thesia explored how AI could support a range of tasks in different
                    areas of the work. Like many organisations, she quickly discovered that AI worked best
                    when the right foundations were already in place.
                  </p>
                  <ul className="space-y-3 border-l-2 border-acid py-1 pl-5">
                    <li>The quality of the information going in mattered.</li>
                    <li>Processes needed to be organised.</li>
                    <li>Documents needed to be consistent.</li>
                    <li>Systems needed to make sense.</li>
                  </ul>
                  <p>Without that foundation, AI could only do so much.</p>
                  <p>
                    Once Rebecca joined as her virtual assistant, they began refining their ways of
                    working, testing different approaches that combined AI with practical administrative
                    support and learning what genuinely improved the way work got done. Every improvement
                    taught them something new - not just about technology, but about the importance of
                    preparation, organisation and human oversight.
                  </p>
                  <p>
                    Conversations with leaders across various industries, together with their own experience
                    and professional backgrounds, made them realise this wasn&apos;t just a challenge they
                    were solving for themselves. It reflected a much broader need, particularly as
                    organisations across every sector began exploring AI.
                  </p>
                  <p>
                    Today, they help founders, SMEs, charities and public sector organisations build the
                    foundations that allow AI and automation to create real value, working with a network of
                    professional freelance virtual assistants. Together they prepare administration, provide
                    ongoing operational support and help maintain the systems that keep work running smoothly.
                  </p>
                </div>
                <div className="mt-12 border-t border-ink/10 pt-10 md:mt-14 md:pt-12">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xl font-semibold tracking-tight md:text-2xl">
                    <span>Prepare</span>
                    <ArrowRight className="h-5 w-5 text-pine-700" aria-hidden="true" />
                    <span>Support</span>
                    <ArrowRight className="h-5 w-5 text-pine-700" aria-hidden="true" />
                    <span>Maintain</span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted md:text-base">
                    Always with experienced people in the loop.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* People — after the story */}
          <section className="bg-cream/40 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow>The people behind VAxAI</Eyebrow>
              </Reveal>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
                {experts.map((expert) => (
                  <Reveal key={expert.name}>
                    <ExpertProfileCard expert={expert} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="px-4 pb-20 pt-4 md:px-8 md:pb-28 md:pt-8">
            <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-pine-900 px-6 py-14 text-center text-paper md:px-12 md:py-16">
              <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-24 left-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
                <div className="absolute bottom-[-30%] right-[25%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
                  The future of admin is not AI instead of people. It is people, supported by AI.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-paper/65 md:text-base md:leading-8">
                  That&apos;s what we&apos;ve built the whole service around. Tell us where administration is
                  slowing you down and we&apos;ll tell you what we&apos;d do about it, starting with a free
                  Admin Review.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                    Get your free Admin Review
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="https://mt1l.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper/90 transition-colors duration-300 hover:border-white/40 hover:text-paper"
                  >
                    Check out MT1L
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-4 text-xs text-paper/50">A structured review of your administrative operations. Free, with no obligation.</p>
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
