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
      className="group relative overflow-hidden rounded-[28px]"
    >
      <div
        className="simplified-photo aspect-[0.9] bg-cover bg-center transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${expert.photo})` }}
        aria-hidden="true"
      />
      <div
        className="photo-text-overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{expert.role}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{expert.name}</h3>
        <a
          href={expert.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 transition-colors hover:text-white"
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
          {/* About + people images */}
          <section className="px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-14">
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <Eyebrow>About VAxAI</Eyebrow>
                <h1 className="mt-6 max-w-2xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.025em] md:text-5xl">
                  Built through experience, not theory.
                </h1>
                <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-muted md:text-lg">
                  <p>
                    VAxAI wasn&apos;t created from a business plan. It grew from the way we were already
                    working.
                  </p>
                  <p>
                    While building MT1L, we explored how AI could support research, administration, content
                    creation and day-to-day operations. Like many organisations, we quickly discovered that
                    AI worked best when the right foundations were already in place.
                  </p>
                  <ul className="space-y-2 border-l-2 border-acid pl-5">
                    <li>The quality of the information going in mattered.</li>
                    <li>Processes needed to be organised.</li>
                    <li>Documents needed to be consistent.</li>
                    <li>Systems needed to make sense.</li>
                  </ul>
                  <p>Without that foundation, AI could only do so much.</p>
                  <p>
                    As we refined our own ways of working, we began testing different approaches, combining
                    AI with practical administrative support and continually learning what genuinely
                    improved the way work got done. Every improvement taught us something new - not just
                    about technology, but about the importance of preparation, organisation and human
                    oversight.
                  </p>
                  <p>
                    Conversations with leaders across various industries, together with our own experience
                    and professional backgrounds, made us realise this wasn&apos;t just a challenge we were
                    solving for ourselves. It reflected a much broader need, particularly as organisations
                    across every sector began exploring AI.
                  </p>
                  <p>
                    Today, we help founders, SMEs, charities and public sector organisations build the
                    foundations that allow AI and automation to create real value. We prepare
                    administration, provide ongoing operational support and help maintain the systems that
                    keep work running smoothly.
                  </p>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xl font-semibold tracking-tight md:text-2xl">
                  <span>Prepare</span>
                  <ArrowRight className="h-5 w-5 text-pine-700" aria-hidden="true" />
                  <span>Support</span>
                  <ArrowRight className="h-5 w-5 text-pine-700" aria-hidden="true" />
                  <span>Maintain</span>
                </div>
                <p className="mt-4 text-sm font-medium text-muted md:text-base">
                  Always with experienced people in the loop.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="grid gap-6"
              >
                {experts.map((expert) => (
                  <ExpertProfileCard key={expert.name} expert={expert} />
                ))}
              </motion.div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="px-4 pb-16 md:px-8 md:pb-24">
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
