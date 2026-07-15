"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import PublicContactModal from "@/components/PublicContactModal";
import type {
  AudiencePage,
  AudiencePricing,
  AudienceSection,
} from "@/lib/seo/audience-pages";
import {
  sharedAccessToWork,
  sharedOngoingSupport,
  sharedPricingHowItWorks,
  sharedProjectWork,
} from "@/lib/seo/audience-pages";
import { cn } from "@/lib/utils";

type ServiceLandingPageProps = {
  page: AudiencePage;
};

const HERO_IMAGES: Record<string, string> = {
  "founders-entrepreneurs": "/founder-laptop-graph-meeting.jpg",
  "small-business": "/small-business-boxes.jpg",
  "charities-non-profits": "/charity-volunteers-garden.jpg",
  "public-sector": "/istockphoto-1206317971-612x612.jpg",
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

type AudienceTabId = "pressures" | "howWeHelp" | "changes" | "pricing" | "benefits";

function TabFlowCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${btn.primary} mt-8`}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function PressuresPanelContent({
  section,
  onNext,
}: {
  section: AudienceSection;
  onNext: () => void;
}) {
  return (
    <div>
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
    <TabFlowCta label="See how we help" onClick={onNext} />
    </div>
  );
}

function HowWeHelpPanelContent({
  section,
  onNext,
}: {
  section: AudienceSection;
  onNext: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <Eyebrow>{section.heading}</Eyebrow>
      <div className="mt-6 space-y-4 text-base leading-8 text-muted">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {(section.bullets ?? []).length > 0 ? (
        <div className="mt-8 rounded-3xl border border-pine-900/10 bg-white/80 p-6 shadow-card md:p-8">
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
      <TabFlowCta label="See what changes" onClick={onNext} />
    </div>
  );
}

function ChangesPanelContent({
  badge,
  section,
  showIntro = true,
  onNext,
}: {
  badge: string;
  section: AudienceSection;
  showIntro?: boolean;
  onNext: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          {showIntro ? <Eyebrow>{badge}</Eyebrow> : null}
          <div className={cn("space-y-4 text-base leading-8 text-muted", showIntro && "mt-5")}>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {section.equation ? (
            <p className="mt-8 rounded-2xl border border-pine-900/10 bg-pine-50/70 px-5 py-4 text-sm font-medium leading-7 text-pine-900 md:text-base">
              {section.equation}
            </p>
          ) : null}
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
      <TabFlowCta label="Explore our pricing" onClick={onNext} />
    </div>
  );
}

const ACCESS_TO_WORK_URL = "https://www.gov.uk/access-to-work";

function PricingPanelContent({
  pricing,
  pricingIntro,
  showAccessToWork = false,
  onContact,
  onViewBenefits,
}: {
  pricing: AudiencePricing;
  pricingIntro: string;
  showAccessToWork?: boolean;
  onContact: () => void;
  onViewBenefits: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <Eyebrow>Pricing</Eyebrow>
      <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
        How Our Pricing Works
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-muted md:text-lg">
        {sharedPricingHowItWorks.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {pricingIntro ? <p>{pricingIntro}</p> : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <article className="flex flex-col rounded-3xl border border-pine-900/15 bg-cream/50 px-6 py-7 md:px-8">
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink md:text-xl">
            {sharedProjectWork.title}
          </h3>
          <p className="mt-2 text-sm font-semibold text-pine-800 md:text-base">
            {sharedProjectWork.priceLabel}
          </p>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
            Typically covers
          </p>
          <ul className="mt-3 space-y-2">
            {sharedProjectWork.services.map((service) => (
              <li key={service} className="flex gap-3">
                <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                  ✓
                </span>
                <span className="text-sm leading-7 text-muted md:text-[15px]">{service}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex-1 text-sm leading-7 text-muted md:text-[15px]">
            {sharedProjectWork.description}
          </p>
        </article>

        <article className="flex flex-col rounded-3xl border border-ink/5 bg-white px-6 py-7 shadow-card md:px-8">
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink md:text-xl">
            {sharedOngoingSupport.title}
          </h3>
          <p className="mt-2 text-sm font-semibold text-pine-800 md:text-base">
            {pricing.ongoingSupportPrice}
          </p>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">
            Typically covers
          </p>
          <ul className="mt-3 space-y-2">
            {sharedOngoingSupport.services.map((service) => (
              <li key={service} className="flex gap-3">
                <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                  ✓
                </span>
                <span className="text-sm leading-7 text-muted md:text-[15px]">{service}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex-1 text-sm leading-7 text-muted md:text-[15px]">
            {sharedOngoingSupport.description}
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onViewBenefits} className={btn.accent}>
          Why work with us
          <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={onContact} className={btn.ghostLight}>
          Get in touch to discuss your quote
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {showAccessToWork ? (
        <div
          id="access-to-work"
          className="scroll-mt-24 mt-8 rounded-3xl border border-pine-900/10 bg-pine-50/60 px-6 py-6 md:px-7"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pine-800">Access to Work</p>
          <h3 className="mt-3 text-base font-semibold tracking-[-0.01em] text-ink md:text-lg">
            {sharedAccessToWork.heading}
          </h3>
          <a
            href={ACCESS_TO_WORK_URL}
            target="_blank"
            rel="noreferrer"
            className={`${btn.primary} mt-6`}
          >
            Official GOV.UK guidance
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

function PricingBenefitsPanelContent({
  section,
  onContact,
}: {
  section: AudienceSection;
  onContact: () => void;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <Eyebrow>Why work with us</Eyebrow>
      <h2 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-3xl">
        {section.heading}
      </h2>
      <p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">
        {section.paragraphs.join(" ")}
      </p>
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
      <button type="button" onClick={onContact} className={`${btn.accent} mt-8`}>
        Get your free Admin Review
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function AudienceTabbedSections({
  pressures,
  howWeHelp,
  changes,
  workWithUs,
  pricing,
  pricingIntro,
  showAccessToWork = false,
  onContact,
}: {
  pressures: AudienceSection;
  howWeHelp: AudienceSection;
  changes: AudienceSection;
  workWithUs: AudienceSection;
  pricing: AudiencePricing;
  pricingIntro: string;
  showAccessToWork?: boolean;
  onContact: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AudienceTabId>("pressures");

  function navigateToTab(tab: AudienceTabId) {
    setActiveTab(tab);
    if (tab === "benefits") {
      window.history.replaceState(null, "", "#pricing-benefits");
    } else if (window.location.hash === "#pricing-benefits") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  useEffect(() => {
    function syncTabFromHash() {
      if (window.location.hash === "#pricing-benefits") {
        setActiveTab("benefits");
        return;
      }
      if (window.location.hash === "#access-to-work") {
        setActiveTab("pricing");
      }
    }

    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  const tabs: { id: AudienceTabId; label: string }[] = [
    { id: "pressures", label: pressures.heading },
    { id: "howWeHelp", label: howWeHelp.heading },
    { id: "changes", label: changes.heading },
    { id: "pricing", label: "Pricing" },
    { id: "benefits", label: "Why work with us" },
  ];

  const panelClassName: Record<AudienceTabId, string> = {
    pressures: "bg-white text-ink",
    howWeHelp: "rounded-[28px] border border-ink/5 bg-white text-ink",
    changes: "rounded-[28px] border border-ink/5 bg-white text-ink",
    pricing: "rounded-[28px] border border-ink/5 bg-white text-ink",
    benefits: "rounded-[28px] border border-ink/5 bg-white text-ink",
  };

  function openBenefitsTab() {
    navigateToTab("benefits");
  }

  return (
    <div>
      <div className="relative md:static">
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
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-4 flex w-12 items-center justify-end bg-gradient-to-l from-white to-transparent md:hidden"
          aria-hidden="true"
        >
          <ChevronRight className="h-4 w-4 text-ink/40" />
        </div>
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
        {activeTab === "pressures" ? (
          <PressuresPanelContent section={pressures} onNext={() => navigateToTab("howWeHelp")} />
        ) : null}
        {activeTab === "howWeHelp" ? (
          <HowWeHelpPanelContent
            section={howWeHelp}
            onNext={() => navigateToTab("changes")}
          />
        ) : null}
        {activeTab === "changes" ? (
          <ChangesPanelContent
            badge={changes.heading}
            section={changes}
            onNext={() => navigateToTab("pricing")}
          />
        ) : null}
        {activeTab === "pricing" ? (
          <PricingPanelContent
            pricing={pricing}
            pricingIntro={pricingIntro}
            showAccessToWork={showAccessToWork}
            onContact={onContact}
            onViewBenefits={openBenefitsTab}
          />
        ) : null}
        {activeTab === "benefits" ? (
          <PricingBenefitsPanelContent section={workWithUs} onContact={onContact} />
        ) : null}
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
  const { pressures, changes } = page;
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
                    Get your free Admin Review
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
                howWeHelp={page.howWeHelp}
                changes={changes}
                workWithUs={page.workWithUs}
                pricing={page.pricing}
                pricingIntro={page.pricingIntro}
                showAccessToWork={page.heroHasAccessCta}
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
                  Start with a free Admin Review: a structured review of your administrative operations, free and with no obligation.
                  We&apos;ll look at where pressure is building and tell you honestly what would help, and what wouldn&apos;t.
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
