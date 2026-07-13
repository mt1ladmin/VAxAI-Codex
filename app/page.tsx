"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MailCheck,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { AppSelect } from "@/components/ui/AppSelect";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";
import { experts } from "@/lib/experts";
import type { Expert } from "@/lib/experts";

const image = {
  hero:
    "/homepage-hero-digital-business.jpg",
  expert:
    "/vaxai-support-control.jpg",
  thesia: "/thesia-profile.jpg",
  rebecca: "/rebecca-bradshaw.jpg",
  cta: "/footer-team-smiling.jpg",
};

const tools = [
  {
    name: "Claude",
    logo: "https://cdn.simpleicons.org/claude/D97757",
  },
  {
    name: "Microsoft Copilot",
    logo: "https://copilot.microsoft.com/favicon.ico",
  },
  {
    name: "ChatGPT",
    logo: "https://cdn.simpleicons.org/chatgpt/74AA9C",
  },
  {
    name: "Gemini",
    logo: "https://cdn.simpleicons.org/googlegemini/8E75B2",
  },
  {
    name: "Perplexity",
    logo: "https://cdn.simpleicons.org/perplexity/1FB8CD",
  },
  {
    name: "Zapier",
    logo: "https://cdn.simpleicons.org/zapier/FF4F00",
  },
  {
    name: "Make",
    logo: "https://cdn.simpleicons.org/make/6D00CC",
  },
  {
    name: "Power Automate",
    logo: "https://www.google.com/s2/favicons?domain=powerautomate.microsoft.com&sz=64",
  },
  {
    name: "n8n",
    logo: "https://cdn.simpleicons.org/n8n/EA4B71",
  },
];

type CaseStudy = {
  title: string;
  subtitle: string;
  href: string;
  teaser: string;
  paragraphs?: string[];
  workflowPoints?: string[];
  results?: string[];
  closing?: string;
  placeholder?: boolean;
};

const caseStudies: CaseStudy[] = [
  {
    title: "Founder & Entrepreneur",
    subtitle: "Freeing up your time so you can focus on growth.",
    href: "/founders-entrepreneurs",
    teaser: "A founder was spending several hours each week managing emails, scheduling meetings, tracking actions and chasing follow-ups.",
    paragraphs: [
      "Rather than introducing more software, we simplified how work flowed day to day before automating the repetitive tasks and providing ongoing support where human judgement still mattered.",
    ],
    results: [
      "Significant reduction in admin time",
      "Fewer missed follow-ups",
      "Clearer priorities and workload",
      "More time for clients and business growth",
    ],
    closing: "A practical solution built around the way they already worked, not the other way around.",
  },
  {
    title: "Small Business",
    subtitle: "Creating clearer, more efficient ways of working.",
    href: "/small-business",
    teaser: "A growing organisation was using multiple systems to manage projects, documents and client information. As the team grew, it became increasingly difficult to know where information belonged or who owned what.",
    paragraphs: [
      "We reviewed how work moved across the organisation before introducing clearer processes and improving the way their existing systems worked together.",
    ],
    results: [
      "Less duplication",
      "Clear ownership of information",
      "Faster onboarding",
      "Less time spent searching for files",
    ],
    closing: "Clearer processes made the technology easier to use, not the other way around.",
  },
  {
    title: "Charities & Non-Profits",
    subtitle: "Reducing admin so more time and money goes into delivering your mission.",
    href: "/charities-non-profits",
    teaser: "Important messages, requests and updates were arriving through multiple channels, making it difficult to maintain visibility and respond consistently.",
    paragraphs: [
      "We designed a central communication workflow that brought information together, automated repetitive organisation and kept people responsible for the decisions that mattered.",
    ],
    results: [
      "Better visibility",
      "Faster response times",
      "Fewer missed actions",
      "Less manual administration",
      "One trusted place for communication and tasks",
    ],
    closing: "Automation handled the routine work while people remained in control.",
  },
];

