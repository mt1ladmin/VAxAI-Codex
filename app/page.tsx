"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MailCheck,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

const image = {
  hero:
    "/hero-remote-work-circles.jpg",
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
    name: "Zapier",
    logo: "https://cdn.simpleicons.org/zapier/FF4F00",
  },
  {
    name: "Gemini",
    logo: "https://cdn.simpleicons.org/googlegemini/8E75B2",
  },
  {
    name: "ChatGPT",
    logo: "https://cdn.simpleicons.org/chatgpt/74AA9C",
  },
  {
    name: "n8n",
    logo: "https://cdn.simpleicons.org/n8n/EA4B71",
  },

  
];

const features = [
  {
    mark: "01",
    title: "Find where admin is building up",
    copy: "We review your inboxes, records, tools, processes and follow-ups to understand what is taking time, creating delays or being missed.",
  },
  {
    mark: "02",
    title: "Make better use of what you have",
    copy: "We identify where existing tools, clearer processes, training, automation or AI support could reduce repetitive work.",
  },
  {
    mark: "03",
    title: "Keep everyday admin moving",
    copy: "Messages, calendars, documents, data entry, reports and follow-ups stay organised and up to date.",
  },
  {
    mark: "04",
    title: "Add human support where needed",
    copy: "Trained VA support manages follow-through, handles exceptions and makes sure important work reaches the right person.",
  },
];

const experts = [
  {
    name: "Thesia Kouloungou",
    role: "AI & Workflow Lead",
    copy: "Hi, I am the founder and CEO of MT1L and VAxAI. I lead our AI consultations and workflow reviews, helping you decide where automation creates meaningful value, where it does not, and what needs human judgement.",
    photo: image.thesia,
  },
  {
    name: "Rebecca Bradshaw",
    role: "Virtual Assistance Lead",
    copy: "Hi, I am Rebecca. I lead the virtual assistance side of VAxAI, taking care of the tasks that should not be left to AI and helping monitor your automations so everything works as it should. When extra capacity is needed, I help coordinate trained and vetted VA partners who understand your setup.",
    photo: image.rebecca,
  },
];

const plans = [
  {
    step: "01",
    title: "Assessment",
    label: "Assess",
    journeyTone: "from-white via-mint/30 to-white",
    accentRing: "ring-forest/10",
    copy: [
      "A focused review of your admin workload, tools, processes and team — identifying where pressure is building and what the right response looks like.",
    ],
    items: ["VAT Framework review", "AI value and risk map", "Workflow and capacity review", "Practical recommendations and next steps"],
    buildsOn: null as string | null,
  },
  {
    step: "02",
    title: "Strategy, Implementation & Capability Building",
    label: "Implement",
    journeyTone: "from-white via-acid/10 to-mint/20",
    accentRing: "ring-forest/15",
    copy: [
      "We put the right solution in place based on your assessment — improving processes, making better use of existing tools, introducing new systems or training your team.",
    ],
    items: ["Tool selection and implementation support", "Team training and capability building", "Documentation and handover"],
    buildsOn: "Assess",
  },
  {
    step: "03",
    title: "Recommended: Ongoing Support",
    label: "Support",
    featured: true,
    journeyTone: "from-acid/15 via-white to-mint/25",
    accentRing: "ring-forest/20",
    copy: [
      "Continued support after implementation — VA assistance, system monitoring and ongoing adjustments as your workload and priorities change.",
    ],
    items: ["Process and system optimisation", "Team support and guidance", "Dedicated support hours within your package"],
    buildsOn: "Implement",
  },
];

const vatPrinciples = [
  ["01", "Value", "Will this meaningfully reduce admin pressure, save time or create more capacity for the work your organisation needs to do?"],
  ["02", "Alignment", "Will it fit your existing tools, data, processes, people and ways of working without creating more complexity?"],
  ["03", "Trust", "Will the people using it understand how it works, know when human judgement is involved and feel confident that your work and information are protected?"],
];

