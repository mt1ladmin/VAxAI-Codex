"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGroup, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, X } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type { AudiencePage, AudienceSection } from "@/lib/seo/audience-pages";
import { cn } from "@/lib/utils";

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

const HERO_IMAGES: Record<string, string> = {
  "founders-entrepreneurs": "/hero-remote-work-circles.jpg",
  "small-business": "/admin-systems-team.jpg",
  "charities-non-profits": "/footer-team-smiling.jpg",
  "neurodivergent-professionals": "/vaxai-support-control.jpg",
};

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
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper/90 transition-colors duration-300 hover:border-white/40 hover:text-paper",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
};

const pressureCardClass =
  "rounded-3xl border border-ink/5 bg-cream/50 px-5 py-5 shadow-card transition-colors duration-300 hover:border-pine-900/10 hover:bg-cream/80";

function PressureBulletCard({ item, index }: { item: string; index: number }) {
  return (
    <div className={pressureCardClass}>
      <span className="text-[11px] font-bold tracking-[0.14em] text-pine-800/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="mt-3 text-sm leading-7 text-muted">{item}</p>
    </div>
  );
}

function PressureBulletsPanel({ bullets }: { bullets: string[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(next, bullets.length - 1)));
  }

  const activeItem = bullets[index];

  return (
    <div>
      <div className="hidden md:flex md:flex-col md:gap-3">
        {bullets.map((item, cardIndex) => (
          <PressureBulletCard key={item} item={item} index={cardIndex} />
        ))}
      </div>

      <div className="md:hidden">
        <div
          className="relative"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const diff = touchStartX.current - event.changedTouches[0].clientX;
            if (diff > 48) goTo(index + 1);
            if (diff < -48) goTo(index - 1);
            touchStartX.current = null;
          }}
        >
          <motion.div
            key={activeItem}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <PressureBulletCard item={activeItem} index={index} />
          </motion.div>
        </div>

        {bullets.length > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous pressure"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-pine-800 transition-colors hover:border-pine-900/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {bullets.map((item, dotIndex) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  aria-label={`View pressure ${dotIndex + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    dotIndex === index ? "w-6 bg-pine-800" : "w-2 bg-pine-800/25"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === bullets.length - 1}
              aria-label="Next pressure"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-pine-800 transition-colors hover:border-pine-900/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const layoutTransition = { duration: 0.48, ease: EASE };

type LearnMoreSectionId = "delayed" | "how" | "changes";

type LearnMoreSection = {
  id: LearnMoreSectionId;
  badge: string;
  heading: string;
  collapsedClassName: string;
  collapsedTextClassName: string;
  accentClassName: string;
  expandedClassName: string;
};

function DelayedPanelContent({
  badge,
  section,
  showIntro = true,
}: {
  badge: string;
  section: AudienceSection;
  showIntro?: boolean;
}) {
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-pine-700/40 blur-3xl" />
        <div className="absolute bottom-[-25%] left-[-6%] h-80 w-80 rounded-full bg-acid/[0.06] blur-3xl" />
      </div>
      <div className="relative px-6 py-7 md:px-8 md:py-8">
        {showIntro ? (
          <>
            <Eyebrow light>{badge}</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] text-paper md:text-3xl">
              {section.heading}
            </h2>
          </>
        ) : null}
        <div className={cn("space-y-4 text-sm leading-7 text-paper/70 md:text-base md:leading-8", showIntro && "mt-6")}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowPanelContent({
  badge,
  section,
  showIntro = true,
}: {
  badge: string;
  section: AudienceSection;
  showIntro?: boolean;
}) {
  return (
    <div className="h-full overflow-y-auto px-6 py-7 md:px-8 md:py-8">
      {showIntro ? (
        <>
          <Eyebrow>{badge}</Eyebrow>
          <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
            {section.heading}
          </h2>
        </>
      ) : null}
      <div className={cn("space-y-4 text-base leading-8 text-muted", showIntro && "mt-6")}>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {(section.bullets ?? []).length > 0 ? (
        <>
          {section.bulletsLabel ? (
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              {section.bulletsLabel}
            </p>
          ) : null}
          <div className="mt-4 grid gap-px overflow-hidden rounded-[28px] border border-ink/5 bg-ink/5 md:grid-cols-2">
            {(section.bullets ?? []).map((item, index) => (
              <div key={item} className="bg-paper px-6 py-8 md:px-8">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-pine-900/15 bg-pine-50 text-xs font-bold text-pine-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-5 text-sm leading-7 text-muted md:text-[15px]">{item}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChangesPanelContent({
  badge,
  section,
  showIntro = true,
}: {
  badge: string;
  section: AudienceSection;
  showIntro?: boolean;
}) {
  return (
    <div className="h-full overflow-y-auto px-6 py-7 md:px-8 md:py-8">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          {showIntro ? <Eyebrow>{badge}</Eyebrow> : null}
          <div className={cn("space-y-4 text-base leading-8 text-ink md:text-lg", showIntro && "mt-5")}>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="font-medium tracking-[-0.01em]">
                {paragraph}
              </p>
            ))}
          </div>
          {section.closing ? (
            <p className="mt-8 text-base font-medium leading-8 text-pine-800">{section.closing}</p>
          ) : null}
        </div>

        {(section.bullets ?? []).length > 0 ? (
          <div className="rounded-3xl border border-pine-900/10 bg-white/80 p-6 shadow-card backdrop-blur-sm md:p-8">
            {section.bulletsLabel ? (
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
                {section.bulletsLabel}
              </p>
            ) : null}
            <div className="grid gap-4">
              {(section.bullets ?? []).map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                    ✓
                  </span>
                  <p className="text-sm leading-7 text-muted md:text-[15px]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AudienceLearnMoreAccordion({
  delayed,
  how,
  changes,
}: {
  delayed: AudienceSection;
  how: AudienceSection;
  changes: AudienceSection;
}) {
  const [openId, setOpenId] = useState<LearnMoreSectionId>("delayed");
  const reduceMotion = useReducedMotion();

  const items: LearnMoreSection[] = [
    {
      id: "delayed",
      badge: "The cost of waiting",
      heading: delayed.heading,
      collapsedClassName: "bg-pine-900",
      collapsedTextClassName: "text-paper/90",
      accentClassName: "bg-acid",
      expandedClassName: "bg-pine-900 text-paper",
    },
    {
      id: "how",
      badge: "Practical support",
      heading: how.heading,
      collapsedClassName: "bg-cream",
      collapsedTextClassName: "text-ink/80",
      accentClassName: "bg-pine-800",
      expandedClassName: "border border-ink/5 bg-white text-ink",
    },
    {
      id: "changes",
      badge: changes.heading,
      heading: changes.heading,
      collapsedClassName: "bg-gradient-to-br from-pine-50 via-paper to-cream/80",
      collapsedTextClassName: "text-ink/80",
      accentClassName: "bg-pine-700",
      expandedClassName: "border border-pine-900/10 bg-gradient-to-br from-pine-50 via-paper to-cream/60 text-ink",
    },
  ];

  const renderPanelContent = (id: LearnMoreSectionId, showIntro = true) => {
    if (id === "delayed") {
      return <DelayedPanelContent badge="The cost of waiting" section={delayed} showIntro={showIntro} />;
    }
    if (id === "how") {
      return <HowPanelContent badge="Practical support" section={how} showIntro={showIntro} />;
    }
    return <ChangesPanelContent badge={changes.heading} section={changes} showIntro={showIntro} />;
  };

  const handleSelect = (id: LearnMoreSectionId) => {
    setOpenId(id);
  };

  return (
    <>
      <LayoutGroup>
        <div className="hidden h-[460px] gap-2 lg:flex" role="tablist" aria-label="Learn more topics">
          {items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isOpen}
                aria-expanded={isOpen}
                layout={!reduceMotion}
                onClick={() => handleSelect(item.id)}
                transition={{ layout: layoutTransition }}
                className={cn(
                  "group relative h-full overflow-hidden rounded-[28px] text-left shadow-card transition-shadow duration-300 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-800",
                  isOpen
                    ? "flex-[5] border border-ink/10"
                    : "flex-[1] min-w-[4.5rem] max-w-[5.5rem] border border-ink/5",
                  isOpen ? item.expandedClassName : item.collapsedClassName,
                )}
              >
                {isOpen ? (
                  <motion.div
                    key="expanded"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.28, delay: 0.08 }}
                    className="h-full w-full text-left"
                  >
                    {renderPanelContent(item.id)}
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative h-full w-full"
                  >
                    <div className={cn("absolute inset-x-0 bottom-0 h-1", item.accentClassName)} aria-hidden="true" />
                    <p
                      className={cn(
                        "absolute bottom-4 left-1/2 max-h-[72%] w-[calc(100%-0.75rem)] -translate-x-1/2 text-center text-[0.75rem] font-semibold leading-snug [writing-mode:vertical-rl] rotate-180",
                        item.collapsedTextClassName,
                      )}
                    >
                      {item.heading}
                    </p>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="flex flex-col gap-4 lg:hidden" role="tablist" aria-label="Learn more topics">
        {items.map((item) => {
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                "overflow-hidden rounded-[28px] shadow-card",
                isOpen ? item.expandedClassName : "border border-ink/5",
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isOpen}
                aria-expanded={isOpen}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-800",
                  item.collapsedClassName,
                )}
              >
                <div className="relative px-5 py-5">
                  <div className={cn("absolute inset-x-0 top-0 h-1", item.accentClassName)} aria-hidden="true" />
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.16em]",
                      item.id === "delayed" ? "text-acid/90" : "text-pine-700",
                    )}
                  >
                    {item.badge}
                  </p>
                  <h3
                    className={cn(
                      "mt-3 text-xl font-semibold leading-snug tracking-[-0.02em]",
                      item.id === "delayed" ? "text-paper" : "text-ink",
                    )}
                  >
                    {item.heading}
                  </h3>
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: EASE }}
                className="overflow-hidden"
              >
                <div className={cn("border-t border-ink/5", item.expandedClassName)}>
                  {renderPanelContent(item.id, false)}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </>
  );
}

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
  const heroImage = HERO_IMAGES[page.slug] ?? "/vaxai-support-control.jpg";

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
          <SiteNav variant="dark" />
        </header>

        <main className="overflow-x-hidden">
          {/* Hero — dark editorial opening with image */}
          <section className="relative bg-pine-900 text-paper">
            <div className="simplified-hide pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 right-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
              <div className="absolute bottom-[-30%] left-[-6%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
            </div>

            <motion.div
              className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.05fr_0.9fr] md:items-center md:gap-16 md:px-8 md:py-24 lg:py-28"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <div>
                <motion.div variants={fadeUp}>
                  <Eyebrow light>Who we support · {page.audienceName}</Eyebrow>
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  className="mt-6 max-w-2xl text-[2.35rem] font-semibold leading-[1.03] tracking-[-0.025em] md:text-5xl lg:text-[3.25rem]"
                >
                  {page.title}
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mt-7 max-w-xl text-base leading-8 text-paper/70 md:text-lg"
                >
                  {page.intro}
                </motion.p>
                <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                  <button type="button" onClick={() => setContactOpen(true)} className={btn.accent}>
                    Start your workflow review
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {page.heroHasAccessCta ? (
                    <a href="#access-to-work" className={btn.ghostDark}>
                      Learn about Access to Work
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </motion.div>
              </div>

              <motion.div
                variants={fadeUp}
                className="relative mx-auto w-full max-w-[420px] md:mx-0 md:justify-self-end"
              >
                <div
                  className="simplified-hide absolute -inset-3 rotate-2 rounded-[36px] border border-white/10 bg-white/[0.04]"
                  aria-hidden="true"
                />
                <div className="relative aspect-[0.86] overflow-hidden rounded-[28px] ring-1 ring-white/15">
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Lived understanding — optional editorial pause */}
          {page.understanding ? (
            <section className="bg-paper px-4 py-16 md:px-8 md:py-20">
              <Reveal className="mx-auto max-w-6xl rounded-[40px] border border-pine-900/10 bg-gradient-to-br from-pine-50 via-cream/70 to-paper p-8 md:p-12">
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

          {/* Pressures — lifted panel overlapping the hero */}
          <section className="relative scroll-mt-24 px-4 pb-8 pt-4 md:px-8 md:pb-12 md:pt-0">
            <Reveal className="relative mx-auto -mt-10 max-w-6xl rounded-[40px] border border-ink/5 bg-white px-6 py-14 shadow-lift md:-mt-14 md:px-12 md:py-20">
              <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
                <div className="lg:sticky lg:top-28">
                  <Eyebrow>Where pressure builds</Eyebrow>
                  <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
                    {pressures.heading}
                  </h2>
                  <div className="mt-6 space-y-4 text-base leading-8 text-muted">
                    {pressures.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {(pressures.bullets ?? []).length > 0 ? (
                  <PressureBulletsPanel bullets={pressures.bullets ?? []} />
                ) : null}
              </div>
            </Reveal>
          </section>

          {/* Learn more — expandable sections */}
          <section className="px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto max-w-6xl">
              <AudienceLearnMoreAccordion delayed={delayed} how={how} changes={changes} />
            </div>
          </section>

          {/* Pricing — minimal editorial pause */}
          <section className="px-4 py-20 md:px-8 md:py-28">
            <Reveal className="mx-auto max-w-6xl">
              <Eyebrow>Pricing</Eyebrow>
              <p className="mt-8 max-w-3xl text-base leading-8 text-muted md:text-lg">{page.pricingNote}</p>
            </Reveal>
          </section>

          {/* Access to Work — dark band transition */}
          {page.accessToWork ? (
            <section id="access-to-work" className="scroll-mt-24 px-4 md:px-8">
              <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-pine-900 px-6 py-10 text-paper md:px-10 md:py-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl">
                    <Eyebrow light>Access to Work</Eyebrow>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                      {page.accessToWork.heading}
                    </h2>
                    <div className="mt-4 max-w-xl space-y-3 text-sm leading-7 text-paper/70 md:text-base">
                      {page.accessToWork.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => setAccessOpen(true)} className={`${btn.accent} shrink-0`}>
                    Learn about Access to Work
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            </section>
          ) : null}

          {/* Who else we support — white panel with cards */}
          {relatedLinks.length > 0 ? (
            <section className="px-4 py-20 md:px-8 md:py-28">
              <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-ink/5 bg-white px-5 py-14 shadow-card md:px-12 md:py-20">
                <Reveal className="relative mx-auto max-w-xl text-center">
                  <Eyebrow>Who else we support</Eyebrow>
                  <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink md:text-[2.75rem]">
                    Explore more ways we can support you
                  </h2>
                </Reveal>

                <Stagger className="relative mt-12 grid gap-4 md:grid-cols-3">
                  {relatedLinks.map((link) => (
                    <motion.div key={link.href} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }}>
                      <Link
                        href={link.href}
                        className="group flex h-full flex-col rounded-3xl border border-ink/5 bg-white p-6 transition-colors duration-500 hover:border-pine-900/15 hover:shadow-card md:p-7"
                      >
                        <p className="text-sm font-semibold text-ink group-hover:text-pine-800">{link.label}</p>
                        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{link.description}</p>
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

          {/* Closing CTA */}
          <section className="px-4 pb-24 md:px-8">
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