const plans = [
  {
    step: "01",
    title: "Assessment",
    label: "Assess",
    copy: [
      "We begin by understanding how work currently happens. Together we identify where time is being lost, where unnecessary pressure is building and which improvements are likely to make the biggest difference before deciding what should change.",
    ],
    items: [
      "Admin, workflow and capacity review",
      "AI, automation and process opportunities",
      "Risks, gaps and priorities",
      "Practical recommendations and next steps",
    ],
  },
  {
    step: "02",
    title: "Strategy, Implementation & Team Training",
    label: "Assess + Implement",
    copy: [
      "Using the findings from the assessment, we implement the agreed improvements. This may involve simplifying processes, making better use of existing tools, introducing AI or automation where appropriate, creating clearer ways of working or helping your team build confidence using new systems.",
    ],
    items: [
      "Everything included in Assess",
      "Process and workflow improvement",
      "Tool selection, setup and implementation",
      "AI and automation support where appropriate",
      "Team training",
      "Documentation and handover",
    ],
  },
  {
    step: "03",
    title: "Recommended: Ongoing Support",
    label: "Assess + Implement + Support",
    featured: true,
    copy: [
      "Work doesn't stand still, and neither should your systems. As your organisation grows, priorities shift and new challenges emerge, we continue refining the way work happens. Support may include virtual assistance, process improvements, system optimisation, team coaching and ongoing AI guidance so that your ways of working continue to evolve alongside your organisation.",
    ],
    items: [
      "Everything included in Assess and Implement",
      "Ongoing process and system optimisation",
      "Virtual assistance where human support is still needed",
      "Team guidance and troubleshooting",
      "Monitoring and ongoing adjustments",
      "Dedicated support hours within your package",
    ],
  },
];

const vatPrinciples = [
  ["01", "Value", "We focus on changes that create genuine, measurable benefit, reducing admin pressure, freeing up time and creating capacity for the work that actually matters. Not change for its own sake."],
  ["02", "Alignment", "We check that what we recommend fits how your organisation actually works, including its people, tools, data and ways of doing things, without adding complexity or asking people to work against the grain."],
  ["03", "Trust", "We are transparent about how things work, keep human judgement at the centre, and make sure the people affected understand and feel confident in the result. AI supports the work; it never replaces the people behind it."],
];

