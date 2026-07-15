"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MailCheck,
  ShieldCheck,
  X,
} from "lucide-react";
import { AppSelect } from "@/components/ui/AppSelect";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";

const image = {
  hero:
    "/homepage-hero-digital-business.jpg",
  cta: "/footer-team-smiling.jpg",
};

const principles: [string, string][] = [
  ["Human led.", "Experienced people, not just tools"],
  ["AI aware.", "We prepare organisations for it, we don't sell it"],
  ["Practical.", "Real work done, not another strategy deck"],
  ["Sustained.", "Improvements maintained, not left to slip"],
];

const symptoms = [
  "Documents scattered and hard to find",
  "Data that no longer matches reality",
  "Processes that live in someone's head",
  "Inboxes and shared drives overflowing",
  "Reporting that takes longer every quarter",
  "Skilled people stuck on routine tasks",
];

const helpCards = [
  {
    title: "Reduce backlogs",
    copy: "Clear the work that has built up and restore control.",
    items: ["Document reviews", "Data cleanup", "Outstanding reports", "Record organisation"],
    href: "/how-we-help#area-backlog",
    linkLabel: "Explore backlog support",
  },
  {
    title: "Prepare for AI & automation",
    copy: "Create the organised information technology needs to work.",
    items: ["Document organisation", "Data quality", "Process mapping", "Workflow preparation"],
    href: "/how-we-help#area-ai",
    linkLabel: "Explore AI readiness",
  },
  {
    title: "Ongoing admin support",
    copy: "Keep essential work moving without stretching your team.",
    items: ["Inbox support", "Reporting", "Document management", "Routine administration"],
    href: "/how-we-help#area-ongoing",
    linkLabel: "Explore support services",
  },
  {
    title: "Maintain & improve",
    copy: "Stop problems returning after the hard work is done.",
    items: ["Admin reviews", "Data hygiene", "Process reviews", "AI output monitoring"],
    href: "/how-we-help#area-maintain",
    linkLabel: "Explore maintenance",
  },
];

const approachStages = [
  {
    num: "01 — Prepare",
    title: "Build the right foundations",
    items: [
      "Document and shared drive organisation",
      "Data quality improvement",
      "Process documentation",
      "Backlog reduction",
      "AI and automation readiness",
    ],
    outcome: "clearer information and reliable ways of working.",
  },
  {
    num: "02 — Support",
    title: "Keep essential work moving",
    items: [
      "Inbox and calendar support",
      "Reporting",
      "Document management",
      "Administrative coordination",
      "Routine operational tasks",
    ],
    outcome: "more capacity for the work only your team can do.",
  },
  {
    num: "03 — Maintain",
    title: "Keep improvements working",
    items: [
      "Regular admin reviews",
      "Data hygiene and document reviews",
      "Process reviews",
      "Backlog prevention",
      "AI output monitoring",
    ],
    outcome: "systems that keep supporting you as you grow.",
  },
];

type Audience = {
  title: string;
  copy: string;
  href: string;
};

const audiences: Audience[] = [
  {
    title: "Founders & Entrepreneurs",
    copy: "Reduce the admin taking you away from growth, strategy and the work only you can do.",
    href: "/founders-entrepreneurs",
  },
  {
    title: "SMEs",
    copy: "Clearer systems and processes that let you grow without administrative chaos holding you back.",
    href: "/small-business",
  },
  {
    title: "Charities & Non-Profits",
    copy: "Less administrative pressure, so more of your capacity goes to your mission.",
    href: "/charities-non-profits",
  },
  {
    title: "Public Sector",
    copy: "Reduced backlogs and stronger information management, ready for smarter ways of working.",
    href: "/public-sector",
  },
];

const gains = [
  "Clearer, better organised systems",
  "More capacity for your team",
  "More reliable information",
  "Fewer backlogs and surprises",
  "Reduced risk of problems returning",
  "The right conditions for AI and automation to succeed",
];

