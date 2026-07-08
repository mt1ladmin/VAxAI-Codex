"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type { AudiencePage, AudienceSection, JourneyStage } from "@/lib/seo/audience-pages";
import { sharedPricingBenefits, sharedPricingPackages } from "@/lib/seo/audience-pages";
import { cn } from "@/lib/utils";

type ServiceLandingPageProps = {
  page: AudiencePage;
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

type AudienceTabId = "pressures" | "how" | "changes" | "pricing" | "benefits";

function SupportJourney({ stages }: { stages: JourneyStage[] }) {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {stages.map((stage, index) => (
        <div
          key={stage.title}
          className="relative flex flex-col rounded-3xl border border-ink/5 bg-cream/40 px-6 py-7 md:px-7"
        >
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">
            {String(index + 1).padStart(2, "0")}. {stage.title}
          </h3>
          <div className="mt-3 space-y-3">
            {stage.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted md:text-[15px]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PressuresPanelContent({ section }: { section: AudienceSection }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
      <div>
        <Eyebrow>Where pressure builds</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
          {section.heading}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-8 text-muted">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      {(section.bullets ?? []).length > 0 ? (
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {(section.bullets ?? []).map((item, index) => (
            <motion.div key={item} variants={fadeUp}>
              <PressureBulletCard item={item} index={index} />
            </motion.div>
          ))}
        </Stagger>
      ) : null}
    </div>
  );
}

function HowPanelContent({
  badge,
  section,
  showIntro = true,
  onContact,
}: {
  badge: string;
  section: AudienceSection;
  showIntro?: boolean;
  onContact: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      {showIntro ? <Eyebrow>{badge}</Eyebrow> : null}
      {section.heading ? (
        <h2
          className={cn(
            "text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl",
            showIntro && "mt-4",
          )}
        >
          {section.heading}
        </h2>
      ) : null}
      {section.paragraphs.length > 0 ? (
        <div className={cn("space-y-4 text-base leading-8 text-muted", (showIntro || section.heading) && "mt-6")}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {(section.journey ?? []).length > 0 ? (
        <>
          {section.journeyLabel ? (
            <h2 className="mt-10 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
              {section.journeyLabel}
            </h2>
          ) : null}
          <SupportJourney stages={section.journey ?? []} />
          <button type="button" onClick={onContact} className={`${btn.primary} mt-8`}>
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </button>
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
    <div className="px-6 py-7 md:px-8 md:py-8">
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

const ACCESS_TO_WORK_URL = "https://www.gov.uk/access-to-work";

function PricingPanelContent({
  accessToWork,
  onContact,
  onViewBenefits,
}: {
  accessToWork?: { heading: string; paragraphs: string[] };
  onContact: () => void;
  onViewBenefits: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <Eyebrow>Pricing</Eyebrow>
      <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
        Our Pricing Structure
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {sharedPricingPackages.map((pkg) => (
          <div
            key={pkg.title}
            className="flex flex-col rounded-3xl border border-ink/5 bg-cream/40 px-5 py-6 md:px-6"
          >
            <h3 className="text-base font-semibold tracking-[-0.01em] text-ink md:text-lg">{pkg.title}</h3>
            {pkg.subtitle ? (
              <p className="mt-1 text-sm font-medium text-pine-800">{pkg.subtitle}</p>
            ) : null}
            <p className="mt-3 text-sm font-semibold text-ink">{pkg.priceLabel}</p>
            <p className="mt-4 text-sm leading-7 text-muted md:text-[15px]">{pkg.intro}</p>
            <ul className="mt-4 space-y-3">
              {pkg.bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                    ✓
                  </span>
                  <span className="text-sm leading-7 text-muted md:text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-muted md:text-[15px]">{pkg.closing}</p>
          </div>
        ))}
      </div>

      <button type="button" onClick={onViewBenefits} className={`${btn.ghostLight} mt-8`}>
        The benefits of our pricing strategy
        <ArrowRight className="h-4 w-4" />
      </button>

      {accessToWork ? (
        <div
          id="access-to-work"
          className="scroll-mt-24 mt-8 rounded-3xl border border-pine-900/10 bg-pine-50/60 px-6 py-6 md:px-7"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">Access to Work</p>
          <h3 className="mt-3 text-base font-semibold tracking-[-0.01em] text-ink md:text-lg">
            {accessToWork.heading}
          </h3>
          <div className="mt-3 max-w-3xl space-y-3 text-sm leading-7 text-muted md:text-[15px]">
            {accessToWork.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <a
            href={ACCESS_TO_WORK_URL}
            target="_blank"
            rel="noreferrer"
            className={`${btn.primary} mt-6`}
          >
            Learn about Access to Work
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onContact} className={btn.accent}>
          Start your workflow review
          <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={onContact} className={btn.ghostLight}>
          Get in touch to discuss your quote
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PricingBenefitsPanelContent({ section }: { section: AudienceSection }) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <Eyebrow>Pricing benefits</Eyebrow>
      <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
        {section.heading}
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-muted">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {(section.bullets ?? []).length > 0 ? (
        <div className="mt-8 grid gap-4">
          {(section.bullets ?? []).map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-ink/5 bg-cream/40 px-5 py-4">
              <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                ✓
              </span>
              <p className="text-sm leading-7 text-muted md:text-[15px]">{item}</p>
            </div>
          ))}
        </div>
      ) : null}
      {section.closing ? (
        <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-pine-800">{section.closing}</p>
      ) : null}
    </div>
  );
}

function AudienceTabbedSections({
  pressures,
  how,
  changes,
  pricingBenefits,
  accessToWorkInPricing,
  onContact,
}: {
  pressures: AudienceSection;
  how: AudienceSection;
  changes: AudienceSection;
  pricingBenefits: AudienceSection;
  accessToWorkInPricing?: { heading: string; paragraphs: string[] };
  onContact: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AudienceTabId>("pressures");

  useEffect(() => {
    function syncTabFromHash() {
      if (window.location.hash === "#pricing-benefits") {
        setActiveTab("benefits");
        return;
      }
      if (accessToWorkInPricing && window.location.hash === "#access-to-work") {
        setActiveTab("pricing");
      }
    }

    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, [accessToWorkInPricing]);

  const tabs: { id: AudienceTabId; label: string }[] = [
    { id: "pressures", label: pressures.heading },
    { id: "how", label: "How we help" },
    { id: "changes", label: changes.heading },
    { id: "pricing", label: "Pricing" },
    { id: "benefits", label: "Why our pricing" },
  ];

  const panelClassName: Record<AudienceTabId, string> = {
    pressures: "bg-white text-ink",
    how: "rounded-[28px] border border-ink/5 bg-white text-ink",
    changes:
      "rounded-[28px] border border-pine-900/10 bg-gradient-to-br from-pine-50 via-paper to-cream/60 text-ink",
    pricing: "rounded-[28px] border border-ink/5 bg-white text-ink",
    benefits: "rounded-[28px] border border-ink/5 bg-white text-ink",
  };

  function openBenefitsTab() {
    setActiveTab("benefits");
    window.history.replaceState(null, "", "#pricing-benefits");
  }

  return (
    <div>
      <div
        className="-mx-2 flex gap-2 overflow-x-auto border-b border-ink/10 px-2 pb-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="tablist"
        aria-label="Explore how VAxAI can support you"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`audience-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-800",
                isActive
                  ? "bg-pine-900 text-paper"
                  : "bg-cream/70 text-ink/75 hover:bg-cream hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        id={`audience-panel-${activeTab}`}
        role="tabpanel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn("mt-8", panelClassName[activeTab])}
      >
        {activeTab === "pressures" ? <PressuresPanelContent section={pressures} /> : null}
        {activeTab === "how" ? (
          <HowPanelContent badge="How we help" section={how} onContact={onContact} />
        ) : null}
        {activeTab === "changes" ? (
          <ChangesPanelContent badge={changes.heading} section={changes} />
        ) : null}
        {activeTab === "pricing" ? (
          <PricingPanelContent
            accessToWork={accessToWorkInPricing}
            onContact={onContact}
            onViewBenefits={openBenefitsTab}
          />
        ) : null}
        {activeTab === "benefits" ? <PricingBenefitsPanelContent section={pricingBenefits} /> : null}
      </motion.div>
    </div>
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

export default function ServiceLandingPage({ page }: ServiceLandingPageProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const { pressures, how, changes } = page;
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
                    <a
                      href={ACCESS_TO_WORK_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={btn.ghostDark}
                    >
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

          {/* Tabbed sections — lifted panel overlapping the hero */}
          <section className="relative scroll-mt-24 px-4 pb-8 pt-4 md:px-8 md:pb-12 md:pt-0">
            <Reveal className="relative mx-auto -mt-10 max-w-6xl rounded-[40px] border border-ink/5 bg-white px-6 py-14 shadow-lift md:-mt-14 md:px-12 md:py-20">
              <AudienceTabbedSections
                pressures={pressures}
                how={how}
                changes={changes}
                pricingBenefits={sharedPricingBenefits}
                accessToWorkInPricing={page.accessToWork}
                onContact={() => setContactOpen(true)}
              />
            </Reveal>
          </section>

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
    </>
  );
}