const faqs = [
  ["Who is VAxAI for?", "VAxAI is for founders, entrepreneurs, small businesses, charities and non-profits who need practical support with admin, workflows, AI and automation, without being pushed into tools or systems that do not fit how they actually work."],
  ["What does the assessment include?", "It is based on your unique case. We consult with you, review current tools and data, identify where AI adds value, and give you a practical setup plan you can use yourself or ask us to build."],
  ["How do you decide whether AI is needed?", "We use the MT1L VAT framework: will it create meaningful Value, fit the reality of how work gets done, and be trusted by the people affected? If AI is not the answer, we say so."],
  ["Why does pricing vary?", "Pricing varies because each client’s workflows, tools and support needs are different. We explain this clearly after Discovery & Strategy, before any Workflow Design or build work begins."],
  ["What does VA oversight mean?", "A trained VA understands your automation, monitors exceptions, manages tasks AI should not touch, and reduces the stress of AI going rogue."],
  ["Can support be flexible?", "Yes. Once you are a VAxAI client, support can be ad hoc, weekly, monthly, or annual. We can also provide in-person support at extra cost when needed."],
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
/* Shared component language — buttons, eyebrows, titles, accordions   */
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

function MiniLogo() {
  return (
    <a href="#top" className="flex items-center" aria-label="VAxAI home">
      <img src="/vaxai-logo.png" alt="VAxAI" className="h-8 w-auto" />
    </a>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  prompt,
  light = false,
  narrow = false,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  prompt?: string;
  light?: boolean;
  narrow?: boolean;
}) {
  return (
    <Reveal className={`mx-auto text-center ${narrow ? "max-w-xl" : "max-w-2xl"}`}>
      {eyebrow ? (
        <div className="mb-4">
          <Eyebrow light={light} center>
            {eyebrow}
          </Eyebrow>
        </div>
      ) : null}
      <h2
        className={`text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[2.75rem] ${
          light ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={`mx-auto mt-6 max-w-xl text-sm leading-7 md:text-base md:leading-8 ${
            light ? "text-paper/65" : "text-muted"
          }`}
        >
          {copy}
        </p>
      ) : null}
      {prompt ? (
        <p
          className={`mx-auto mt-4 max-w-xl text-sm font-medium leading-7 ${
            light ? "text-paper/80" : "text-ink/80"
          }`}
        >
          {prompt}
        </p>
      ) : null}
    </Reveal>
  );
}

function ToolLogo({ tool }: { tool: (typeof tools)[number] }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <span
        className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-paper/80"
        aria-hidden="true"
      >
        {tool.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={tool.logo}
      alt=""
      className="h-7 w-7 object-contain"
      loading="lazy"
      onError={() => setHasFailed(true)}
    />
  );
}

function ToolMarquee() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="simplified-hide pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-pine-900 to-transparent"
        aria-hidden="true"
      />
      <div
        className="simplified-hide pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-pine-900 to-transparent"
        aria-hidden="true"
      />
      <div className="flex w-max items-center gap-14 animate-tool-scroll">
        {[...tools, ...tools].map((tool, index) => (
          <div
            key={`${tool.name}-${index}`}
            className="flex items-center gap-3 text-sm font-medium text-paper/60"
            aria-label={index < tools.length ? tool.name : undefined}
            aria-hidden={index >= tools.length}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center">
              <ToolLogo tool={tool} />
            </span>
            <span className="whitespace-nowrap">{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
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

function SupportAudienceCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const style = audienceCardStyles[index % audienceCardStyles.length];

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: EASE }}>
      <Link
        href={study.href}
        className={`group flex h-full flex-col rounded-3xl border p-6 transition-colors duration-500 hover:shadow-card md:p-7 ${style.border} ${style.bg} ${style.hover}`}
      >
        <span className="text-[11px] font-bold tracking-[0.16em] text-pine-700/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="mt-4 flex-1">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{study.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{study.subtitle}</p>
        </div>
        <span className={`mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold ${style.accent}`}>
          Explore how we help
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function ExpertProfileCard({ expert }: { expert: Expert }) {
  return (
    <article
      aria-label={`${expert.name}, ${expert.role}`}
      className="group relative overflow-hidden rounded-[28px]"
    >
      <PhotoCard
        src={expert.photo}
        className="aspect-[0.9] transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
      />
      <div
        className="photo-text-overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{expert.role}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{expert.name}</h3>
        <Link
          href={`/about/${expert.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 transition-colors hover:text-white"
        >
          Read more
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function PlanCard({
  plan,
  onContact,
}: {
  plan: (typeof plans)[number];
  onContact: () => void;
}) {
  const featured = Boolean(plan.featured);

  return (
    <motion.article
      variants={fadeUp}
      className={`relative flex flex-col rounded-[28px] border p-7 md:p-8 ${
        featured
          ? "border-pine-900 bg-pine-900 text-paper shadow-lift lg:-mt-4"
          : "border-ink/10 bg-white shadow-card transition-shadow duration-500 ease-premium hover:shadow-lift"
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
      <div
        className={`mt-4 space-y-3 text-sm leading-7 ${
          featured ? "text-paper/70" : "text-muted"
        }`}
      >
        {plan.copy.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {featured ? (
        <button type="button" onClick={onContact} className={`${btn.accent} mt-8 w-full`}>
          Book a discovery call
        </button>
      ) : null}
    </motion.article>
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
  const [openCase, setOpenCase] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [contactStep, setContactStep] = useState<"form" | "submitted" | "calendly">("form");
  const [preferredContact, setPreferredContact] = useState("Email");
  const [supportType, setSupportType] = useState("Assessment");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState<boolean | null>(null);
  const [previewPosts, setPreviewPosts] = useState<PostPreview[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

      {/* ------------------------------------------------------------ */}
      {/* Hero — deep pine panel with soft tonal glows                  */}
      {/* ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-pine-900 px-4 pb-36 pt-5 text-paper md:px-8 md:pb-44">
        <div className="simplified-hide pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 right-[-12%] h-[480px] w-[480px] rounded-full bg-pine-700/50 blur-3xl" />
          <div className="absolute left-[-8%] top-1/3 h-[380px] w-[380px] rounded-full bg-pine-800/60 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[20%] h-72 w-72 rounded-full bg-acid/[0.06] blur-3xl" />
        </div>

        <nav className="relative mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-6 text-xs font-semibold text-paper/60 md:flex">
            <a href="/founders-entrepreneurs" className="transition-colors duration-200 hover:text-paper">Founders</a>
            <a href="/small-business" className="transition-colors duration-200 hover:text-paper">Small Business</a>
            <a href="/charities-non-profits" className="transition-colors duration-200 hover:text-paper">Charities</a>
            <a href="/#experts" className="transition-colors duration-200 hover:text-paper">About</a>
            <a href="#faq" className="transition-colors duration-200 hover:text-paper">FAQ</a>
            <a href="/insights" className="text-acid/70 transition-colors duration-200 hover:text-acid">Insights &amp; Resources</a>
          </div>
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="hidden rounded-full bg-acid px-5 py-2 text-xs font-semibold text-ink transition-all duration-300 ease-premium hover:brightness-[1.04] hover:shadow-lift md:inline-flex"
          >
            Get in touch
          </button>
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-colors duration-200 hover:border-white/35 md:hidden"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileNavOpen && (
          <div className="relative mx-auto max-w-6xl md:hidden">
            <div className="mt-3 flex flex-col gap-1 rounded-3xl border border-white/10 bg-pine-950/90 p-4 backdrop-blur">
              {[
                { label: "Founders", href: "/founders-entrepreneurs" },
                { label: "Small Business", href: "/small-business" },
                { label: "Charities", href: "/charities-non-profits" },
                { label: "About", href: "/#experts" },
                { label: "FAQ", href: "#faq" },
                { label: "Insights & Resources", href: "/insights" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-paper/80 transition-colors duration-200 hover:bg-white/10 hover:text-paper"
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => { setMobileNavOpen(false); setIsContactModalOpen(true); }}
                className="mt-2 rounded-full bg-acid px-4 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Get in touch
              </button>
            </div>
          </div>
        )}

        <div className="relative mx-auto mt-16 grid max-w-6xl gap-14 md:mt-20 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-2xl text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.025em] md:text-7xl"
            >
              Reduce admin. Keep the Human Touch.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-base leading-7 text-paper/70 md:text-lg md:leading-8"
            >
              We help founders, small businesses and charities reduce admin, streamline operations and make AI a practical part of everyday work through the right combination of AI, automation, smarter processes and hands-on in person or virtual administrative support.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#services" className={btn.accent}>
                Explore Support
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: EASE }}
          className="relative mx-auto mt-24 max-w-6xl"
        >
          <p className="mx-auto max-w-2xl text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/40">
            AI and automation is not always the answer, but when it is, we help you make the most of it.
          </p>
          <div className="mt-7">
            <ToolMarquee />
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* AI can do the task, someone still has to make it work — leads */}
      {/* straight into the Who VAxAI is for cards                      */}
      {/* ------------------------------------------------------------ */}
  <section id="services" className="relative px-4 py-16 md:px-8 md:py-24">
  <div className="mx-auto max-w-6xl">
    <Reveal>
      <h2 className="max-w-3xl text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-4xl">
  Technology Doesn't Reduce Admin on Its Own
</h2>

<p className="mt-6 text-lg leading-8 text-muted md:text-xl md:leading-9">
 Founders, small businesses and charities are expected to do more with less. With limited time, funding and resources, every hour spent managing administration is time taken away from serving customers, supporting communities and growing their organisation.
</p>

<p className="mt-5 text-lg leading-8 text-muted md:text-xl md:leading-9">
 AI and automation can be powerful tools for reducing repetitive work, saving time and improving efficiency. But without a clear strategy, they don’t always simplify the way work gets done. Technology still needs to be thoughtfully implemented, managed, maintained and adapted over time—creating new responsibilities that many founders, small businesses and charities don’t have the capacity to manage alone.
</p>

<p className="mt-6 text-lg leading-8 text-muted md:text-xl md:leading-9">
  That’s where VAxAI comes in. We help you identify where AI can add genuine value, where automation can reduce repetitive work, where processes can be improved, and where hands-on administrative support—whether delivered virtually or in person—is the right solution.
</p>

<p className="mt-5 text-lg leading-8 text-muted md:text-xl md:leading-9">
  The result is practical systems that fit the way your organisation works, trusted support as your needs evolve, and more time to focus on the people, projects and priorities that matter most.
</p>

<p className="mt-8 text-lg font-medium leading-8 text-ink md:text-xl md:leading-9">
  Explore how VAxAI can support you
</p>
    </Reveal>

    <div className="mt-10">
      <Stagger className="grid gap-4 sm:grid-cols-3">
        {caseStudies.map((study, index) => (
          <SupportAudienceCard
            key={study.href}
            study={study}
            index={index}
          />
        ))}
      </Stagger>
    </div>
  </div>
</section>

      {/* ------------------------------------------------------------ */}
      {/* About — MT1L, the VAT Framework, then the people              */}
      {/* ------------------------------------------------------------ */}
      <section id="experts" className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-3xl">
            <Eyebrow>About</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[2.75rem]">
              About VAxAI
            </h2>
            <p className="mt-6 text-base leading-7 text-muted md:text-lg md:leading-8">
              VAxAI is a service by MT1L, home of the VAT Framework (Value &bull; Alignment &bull; Trust). Everything we do is grounded in the belief that decisions about AI should be based on where it creates genuine value, aligns with existing ways of working and can be fully trusted by the people who use and engage with it. 
            </p>
            <a
              href="https://mt1l.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn.ghostLight} mt-6`}
            >
              Check out MT1L
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>

          <Reveal className="mt-16 md:mt-20">
            <Eyebrow>The people behind VAxAI</Eyebrow>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {experts.map((expert) => (
              <Reveal key={expert.name}>
                <ExpertProfileCard expert={expert} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* FAQ — split layout with smooth accordion                      */}
      {/* ------------------------------------------------------------ */}
      <section id="faq" className="px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.75fr_1fr] md:gap-16">
          <Reveal>
            <Eyebrow>Frequently asked questions</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[2.75rem]">
              Questions about VAxAI?
            </h2>
            <p className="mt-6 max-w-prose text-sm leading-7 text-muted">
              Clear answers on how we assess your workflow, design AI support, and provide ongoing virtual assistance for everyday admin.
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
      <section className="px-4 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Insights &amp; Resources</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-4xl">
                From VAxAI
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
                Our insights cover practical approaches to AI, automation and admin. If something
                resonates, you can attach it to your enquiry when you get in touch.
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
                Less admin, more progress on your mission and growth.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-paper/65 md:text-base md:leading-8">
                Tell us where the pressure is building and we&apos;ll help you find the practical mix of process, automation and human support to ease it.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => setIsContactModalOpen(true)} className={btn.accent}>
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsAccessModalOpen(true)} className={btn.ghostDark}>
                  Access to Work support
                </button>
              </div>
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
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
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
                        { value: "Assessment", label: "Assessment" },
                        { value: "Assessment + Strategy & Implementation", label: "Assessment + Strategy & Implementation" },
                        { value: "Assessment + Ongoing Support", label: "Assessment + Ongoing Support" },
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

      {openCase !== null && caseStudies[openCase] && !caseStudies[openCase].placeholder ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenCase(null); }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-6 rounded-t-[28px] bg-pine-900 px-6 py-6 text-paper md:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Case study</p>
                <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight tracking-tight">{caseStudies[openCase].title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenCase(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper transition-colors duration-200 hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white p-6 md:p-10">
              <p className="text-sm leading-7 text-muted">{caseStudies[openCase].teaser}</p>
              {caseStudies[openCase].paragraphs?.map((p, pi) => (
                <p key={pi} className="mt-4 text-sm leading-7 text-muted">{p}</p>
              ))}
              {caseStudies[openCase].workflowPoints && (
                <ul className="mt-4 grid gap-2 rounded-2xl border border-ink/10 bg-white p-5">
                  {caseStudies[openCase].workflowPoints!.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm leading-6 text-muted">
                      <span className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-ink/20" aria-hidden="true" />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {caseStudies[openCase].results && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine-800">Results</p>
                  <ul className="mt-3 grid gap-2">
                    {caseStudies[openCase].results!.map((r) => (
                      <li key={r} className="flex gap-3 text-sm leading-6 text-muted">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {caseStudies[openCase].closing && (
                <p className="mt-6 text-sm leading-7 text-muted italic">{caseStudies[openCase].closing}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => { setOpenCase(null); setIsContactModalOpen(true); }}
                  className={btn.primary}
                >
                  Work with us
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCase(null)}
                  className={btn.ghostLight}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAccessModalOpen ? (
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