const faqs = [
  ["Who is VAxAI for?", "VAxAI supports founders and entrepreneurs, small and medium-sized businesses (SMEs), charities and non-profits, and public sector organisations, anywhere administrative pressure is building and technology alone has not fixed it. We are practical, human-led support, not another software product, and we are primarily aimed at organisations without a large internal operations or AI team."],
  ["What is the free Admin Review?", "A structured review of your current administrative operations to understand what is going on and recommend the right support, free and with no obligation. We look at where pressure is building, where your systems need strengthening and what would make the biggest difference, then tell you honestly what would help, and what wouldn't, even if that means not working with us."],
  ["What happens after the review?", "If you want to go further, we scope the work properly across your organisation's admin, information and processes, including anything AI and automation have added on top. We always test on a small scale first, then use what we learn to scope the full project accurately, and costs are agreed before any work begins, so there are no surprises."],
  ["Why does preparation matter before AI?", "AI and automation rely on the information and processes behind them. Point them at disorganised data and unclear workflows and they produce poor outputs, new problems and more correction work, not time saved. We do the groundwork, organising information, improving data quality and documenting processes, so the tools you choose can actually work."],
  ["Do you build AI systems yourselves?", "No. We prepare organisations for AI and automation and keep the results working, which means our only interest is your readiness. For complex or enterprise builds, we identify trusted external partners and can work with them on your behalf, rather than building these ourselves."],
  ["Why don't you publish fixed prices?", "Because every organisation's admin is different. Project work such as reducing a backlog or preparing for AI is scoped and priced up front. Ongoing admin support and maintain-and-improve work is charged hourly, monthly or quarterly, and you only pay for the hours you need in each period."],
  ["Can support be flexible?", "Yes. Once you are a VAxAI client, ongoing support can be monthly or quarterly and scaled up or down as your needs change. One month might need more hours than the next. Project work stays defined by scope and timeframe. Support can also be virtual or in person when being there matters."],
];

/* ------------------------------------------------------------------ */
/* Motion primitives — one easing curve and reveal pattern everywhere  */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
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

/* ------------------------------------------------------------------ */
/* Shared component language — buttons, eyebrows, accordions           */
/* ------------------------------------------------------------------ */

const btn = {
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift",
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 ease-premium hover:bg-pine-800 hover:shadow-lift",
  ghostLight:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/35 hover:bg-white",
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper/90 transition-colors duration-300 hover:border-white/45 hover:text-paper",
};

function Eyebrow({
  children,
  light = false,
  center = false,
}: {
  children: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
        center ? "justify-center" : ""
      } ${light ? "text-acid/90" : "text-pine-700"}`}
    >
      <span
        className={`simplified-hide h-1.5 w-1.5 rounded-full ${light ? "bg-acid" : "bg-pine-700"}`}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

function PhotoCard({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <div
      className={`simplified-photo overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}

function AccordionItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-sm font-semibold text-ink transition-colors duration-300 hover:text-pine-800 md:px-7"
      >
        {question}
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-premium ${
            open
              ? "rotate-180 border-pine-900 bg-pine-900 text-paper"
              : "border-ink/10 text-ink/50"
          }`}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-prose px-6 pb-6 text-sm leading-7 text-muted md:px-7">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const audienceCardStyles = [
  { border: "border-pine-900/12", bg: "bg-pine-50", hover: "hover:bg-pine-50/90", accent: "text-pine-800" },
  { border: "border-ink/8", bg: "bg-cream", hover: "hover:bg-cream/90", accent: "text-pine-900" },
  { border: "border-pine-700/15", bg: "bg-gradient-to-br from-pine-50/90 to-cream/80", hover: "hover:from-pine-50 hover:to-cream/70", accent: "text-pine-800" },
  { border: "border-acid/30", bg: "bg-[#f4f5e6]", hover: "hover:bg-[#eff0df]", accent: "text-pine-900" },
];

function AudienceCard({
  audience,
  index,
}: {
  audience: Audience;
  index: number;
}) {
  const style = audienceCardStyles[index % audienceCardStyles.length];

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }}>
      <Link
        href={audience.href}
        className={`group flex h-full flex-col rounded-3xl border p-6 transition-colors duration-500 hover:shadow-card md:p-7 ${style.border} ${style.bg} ${style.hover}`}
      >
        <span className="text-[11px] font-bold tracking-[0.16em] text-pine-700/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="mt-4 flex-1">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{audience.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{audience.copy}</p>
        </div>
        <span className={`mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold ${style.accent}`}>
          How we help
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function HelpCard({ card }: { card: (typeof helpCards)[number] }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }} className="h-full">
      <Link
        href={card.href}
        className="group flex h-full flex-col rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-shadow duration-500 ease-premium hover:shadow-lift md:p-7"
      >
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{card.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{card.copy}</p>
        <ul className="mt-4 flex-1 space-y-1.5">
          {card.items.map((item) => (
            <li key={item} className="flex items-baseline gap-2.5 text-[13px] leading-6 text-muted">
              <span className="h-1 w-1 shrink-0 rounded-full bg-pine-700" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <span className="mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-pine-800">
          {card.linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

type PostPreview = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  content_type?: string;
  tags?: string[];
  published_at?: string;
};

export default function Home() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [contactStep, setContactStep] = useState<"form" | "submitted" | "calendly">("form");
  const [preferredContact, setPreferredContact] = useState("Email");
  const [supportType, setSupportType] = useState("General enquiry");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState<boolean | null>(null);
  const [previewPosts, setPreviewPosts] = useState<PostPreview[]>([]);

  useEffect(() => {
    fetch("/api/posts?limit=3")
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setPreviewPosts(data); })
      .catch(() => {});
  }, []);


  useEffect(() => {
    if (contactStep !== "calendly") return;
    if (!document.querySelector('link[href*="calendly.com/assets"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="calendly.com/assets"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [contactStep]);

  function closeContactModal() {
    setIsContactModalOpen(false);
    setContactStep("form");
    setWantsDiscoveryCall(null);
  }

  return (
    <main id="top" className="min-h-screen bg-paper text-ink">

      <header className="sticky top-0 z-40 border-b border-white/10 bg-pine-900/90 px-4 backdrop-blur-md md:px-8">
        <SiteNav variant="dark" />
      </header>

      {/* ------------------------------------------------------------ */}
      {/* Hero — deep pine panel with soft tonal glows                  */}
      {/* ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-pine-900 px-4 pb-20 pt-10 text-paper md:px-8 md:pb-28 md:pt-14">
        <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 right-[-12%] h-[480px] w-[480px] rounded-full bg-pine-700/50 blur-3xl" />
          <div className="absolute left-[-8%] top-1/3 h-[380px] w-[380px] rounded-full bg-pine-800/60 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[20%] h-72 w-72 rounded-full bg-acid/[0.06] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-2xl text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.025em] md:text-7xl"
            >
              Reduce admin. Keep people in the loop.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-base leading-7 text-paper/70 md:text-lg md:leading-8"
            >
              VAxAI helps founders, small and medium-sized
              businesses (SMEs), charities and public sector organisations organise information, clear
              administrative backlogs and prepare for AI and automation, without adding pressure to
              already stretched teams.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setIsContactModalOpen(true)} className={btn.accent}>
                Get your free Admin Review
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/how-we-help" className={btn.ghostDark}>
                Explore how we help
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-xs font-medium text-paper/45">
              UK based · Human led · No obligation
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="relative mx-auto w-full max-w-[430px]"
          >
            <div
              className="simplified-hide absolute -inset-3 rotate-2 rounded-[36px] border border-white/10 bg-white/[0.04]"
              aria-hidden="true"
            />
            <PhotoCard src={image.hero} className="relative aspect-[0.86] rounded-[28px] ring-1 ring-white/15" />
          </motion.div>
        </div>

      </section>

      {/* ------------------------------------------------------------ */}
      {/* Principles strip — how we work, in one line                   */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-ink/5 bg-cream/70 px-4 py-7 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {principles.map(([lead, rest]) => (
            <p key={lead} className="text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">{lead}</span> {rest}
            </p>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* The problem — admin doesn't fix itself, even with AI          */}
      {/* ------------------------------------------------------------ */}
      <section id="services" className="relative px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              Administration doesn&rsquo;t fix itself. Even with AI.
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-x-14 gap-y-0 rounded-3xl border border-ink/8 bg-cream/50 px-7 py-3 md:grid-cols-2 md:px-10">
            {symptoms.map((symptom) => (
              <motion.p
                key={symptom}
                variants={fadeUp}
                className="border-b border-ink/10 py-4 text-base leading-7 text-ink last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                {symptom}
              </motion.p>
            ))}
          </Stagger>
          <Reveal>
            <p className="mt-12 max-w-4xl text-lg leading-8 text-muted md:text-xl md:leading-9">
              Many organisations look to AI and automation to solve this. But technology relies on the
              information and processes behind it. Point AI at disorganised data and unclear workflows and it
              produces <strong className="font-semibold text-ink">poor outputs, new problems and more correction work</strong>, not time saved.
            </p>
            <p className="mt-8 max-w-3xl border-l-2 border-acid pl-5 text-lg font-medium leading-8 text-ink md:text-xl">
              The result: wasted budget, frustrated teams and technology that fails to deliver.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* How we help — four kinds of support                           */}
      {/* ------------------------------------------------------------ */}
      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>How we help</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              Practical support for the admin that slows organisations down
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {helpCards.map((card) => (
              <HelpCard key={card.href} card={card} />
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Our approach — Prepare. Support. Maintain.                    */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow light>Our approach</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              Prepare. Support. Maintain.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-paper/65 md:text-lg">
              We don&rsquo;t start with technology. We start with the administration your organisation
              relies on every day, and we stay involved so improvements last.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid overflow-hidden rounded-[28px] border border-white/15 md:grid-cols-3">
            {approachStages.map((stage, index) => (
              <motion.div
                key={stage.num}
                variants={fadeUp}
                className={`flex flex-col p-7 md:p-8 ${
                  index < approachStages.length - 1
                    ? "border-b border-white/15 md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-acid">{stage.num}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{stage.title}</h3>
                <ul className="mt-5 flex-1 space-y-2">
                  {stage.items.map((item) => (
                    <li key={item} className="flex items-baseline gap-2.5 text-sm leading-7 text-paper/65">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-acid/70" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-white/15 pt-5 text-sm leading-6 text-paper/65">
                  <span className="font-semibold text-paper">Outcome:</span> {stage.outcome}
                </p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Who we help — four audiences                                  */}
      {/* ------------------------------------------------------------ */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Who we help</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              Support built around your organisation
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience, index) => (
              <AudienceCard key={audience.href} audience={audience} index={index} />
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Why external support                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <Reveal>
            <Eyebrow>Why external support</Eyebrow>
            <h2 className="mt-4 max-w-md text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              The work before AI is the work nobody has capacity for
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-base leading-8 text-muted">
              Preparing for AI and automation is practical groundwork: organising documents, improving data
              quality, standardising processes, retiring outdated records. Your team already has a full-time
              job. Without dedicated capacity, preparation stalls, backlogs grow and transformation gets
              harder.
            </p>
            <p className="mt-5 text-base leading-8 text-muted">
              There&rsquo;s an opportunity cost too. Every hour a senior person spends on routine
              administration is an hour not spent on strategy, funding, service delivery or clients, work
              worth far more than the admin itself.
            </p>
            <p className="mt-6 text-base font-semibold leading-8 text-ink">
              VAxAI provides the capacity to complete the essential groundwork, so your people stay focused
              on theirs.
            </p>
            <a href="/how-we-help#in-house-or-external" className={`${btn.primary} mt-8`}>
              Understand the full value of internal vs external support
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* What you gain                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-pine-900 px-4 py-16 text-paper md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow light>What you gain</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
              More than admin support. Stronger ways of working.
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {gains.map((gain) => (
              <motion.p key={gain} variants={fadeUp} className="flex gap-3 text-base leading-7 text-paper/80 md:text-lg">
                <span className="mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">
                  ✓
                </span>
                {gain}
              </motion.p>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* FAQ — split layout with smooth accordion                      */}
      {/* ------------------------------------------------------------ */}
      <section id="faq" className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.75fr_1fr] md:gap-16">
          <Reveal>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[2.75rem]">
              Questions about VAxAI?
            </h2>
            <p className="mt-6 max-w-prose text-sm leading-7 text-muted">
              Clear answers on how the free Admin Review works, how pricing is agreed, and what
              happens once support begins.
            </p>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className={`${btn.primary} mt-8`}
            >
              Book a discovery call
              <MailCheck className="h-4 w-4" />
            </button>
          </Reveal>
          <Reveal className="divide-y divide-ink/5 self-start rounded-[28px] border border-ink/5 bg-white shadow-card">
            {faqs.map(([question, answer], index) => (
              <AccordionItem
                key={question}
                question={question}
                answer={answer}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Insights preview                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="px-4 pb-24 md:px-8 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
                Insights &amp; Resources
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
                Practical thinking on admin foundations, AI readiness and keeping people in the loop. If
                something resonates, you can attach it to your enquiry when you get in touch.
              </p>
            </div>
            <a href="/insights" className={`${btn.ghostLight} mt-6 shrink-0 md:mt-0`}>
              View all insights
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
          {previewPosts.length > 0 && (
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {previewPosts.map((post) => (
                <motion.a
                  key={post.id}
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-card transition-shadow duration-500 ease-premium hover:shadow-lift"
                >
                  {post.cover_image_url && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-ink/5">
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    {post.content_type && (
                      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-pine-700">{post.content_type}</p>
                    )}
                    <h3 className="text-sm font-semibold leading-snug tracking-tight text-ink">{post.title}</h3>
                    {post.description && (
                      <p className="mt-2 flex-1 text-xs leading-5 text-muted line-clamp-3">{post.description}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-pine-800">
                      Read more
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Closing CTA — pine panel bookending the hero                  */}
      {/* ------------------------------------------------------------ */}
      <section className="px-4 pb-24 md:px-8 md:pb-28">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-pine-900 text-paper">
          <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 left-[-8%] h-80 w-80 rounded-full bg-pine-700/40 blur-3xl" />
            <div className="absolute bottom-[-30%] right-[30%] h-72 w-72 rounded-full bg-acid/[0.07] blur-3xl" />
          </div>
          <div className="relative grid md:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 md:p-14">
              <Eyebrow light>Start the conversation</Eyebrow>
              <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[2.75rem]">
                Ready to prepare your organisation for smarter ways of working?
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-paper/65 md:text-base md:leading-8">
                Start with a free Admin Review. We&apos;ll identify where administrative pressure is
                building, where your systems need strengthening and what support would make the biggest
                difference.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => setIsContactModalOpen(true)} className={btn.accent}>
                  Get your free Admin Review
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsAccessModalOpen(true)} className={btn.ghostDark}>
                  Access to Work support
                </button>
              </div>
              <p className="mt-5 text-xs text-paper/50">A structured review of your administrative operations. Free, with no obligation.</p>
            </div>
            <div className="relative min-h-[260px] md:min-h-0">
              <PhotoCard src={image.cta} className="absolute inset-0 h-full w-full" />
              <div
                className="simplified-hide absolute inset-0 bg-gradient-to-t from-pine-900 via-pine-900/20 to-transparent md:bg-gradient-to-r md:via-pine-900/10"
                aria-hidden="true"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />

      {isContactModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
        >
          {contactStep === "calendly" ? (
            <div className="flex h-full max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="flex shrink-0 items-center justify-between gap-6 rounded-t-[28px] bg-pine-900 px-6 py-5 text-paper md:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Discovery call</p>
                  <h2 className="mt-1 text-xl font-semibold leading-tight">Book a time with us</h2>
                </div>
                <button type="button" onClick={closeContactModal} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <div
                  className="calendly-inline-widget h-full w-full"
                  data-url="https://calendly.com/thesia-mt1l"
                  style={{ minHeight: "660px" }}
                />
              </div>
            </div>
          ) : (
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-6 rounded-t-[28px] bg-pine-900 px-6 py-6 text-paper md:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Contact VAxAI</p>
                  <h2 id="contact-title" className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
                    {contactStep === "submitted" ? "Enquiry sent" : "Tell us what support you need"}
                  </h2>
                </div>
                <button type="button" onClick={closeContactModal} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20" aria-label="Close contact form">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {contactStep === "submitted" ? (
                <div className="p-6 md:p-10">
                  <p className="text-sm leading-7 text-muted">
                    Thank you. We have received your message and will be in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={closeContactModal}
                    className={`${btn.ghostLight} mt-6`}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  className="grid gap-5 p-6 md:grid-cols-2 md:p-10"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    const payload = {
                      name: String(data.get("name")),
                      email: String(data.get("email")),
                      supportType: String(data.get("supportType")),
                      preferredContact: String(data.get("preferredContact")),
                      telephone: String(data.get("telephone") || ""),
                      details: String(data.get("details")),
                      wantsDiscoveryCall: wantsDiscoveryCall === true,
                    };
                    // Save to Supabase via API route
                    await fetch("/api/enquiry", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }).catch(() => {});
                    if (wantsDiscoveryCall === true) {
                      setContactStep("calendly");
                    } else {
                      setContactStep("submitted");
                    }
                  }}
                >
                  <label className="grid gap-2 text-sm font-semibold">
                    Name
                    <input required name="name" autoComplete="name" className="rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition-colors duration-200 focus:border-pine-800" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Email address
                    <input required type="email" name="email" autoComplete="email" className="rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition-colors duration-200 focus:border-pine-800" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Support type
                    <AppSelect
                      value={supportType}
                      onChange={setSupportType}
                      options={[
                        { value: "Reduce backlog", label: "Reduce backlog" },
                        { value: "Prepare for AI and automation", label: "Prepare for AI and automation" },
                        { value: "Ongoing admin support", label: "Ongoing admin support" },
                        { value: "Maintain and improve", label: "Maintain and improve" },
                        { value: "Access to Work", label: "Access to Work" },
                        { value: "General enquiry", label: "General enquiry" },
                      ]}
                      name="supportType"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Preferred method of contact
                    <AppSelect
                      value={preferredContact}
                      onChange={setPreferredContact}
                      options={[{ value: "Email", label: "Email" }, { value: "Telephone", label: "Telephone" }]}
                      name="preferredContact"
                    />
                  </label>
                  {preferredContact === "Telephone" ? (
                    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                      Telephone number
                      <input required type="tel" name="telephone" autoComplete="tel" className="rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition-colors duration-200 focus:border-pine-800" />
                    </label>
                  ) : null}
                  <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                    Tell us more
                    <textarea required name="details" rows={5} className="resize-y rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition-colors duration-200 focus:border-pine-800" />
                  </label>
                  <div className="rounded-2xl border border-pine-900/15 bg-pine-50 p-5 md:col-span-2">
                    <p className="font-semibold text-ink">Would you like to book a discovery call?</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      A 30-minute conversation to explore your challenge and whether we are the right fit.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setWantsDiscoveryCall(true)}
                        className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                          wantsDiscoveryCall === true
                            ? "border-pine-900 bg-pine-900 text-acid"
                            : "border-ink/15 bg-white text-ink hover:border-pine-900/40"
                        }`}
                      >
                        Yes, book a call
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantsDiscoveryCall(false)}
                        className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                          wantsDiscoveryCall === false
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/15 bg-white text-ink hover:border-ink/30"
                        }`}
                      >
                        No, just send my message
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className={btn.primary}>
                      {wantsDiscoveryCall === true ? "Continue to book a call" : "Send my message"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : null}

      {isAccessModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-md"
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
                onClick={() => setIsAccessModalOpen(false)}
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

                <p className="mt-4 text-base leading-7 text-muted">
                  Our Admin Review can also help individuals eligible for Access to Work, for example neurodivergent professionals who find admin particularly difficult. The review looks at where your admin is coming from and what it actually involves day to day. You would then explain how it affects you, and whether it is tied to your disability or health condition and how, so it is clear where the support needs to sit. For individuals this is a lighter-touch version of the review, so get in touch to discuss what this could look like for you.
                </p>

                <div className="mt-6 rounded-2xl border border-ink/10 bg-cream/70 p-5">
                  <p className="text-sm font-semibold text-ink">What we do not do</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
                    <li>We do not decide whether you are eligible or guarantee funding.</li>
                    <li>We do not make decisions on behalf of Access to Work.</li>
                    <li>Access to Work assesses each application and confirms approved support.</li>
                    <li>We are not medical professionals, and this is not a diagnosis of any kind. We simply help you understand the reality of your admin, not diagnose or determine the disability link ourselves.</li>
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccessModalOpen(false);
                      setIsContactModalOpen(true);
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
                <p className="mt-5 text-sm leading-6 text-muted">
                  Access to Work can help people with a disability or health condition get or stay in work.
                </p>
                <div className="mt-5 grid gap-3 border-t border-ink/10 pt-5">
                  {[
                    ["Who can apply?", "People with a disability or health condition that affects their work."],
                    ["How much?", "The support depends on your needs and what Access to Work approves."],
                    ["How does it work?", "We can help you understand the process and prepare practical support details."],
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-xl bg-paper p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pine-800">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-ink">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <style jsx global>{`
        .simplified-mode {
          background: #fff !important;
          color: #000 !important;
        }

        .simplified-mode *,
        .simplified-mode *::before,
        .simplified-mode *::after {
          background-color: #fff !important;
          border-color: #000 !important;
          box-shadow: none !important;
          color: #000 !important;
          text-shadow: none !important;
        }

        .simplified-mode .simplified-hide {
          display: none !important;
        }

        .simplified-mode .simplified-photo {
          border: 1px solid #000 !important;
          filter: grayscale(1) contrast(1.12) !important;
        }

        .simplified-mode img {
          filter: grayscale(1) contrast(1.25) !important;
        }

        .simplified-mode .simplified-toggle,
        .simplified-mode .simplified-toggle *,
        .simplified-mode .simplified-toggle *::before,
        .simplified-mode .simplified-toggle *::after {
          background-color: transparent !important;
          border-color: #d1d5db !important;
          color: #111111 !important;
          text-decoration: none !important;
          box-shadow: none !important;
          filter: none !important;
        }
        .simplified-mode .simplified-toggle .a11y-active {
          background-color: #122428 !important;
          border-color: #122428 !important;
          color: #ffffff !important;
        }
        .simplified-mode .simplified-toggle .a11y-active * {
          color: #ffffff !important;
          border-color: #ffffff !important;
          background-color: transparent !important;
        }
        .simplified-mode .simplified-toggle .a11y-panel {
          background-color: #ffffff !important;
          box-shadow: 0 8px 40px rgba(17,17,17,0.14) !important;
        }
        .simplified-mode .simplified-toggle .a11y-trigger {
          background-color: #ffffff !important;
          box-shadow: 0 14px 35px rgba(17,17,17,0.18) !important;
        }
        .simplified-mode .simplified-toggle .a11y-trigger.a11y-active {
          background-color: #122428 !important;
          color: #ffffff !important;
        }
      `}</style>
      <SimplifiedModeToggle />
    </main>
  );
}