const faqs = [
  ["Who is VAxAI for?", "Small businesses, charities, consultants, and teams that want admin, workflow automation, and AI support without losing the human judgement their work needs."],
  ["What does the assessment include?", "It is based on your unique case. We consult with you, review current tools and data, identify where AI adds value, and give you a practical setup plan you can use yourself or ask us to build."],
  ["How do you decide whether AI is needed?", "We use the MT1L VAT framework: will it create meaningful Value, fit the reality of how work gets done, and be trusted by the people affected? If AI is not the answer, we say so."],
  ["Why does pricing vary?", "Complexity, data quality, business size, integrations, dashboards, and ongoing support all affect the final cost. We explain this after assessment before any build starts."],
  ["What does VA oversight mean?", "A trained VA understands your automation, monitors exceptions, manages tasks AI should not touch, and reduces the stress of AI going rogue."],
  ["Can support be flexible?", "Yes. Once you are a VAxAI client, support can be ad hoc, weekly, monthly, or annual. We can also provide in-person support at extra cost when needed."],
];

const whyPrinciples = [
  ["01", "One team throughout", "The people supporting your day-to-day work understand the decisions and setup behind it, reducing repeated explanations and disconnected handovers."],
  ["02", "You stay in control", "We explain recommendations clearly, document what is introduced and make sure you approve the tools and changes affecting your organisation."],
  ["03", "Designed to stay useful", "Your setup is shaped around your organisation rather than a fixed package, so it can be adjusted as your workload, team or priorities change."],
  ["04", "Capacity when you need it", "You can increase or reduce your VA support as your needs change. When additional capacity is required, we bring in trusted partners and train them on your setup at no additional cost."],
];

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  viewport: { once: true, margin: "-60px" },
};

const staggerChild = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

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
    <a href="#top" className="flex items-center gap-2 font-semibold text-paper">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-acid text-[11px] font-bold text-ink">
        VA
      </span>
      <span className="text-sm tracking-tight">VAxAI</span>
    </a>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  light = false,
  narrow = false,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  light?: boolean;
  narrow?: boolean;
}) {
  return (
    <motion.div {...reveal} className={`mx-auto text-center ${narrow ? "max-w-xl" : "max-w-2xl"}`}>
      {eyebrow ? (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] ${light ? "text-acid" : "text-muted"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-semibold leading-[1.08] md:text-5xl ${light ? "text-paper" : "text-ink"}`}>
        {title}
      </h2>
      {copy ? (
        <p className={`mx-auto mt-5 text-sm leading-6 md:text-base ${light ? "text-paper/70" : "text-muted"}`}>
          {copy}
        </p>
      ) : null}
    </motion.div>
  );
}

function ToolLogo({ tool }: { tool: (typeof tools)[number] }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <span className="grid h-8 w-8 place-items-center text-xs font-bold text-[#063b32]" aria-hidden="true">
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
      className="h-8 w-8 object-contain"
      loading="lazy"
      onError={() => setHasFailed(true)}
    />
  );
}

function ToolScroller() {

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="flex min-w-0 items-center justify-center gap-3 text-sm font-semibold text-ink"
            aria-label={tool.name}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center">
              <ToolLogo tool={tool} />
            </span>
            <span className="min-w-0 leading-tight">{tool.name}</span>
          </div>
        ))}
    </div>
  );
}

function SectionWave({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-12 w-full overflow-hidden ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
      <div className="simplified-hide absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid/20 blur-2xl" />
    </div>
  );
}

function GeometricDivider() {
  const nodes = [
    ["left-[7%] top-10 h-28 w-28 rounded-full bg-acid/35 blur-[1px]"],
    ["left-[24%] bottom-10 h-16 w-16 rounded-full bg-[#f28a4b]/20"],
    ["left-[43%] top-16 h-20 w-20 rounded-full bg-[#8fd0b0]/25"],
    ["right-[23%] bottom-12 h-14 w-14 rotate-12 rounded-2xl bg-[#f6c84f]/25"],
    ["right-[8%] top-10 h-32 w-32 rounded-full bg-[#4479a8]/15"],
  ];

  return (
    <motion.div
      {...reveal}
      className="relative px-6 py-16 text-ink md:py-20"
      aria-hidden="true"
    >
      <div className="section-divider-soft mb-10" />
      <div className="simplified-hide relative h-28 opacity-90">
        {nodes.map(([classes], index) => (
          <motion.span
            key={index}
            className={`absolute block ${classes}`}
            animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <span className="absolute left-[15%] top-1/2 h-px w-[70%] -translate-y-1/2 bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactStep, setContactStep] = useState<"form" | "submitted" | "calendly">("form");
  const [preferredContact, setPreferredContact] = useState("Email");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState<boolean | null>(null);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vaxai-simplified") === "true";
    if (saved) { setIsSimplifiedMode(true); document.documentElement.classList.add("simplified-mode"); }
  }, []);

  const toggleSimplified = () => {
    const next = !isSimplifiedMode;
    setIsSimplifiedMode(next);
    localStorage.setItem("vaxai-simplified", String(next));
    document.documentElement.classList.toggle("simplified-mode", next);
  };

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
    <main id="top" className={`min-h-screen bg-paper text-ink ${isSimplifiedMode ? "simplified-mode" : ""}`}>
      <button
        type="button"
        onClick={toggleSimplified}
        className={`simplified-toggle fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_14px_35px_rgba(17,17,17,0.18)] transition ${
          isSimplifiedMode ? "border-ink bg-ink text-paper" : "border-ink/10 bg-white text-ink"
        }`}
        aria-pressed={isSimplifiedMode}
        aria-label={isSimplifiedMode ? "Turn full colour mode back on" : "Turn simplified black and white mode on"}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">{isSimplifiedMode ? "Show colour" : "Simplified mode"}</span>
      </button>

      <section className="section-forest relative overflow-hidden px-4 pb-20 pt-5 text-paper md:px-8 md:pb-24">
        <div className="simplified-hide pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-acid/10 blur-3xl" aria-hidden="true" />
        <div className="simplified-hide pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-7 text-xs font-semibold text-paper/65 md:flex">
            <a href="#services" className="transition-colors hover:text-paper">Services</a>
            <a href="#experts" className="transition-colors hover:text-paper">About</a>
            <a href="#pricing" className="transition-colors hover:text-paper">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-paper">FAQ</a>
            <a href="/insights" className="text-acid/80 transition-colors hover:text-acid">Insights</a>
          </div>
          <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-primary hidden px-4 py-2 text-xs md:inline-flex">
            Get in touch
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 transition-colors hover:border-white/25 md:hidden" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </nav>

        <div className="relative mx-auto mt-16 grid max-w-6xl gap-12 md:grid-cols-[1fr_0.85fr] md:items-center md:gap-10">
          <motion.div {...reveal}>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              When admin takes over, VAxAI steps in
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/70 md:text-lg md:leading-8">
              We help small businesses, charities, solo founders and busy teams reduce repetitive admin by making everyday tasks, follow-ups and information easier to manage, track and complete.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-primary">
                Start your workflow review
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
          <motion.div {...reveal} className="relative mx-auto w-full max-w-[420px]">
            <div className="simplified-hide absolute -inset-3 rounded-4xl bg-acid/10 blur-xl" aria-hidden="true" />
            <PhotoCard src={image.hero} className="relative aspect-[0.86] rounded-4xl shadow-[0_24px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/10" />
          </motion.div>
        </div>
      </section>

      <section className="section-flow-top bg-paper px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="grid gap-10 md:grid-cols-[0.9fr_1.4fr] md:items-start md:gap-12">
            <div>
              <p className="eyebrow text-muted">Sound familiar?</p>
              <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
                Does any of this sound familiar?
              </h2>
            </div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="grid gap-3">
              {[
                "Too much time is being spent on emails, follow-ups, scheduling, reporting and other essential admin that leaves less capacity for strategic, client-facing or service-delivery work.",
                "Work keeps falling between the cracks because information, responsibilities or processes are spread across too many places.",
                "You know there must be a better way of working but are unsure whether the answer is new technology, better processes, additional support or a combination of all three.",
              ].map((item) => (
                <motion.div key={item} variants={staggerChild} className="card-surface flex gap-4 rounded-2xl p-5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-acid/40 text-xs font-semibold text-forest">→</span>
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <GeometricDivider />
        </div>
      </div>

      <SectionWave />
      <section id="services" className="section-forest relative px-4 py-20 text-paper md:px-8 md:py-28">
        <div className="simplified-hide pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-paper/8 to-transparent" aria-hidden="true" />
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="How VAxAI helps you get admin under control"
            copy="From enquiries and diary management to files, records, reports and follow-ups, we help you create workable systems your team can understand, use and maintain."
            narrow
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-center">
            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="grid gap-5">
              {features.slice(0, 2).map((feature) => (
                <motion.article key={feature.title} variants={staggerChild} className="card-forest rounded-2xl p-6">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-acid/90 text-xs font-semibold text-ink">{feature.mark}</span>
                  <h3 className="mt-6 text-lg font-semibold leading-snug">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-paper/65">{feature.copy}</p>
                </motion.article>
              ))}
            </motion.div>
            <motion.div {...reveal} className="relative">
              <PhotoCard src={image.expert} className="aspect-[0.78] rounded-2xl ring-1 ring-white/10" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-ink/5 bg-paper/95 p-4 text-ink shadow-lift backdrop-blur-sm">
                <p className="text-sm font-semibold">AI admin support that stays human</p>
                <p className="mt-1 text-xs leading-5 text-muted">Technology supports the work. Trained VAs keep people in control.</p>
              </div>
            </motion.div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="grid gap-5">
              {features.slice(2).map((feature) => (
                <motion.article key={feature.title} variants={staggerChild} className="card-forest rounded-2xl p-6">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-acid/90 text-xs font-semibold text-ink">{feature.mark}</span>
                  <h3 className="mt-6 text-lg font-semibold leading-snug">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-paper/65">{feature.copy}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>

          <motion.div
            {...reveal}
            id="access-to-work"
            className="card-forest mt-14 flex flex-col gap-6 rounded-2xl p-7 md:flex-row md:items-center md:justify-between md:p-8"
          >
            <div>
              <p className="eyebrow text-acid">Access to Work</p>
              <h3 className="mt-3 max-w-xl text-2xl font-semibold leading-tight text-paper">
                Your VAxAI support could cost you nothing
              </h3>
              <p className="mt-2 text-sm leading-6 text-paper/65">Want to find out more?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(true)}
              className="btn-primary shrink-0"
            >
              Learn about Access to Work
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <section id="experts" className="section-forest-soft section-flow-top px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="Meet the people behind VAxAI" narrow />
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="mt-12 grid gap-6 md:grid-cols-2">
            {experts.map((expert, index) => (
              <motion.article key={expert.name} variants={staggerChild} className="card-surface overflow-hidden rounded-3xl p-3">
                {expert.photo ? (
                  <PhotoCard src={expert.photo} className="aspect-[0.82] rounded-2xl" />
                ) : (
                  <div className={`grid aspect-[0.82] place-items-end rounded-2xl p-5 ${index === 1 ? "bg-acid/30" : "bg-cream"}`}>
                    <span className="text-5xl font-black leading-none text-ink">+</span>
                  </div>
                )}
                <div className="p-5">
                  <p className="eyebrow text-forest/70">{expert.role}</p>
                  <h3 className="mt-2 text-lg font-semibold">{expert.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{expert.copy}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="bg-paper px-4 pb-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Three ways to work with us"
            copy="Every organisation is different. We start by understanding how work happens today and recommend the right mix — whether that means improving existing systems, implementing new ones, or combining technology with human support."
            narrow
          />
          <motion.div {...reveal} className="mt-12 rounded-3xl border border-ink/8 bg-white/80 p-4 shadow-card backdrop-blur-sm md:p-5">
            <div className="simplified-hide mb-4 hidden items-center justify-center gap-2 px-4 lg:flex" aria-hidden="true">
              {plans.map((plan, index) => (
                <div key={plan.label} className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${plan.featured ? "bg-forest text-acid" : "bg-cream text-forest"}`}>
                    {plan.label}
                  </span>
                  {index < plans.length - 1 ? <span className="h-px w-10 bg-gradient-to-r from-forest/20 to-forest/5" /> : null}
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.title}
                  className={`relative flex flex-col rounded-2xl border bg-gradient-to-br p-6 ring-1 ${plan.accentRing} ${plan.journeyTone} ${plan.featured ? "border-forest/20 shadow-lift lg:-mt-1 lg:mb-1" : "border-ink/8"}`}
                >
                  <div className="flex min-h-6 items-center justify-between gap-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-forest/15 bg-white/80 text-xs font-bold text-forest shadow-sm">
                      {plan.step}
                    </span>
                    {plan.featured ? (
                      <span className="rounded-full bg-acid/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-muted">{plan.title}</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-forest">{plan.label}</h3>
                  {plan.buildsOn ? (
                    <p className="mt-2 text-xs font-semibold text-forest/60">Builds on {plan.buildsOn}</p>
                  ) : null}
                  <div className="mt-4 min-h-20 space-y-3 text-sm leading-6 text-muted">
                    {plan.copy.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <ul className="mt-8 flex-1 space-y-3 border-t border-ink/8 pt-6 text-sm">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-acid/70 text-[10px] font-black text-ink">✓</span>
                        <span className="leading-6">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.featured ? (
                    <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-forest mt-8 w-full justify-center">
                      Book a discovery call
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
            <div className="mt-4 grid gap-4 rounded-2xl border border-forest/10 bg-gradient-to-br from-mint/60 to-white p-6 text-sm leading-6 text-muted md:grid-cols-[1fr_0.9fr]">
              <p>
                Pricing is tailored to each client and depends on factors such as organisational complexity, existing systems, implementation requirements, training needs and the level of ongoing support required. This may differ for businesses, charities, consultants, founders and individual professionals.
              </p>
              <p>
                Before any assessment begins, we will discuss your requirements and provide a clear quotation for the recommended scope of work.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionWave flip />
      <section className="section-forest relative px-4 py-20 text-paper md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Value, Alignment and Trust"
            copy="VAxAI uses the MT1L VAT Framework to decide whether existing tools, new systems, AI, automation or human support are the right fit."
            narrow
          />
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="mt-12 grid gap-5 md:grid-cols-3">
            {vatPrinciples.map(([step, title, copy]) => (
              <motion.article key={step} variants={staggerChild} className="card-forest rounded-2xl p-7">
                <p className="text-sm font-semibold text-acid">{step}</p>
                <h3 className="mt-8 text-xl font-semibold leading-snug">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-paper/65">{copy}</p>
              </motion.article>
            ))}
          </motion.div>
          <motion.div {...reveal} className="mx-auto mt-12 max-w-3xl text-center">
            <p className="text-sm leading-7 text-paper/68">
              We do not introduce AI or automation simply because it is possible. We recommend it only where it adds value, fits your organisation and can be used with confidence.
            </p>
            <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-acid transition-opacity hover:opacity-80">
              Want to learn more about MT1L and the VAT Framework? Check us out
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="section-paper-warm section-flow-top px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Why choose VAxAI?"
            copy="We are not here to force a technical solution where it does not fit. Our priority is helping you choose, use and sustain the right mix of support, systems and tools for your organisation."
            narrow
          />
          <motion.div {...reveal} className="mt-12 overflow-hidden rounded-3xl border border-ink/8 bg-white/90 p-4 shadow-card md:p-5">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.35fr]">
              <div className="relative overflow-hidden rounded-2xl border border-forest/10 bg-gradient-to-br from-mint/80 via-white to-cream/40 p-7 md:p-8">
                <div className="simplified-hide absolute right-[-36px] top-[-36px] h-32 w-32 rounded-full bg-acid/35 blur-sm" />
                <div className="simplified-hide absolute bottom-[-44px] left-[-28px] h-28 w-28 rounded-full bg-[#4479a8]/10 blur-sm" />
                <div className="relative">
                  <p className="eyebrow text-forest">VAxAI support</p>
                  <h3 className="mt-5 max-w-sm text-3xl font-semibold leading-[1.08] tracking-tight text-ink">
                    Support that stays useful as your needs change.
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
                    One team understands your systems and provides the capacity needed to keep work moving.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    {["Continuity", "Ownership", "Capacity"].map((item) => (
                      <span key={item} className="rounded-xl border border-forest/10 bg-white/90 px-2 py-3 text-forest shadow-sm transition-transform hover:-translate-y-0.5">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="grid gap-3">
                {whyPrinciples.map(([number, title, copy]) => (
                  <motion.article key={number} variants={staggerChild} className="card-surface grid gap-4 rounded-2xl p-6 sm:grid-cols-[64px_1fr] md:p-7">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-sm font-semibold text-forest">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
            <div className="mt-4 rounded-2xl border border-forest/10 bg-gradient-to-r from-acid/25 via-acid/15 to-mint/30 px-6 py-4 text-center text-sm font-semibold text-forest md:px-8">
              Continuity · clear ownership · documented systems · support that can grow
            </div>
          </motion.div>
        </div>
      </section>

      <section id="faq" className="bg-paper px-4 pb-24 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.75fr_1fr] md:gap-12">
          <motion.div {...reveal}>
            <p className="eyebrow text-muted">Frequently asked questions</p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">Questions about VAxAI?</h2>
            <p className="mt-5 text-sm leading-7 text-muted">Clear answers on how we assess your workflow, design AI support, and provide ongoing virtual assistance for everyday admin.</p>
          </motion.div>
          <motion.div {...reveal} className="divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group p-5 transition-colors hover:bg-cream/20 md:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-semibold leading-snug">
                  {question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-forest/50 transition duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted">{answer}</p>
              </details>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="contact" className="px-4 pb-20 md:px-8">
        <motion.div {...reveal} className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card md:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-12">
            <p className="eyebrow text-forest">VAxAI support to book</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl">Admin support that can grow with you</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted">Start with a workflow call and leave with a clearer sense of what should be automated, what should stay human, and what support your small business or charity actually needs.</p>
            <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-forest mt-8">
              Book a discovery call
              <MailCheck className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-cream to-mint/40 p-3 md:p-4">
            <PhotoCard src={image.cta} className="min-h-[320px] rounded-2xl ring-1 ring-ink/5" />
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-ink/8 bg-gradient-to-b from-cream/40 to-paper px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1.4fr] md:gap-12">
            <div>
              <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest text-sm font-bold text-acid shadow-lift">VA</span>
                <span>VAxAI</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                Reducing repetitive admin so small businesses, charities and busy teams can focus on what matters.
              </p>
              <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-forest mt-6 text-xs">
                Get in touch
              </button>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
              <div>
                <p className="eyebrow text-forest/80">Services</p>
                <div className="mt-4 grid gap-2.5 text-muted">
                  <a href="#pricing" className="transition-colors hover:text-ink">Assess</a>
                  <a href="#pricing" className="transition-colors hover:text-ink">Implement</a>
                  <a href="#pricing" className="transition-colors hover:text-ink">Support</a>
                </div>
              </div>
              <div>
                <p className="eyebrow text-forest/80">Company</p>
                <div className="mt-4 grid gap-2.5 text-muted">
                  <a href="#experts" className="transition-colors hover:text-ink">About</a>
                  <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">MT1L</a>
                  <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left transition-colors hover:text-ink">Contact</button>
                </div>
              </div>
              <div>
                <p className="eyebrow text-forest/80">Resources</p>
                <div className="mt-4 grid gap-2.5 text-muted">
                  <a href="/insights" className="transition-colors hover:text-ink">Insights</a>
                  <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
                  <a href="#access-to-work" className="transition-colors hover:text-ink">Access to Work</a>
                </div>
              </div>
              <div>
                <p className="eyebrow text-forest/80">Legal</p>
                <div className="mt-4 grid gap-2.5 text-muted">
                  <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left transition-colors hover:text-ink">Privacy</button>
                  <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left transition-colors hover:text-ink">Terms</button>
                  <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left transition-colors hover:text-ink">EDI policy</button>
                  <a href="/admin/login" className="mt-1 w-fit text-xs text-muted/50 transition-colors hover:text-muted">VAxAI Studio</a>
                </div>
              </div>
            </div>
          </div>
          <div className="section-divider-soft mt-12" />
          <p className="mt-6 text-xs text-muted/70">© {new Date().getFullYear()} VAxAI. All rights reserved.</p>
        </div>
      </footer>

      {isContactModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
        >
          {contactStep === "calendly" ? (
            <div className="flex h-full max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-md bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
              <div className="flex shrink-0 items-center justify-between gap-6 bg-[#063b32] px-6 py-5 text-paper md:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Discovery call</p>
                  <h2 className="mt-1 text-xl font-semibold leading-tight">Book a time with us</h2>
                </div>
                <button type="button" onClick={closeContactModal} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Close">
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
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
              <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Contact VAxAI</p>
                  <h2 id="contact-title" className="mt-3 text-3xl font-semibold leading-tight">
                    {contactStep === "submitted" ? "Enquiry sent" : "Tell us what support you need"}
                  </h2>
                </div>
                <button type="button" onClick={closeContactModal} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Close contact form">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {contactStep === "submitted" ? (
                <div className="p-6 md:p-10">
                  <p className="text-sm leading-7 text-muted">
                    Thank you — we have received your message and will be in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={closeContactModal}
                    className="mt-6 inline-flex items-center rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
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
                    <input required name="name" autoComplete="name" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Email address
                    <input required type="email" name="email" autoComplete="email" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Support type
                    <select required name="supportType" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]">
                      <option>Assessment</option>
                      <option>Assessment + Strategy &amp; Implementation</option>
                      <option>Assessment + Ongoing Support</option>
                      <option>Access to Work</option>
                      <option>General enquiry</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Preferred method of contact
                    <select name="preferredContact" value={preferredContact} onChange={(event) => setPreferredContact(event.target.value)} className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]">
                      <option>Email</option>
                      <option>Telephone</option>
                    </select>
                  </label>
                  {preferredContact === "Telephone" ? (
                    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                      Telephone number
                      <input required type="tel" name="telephone" autoComplete="tel" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                    </label>
                  ) : null}
                  <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                    Tell us more
                    <textarea required name="details" rows={5} className="resize-y rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                  </label>
                  <div className="rounded-md border border-[#063b32]/20 bg-[#f3f9f5] p-5 md:col-span-2">
                    <p className="font-semibold text-ink">Would you like to book a discovery call?</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      A 30-minute conversation to explore your challenge and whether we are the right fit.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setWantsDiscoveryCall(true)}
                        className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                          wantsDiscoveryCall === true
                            ? "border-[#063b32] bg-[#063b32] text-[#f5f274]"
                            : "border-ink/15 bg-white text-ink hover:border-[#063b32]/40"
                        }`}
                      >
                        Yes, book a call
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantsDiscoveryCall(false)}
                        className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
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
                    <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper">
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
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-work-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Access to Work</p>
                <h2 id="access-work-title" className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
                  Your support might cost you nothing
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper"
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

                <div className="mt-6 rounded-md border border-ink/10 bg-cream p-5">
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
                    className="inline-flex items-center justify-center rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper"
                  >
                    Talk to us about Access to Work
                  </button>
                  <a
                    href="https://www.gov.uk/access-to-work"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Official GOV.UK guidance
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="rounded-md border border-[#063b32]/15 bg-white p-5">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-acid text-ink">
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
                    <div key={title} className="rounded-md bg-paper p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#063b32]">{title}</p>
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

        .simplified-mode a,
        .simplified-mode button {
          text-decoration: underline;
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

        .simplified-mode .simplified-toggle {
          background: #000 !important;
          border-color: #000 !important;
          color: #fff !important;
          text-decoration: none;
        }

        .simplified-mode .simplified-toggle * {
          background: transparent !important;
          border-color: #fff !important;
          color: #fff !important;
        }
      `}</style>
    </main>
  );
}
