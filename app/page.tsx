"use client";

import { useState } from "react";
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
    name: "Make",
    logo: "https://cdn.simpleicons.org/make/6D28D9",
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
    title: "Simplify repetitive work",
    copy: "We identify which repeated tasks can be simplified, connected or automated—and which still need human judgement.",
  },
  {
    mark: "03",
    title: "Keep everyday admin moving",
    copy: "Messages, calendars, documents, data entry, reports and follow-ups stay organised and up to date.",
  },
  {
    mark: "04",
    title: "Handle the work automation cannot",
    copy: "Trained VA support monitors processes, deals with exceptions and makes sure important work reaches the right person.",
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
    price: "Standalone from £1,500 + VAT",
    copy: "A tailored consultation to understand your admin workload, existing tools, data, people and support needs before anything is designed or built.",
    items: ["VAT Framework review", "AI value and risk map", "Practical setup plan", "Build and support recommendations"],
  },
  {
    step: "02",
    title: "Full Build",
    label: "Assess + Build",
    price: "From £5,000 + VAT",
    copy: "Using the findings from your assessment, we design and implement the systems and processes needed to reduce administrative pressure and keep work moving.",
    items: ["Everything included in Assess", "Tailored system and process design", "Tool setup and system connections", "Testing, team handover and training"],
  },
  {
    step: "03",
    title: "Recommended: Full Package",
    label: "Assess + Build + Support",
    featured: true,
    price: "From £10,000 + VAT",
    copy: "Our most complete option takes you from understanding the problem to putting the right systems and ongoing support in place.",
    items: ["Full assessment and tailored build", "Ongoing management and oversight", "10 hours of tailored VA support per month for 1 year", "Additional support available at £30 per hour + VAT"],
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
  ["03", "Built to remain useful", "Your setup is designed around your organisation rather than a fixed package, so it can be adjusted as your workload, team or priorities change."],
  ["04", "Capacity when you need it", "You can increase or reduce your VA support as your needs change. When additional capacity is required, we bring in trusted partners and train them on your setup at no additional cost."],
];

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.5, ease: "easeOut" },
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

function GeometricDivider() {
  const nodes = [
    ["left-[7%] top-8 h-24 w-24 rounded-full bg-acid/70"],
    ["left-[24%] bottom-7 h-16 w-16 rounded-full bg-[#f28a4b]/40"],
    ["left-[43%] top-12 h-20 w-20 rounded-full bg-[#8fd0b0]/45"],
    ["right-[23%] bottom-10 h-14 w-14 rotate-12 rounded-md bg-[#f6c84f]/50"],
    ["right-[8%] top-8 h-28 w-28 rounded-full bg-[#4479a8]/25"],
  ];

  return (
    <motion.div
      {...reveal}
      className="relative mt-10 overflow-hidden px-6 py-14 text-ink"
      aria-hidden="true"
    >
      <div className="simplified-hide absolute inset-0 opacity-80">
        {nodes.map(([classes], index) => (
          <span key={index} className={`absolute block ${classes}`} />
        ))}
        <span className="absolute left-[15%] top-1/2 h-px w-[70%] -translate-y-1/2 bg-ink/12" />
        <span className="absolute left-[30%] top-[28%] h-[46%] w-px rotate-[-18deg] bg-ink/10" />
        <span className="absolute right-[32%] top-[23%] h-[52%] w-px rotate-[22deg] bg-ink/10" />
      </div>
      <div className="relative mx-auto grid max-w-3xl gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Assessment • AI and Automation • VA support</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [preferredContact, setPreferredContact] = useState("Email");
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);

  return (
    <main id="top" className={`min-h-screen bg-paper text-ink ${isSimplifiedMode ? "simplified-mode" : ""}`}>
      <button
        type="button"
        onClick={() => setIsSimplifiedMode((current) => !current)}
        className={`simplified-toggle fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_14px_35px_rgba(17,17,17,0.18)] transition ${
          isSimplifiedMode ? "border-ink bg-ink text-paper" : "border-ink/10 bg-white text-ink"
        }`}
        aria-pressed={isSimplifiedMode}
        aria-label={isSimplifiedMode ? "Turn full colour mode back on" : "Turn simplified black and white mode on"}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">{isSimplifiedMode ? "Show colour" : "Simplified mode"}</span>
      </button>

      <section className="bg-[#063b32] px-4 pb-16 pt-5 text-paper md:px-8 md:pb-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-7 text-xs font-semibold text-paper/70 md:flex">
            <a href="#services">Services</a>
            <a href="#experts">About</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <button type="button" onClick={() => setIsContactModalOpen(true)} className="hidden rounded-md bg-acid px-4 py-2 text-xs font-semibold text-ink md:inline-flex">
            Book a call
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-md border border-white/15 md:hidden" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </nav>

        <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div {...reveal}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-acid">AI admin support</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1] md:text-7xl">
              When admin takes over, VAxAI steps in
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/72 md:text-lg">
              We help small businesses, charities and busy teams manage the repetitive work that consumes time and capacity by combining virtual assistance (VA) with AI and automation where they add value.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setIsContactModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink">
                Book a workflow call
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-paper/65">Built for small businesses, charities and hands-on teams</span>
            </div>
          </motion.div>
          <motion.div {...reveal} className="relative mx-auto w-full max-w-[420px]">
            <PhotoCard src={image.hero} className="aspect-[0.86] rounded-[28px]" />
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <motion.p {...reveal} className="text-sm font-semibold">VAxAI</motion.p>
          <motion.p {...reveal} className="text-sm leading-7 text-muted lg:whitespace-nowrap lg:text-[15px]">
            Protecting your business is our top priority. No solution is introduced without your understanding and approval.
          </motion.p>
        </div>
      </section>

      <section id="tools" className="bg-paper px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <ToolScroller />
        </div>
      </section>

      <section id="services" className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Support built around how you already work"
            copy="We start with your existing tools, processes and workload to identify what can be simplified, what should remain human and where technology can help."
            narrow
          />
          <GeometricDivider />
        </div>
      </section>

      <section className="bg-[#063b32] px-4 py-20 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="How VAxAI helps you get admin under control"
            copy="From enquiries and diary management to files, records, reports and follow-ups, we create workable systems with automation and human judgement built in."
            narrow
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-center">
            <div className="grid gap-5">
              {features.slice(0, 2).map((feature) => (
                <article key={feature.title} className="rounded-md border border-white/12 bg-white/[0.07] p-5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-acid text-xs font-semibold text-ink">{feature.mark}</span>
                  <h3 className="mt-8 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-paper/68">{feature.copy}</p>
                </article>
              ))}
            </div>
            <motion.div {...reveal} className="relative">
              <PhotoCard src={image.expert} className="aspect-[0.78] rounded-md" />
              <div className="absolute bottom-4 left-4 right-4 rounded-md bg-paper p-4 text-ink">
                <p className="text-sm font-semibold">AI admin support that stays human</p>
                <p className="mt-1 text-xs text-muted">Technology supports the work. Trained VAs keep people in control.</p>
              </div>
            </motion.div>
            <div className="grid gap-5">
              {features.slice(2).map((feature) => (
                <article key={feature.title} className="rounded-md border border-white/12 bg-white/[0.07] p-5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-acid text-xs font-semibold text-ink">{feature.mark}</span>
                  <h3 className="mt-8 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-paper/68">{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <motion.div
            {...reveal}
            id="access-to-work"
            className="mt-12 flex flex-col gap-5 rounded-md border border-white/12 bg-white/[0.07] p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Access to Work</p>
              <h3 className="mt-3 max-w-xl text-2xl font-semibold leading-tight text-paper">
                Your VAxAI support could cost you nothing
              </h3>
              <p className="mt-2 text-sm leading-6 text-paper/68">Want to find out more?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink"
            >
              Learn about Access to Work
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <section id="experts" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="Meet the people behind VAxAI" narrow />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {experts.map((expert, index) => (
              <article key={expert.name} className="rounded-md bg-white p-3 shadow-[0_10px_40px_rgba(17,17,17,0.07)]">
                {expert.photo ? (
                  <PhotoCard src={expert.photo} className="aspect-[0.82] rounded-md" />
                ) : (
                  <div className={`grid aspect-[0.82] place-items-end rounded-md p-5 ${index === 1 ? "bg-[#fff1a6]" : "bg-[#ff8c22]"}`}>
                    <span className="text-5xl font-black leading-none text-ink">+</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{expert.role}</p>
                  <h3 className="mt-2 font-semibold">{expert.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{expert.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Support built around your admin reality"
            copy="You can start with an assessment or continue through the full process. The greatest value comes from combining all three stages: the assessment informs what we build, and the build shows where ongoing human support will add the most value."
            narrow
          />
          <div className="mt-10 rounded-md border border-ink/10 bg-white p-3 shadow-[0_14px_45px_rgba(17,17,17,0.05)]">
            <div className="grid gap-3 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.title}
                  className={`relative rounded-md border p-6 ${plan.featured ? "border-[#063b32] bg-[#f7ff6a]/20" : "border-ink/10 bg-white"}`}
                >
                  <div className="flex min-h-6 items-center justify-between gap-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[#063b32]/25 bg-white text-xs font-bold text-[#063b32]">
                      {plan.step}
                    </span>
                    {plan.featured ? (
                      <span className="rounded-full bg-acid px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-muted">{plan.title}</p>
                  <h3 className="mt-5 text-4xl font-semibold">{plan.label}</h3>
                  <p className="mt-3 text-sm font-semibold text-[#063b32]">{plan.price}</p>
                  <p className="mt-4 min-h-20 text-sm leading-6 text-muted">{plan.copy}</p>
                  <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {plan.featured ? (
                  <button type="button" onClick={() => setIsContactModalOpen(true)} className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[#063b32] px-4 py-3 text-sm font-semibold text-paper">
                    Book a workflow consultation
                  </button>
                ) : null}
              </article>
              ))}
            </div>
            <div className="mt-3 grid gap-3 rounded-md border border-ink/10 bg-[#f3f9f5] p-5 text-sm leading-6 text-muted md:grid-cols-[1fr_0.9fr]">
              <p>
                Final pricing depends on the complexity of your processes, data quality, system connections, reporting requirements and the level of ongoing support required.
              </p>
              <p>
                Need VA support without a build? Standalone virtual assistance is available from £30 per hour + VAT. The full package is recommended when you want joined-up support from a team that understands your processes, systems and administrative needs from end to end.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#063b32] px-4 py-20 text-paper md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Built around Value, Alignment and Trust"
            copy="VAxAI uses the MT1L VAT Framework to decide what should be simplified, what technology can support and where human assistance is still needed."
            narrow
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {vatPrinciples.map(([step, title, copy]) => (
              <article key={step} className="rounded-md border border-white/12 bg-white/[0.06] p-6">
                <p className="text-sm font-semibold text-acid">{step}</p>
                <h3 className="mt-10 text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-paper/68">{copy}</p>
              </article>
            ))}
          </div>
          <motion.div {...reveal} className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-sm leading-6 text-paper/70">
              We do not introduce AI or automation simply because it is possible. We recommend it only where it adds value, fits your organisation and can be used with confidence.
            </p>
            <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-acid">
              Want to learn more about MT1L and the VAT Framework? Check us out
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Why choose VAxAI?"
            copy="We are not here to force a technical solution where it does not fit. Our priority is your organisation and helping you put the right support, systems and tools in place to achieve the best possible outcomes."
            narrow
          />
          <div className="mt-10 overflow-hidden rounded-md border border-ink/10 bg-white p-3 shadow-[0_14px_45px_rgba(17,17,17,0.05)]">
            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.35fr]">
              <div className="relative overflow-hidden rounded-md border border-[#063b32]/20 bg-[#f3f9f5] p-7 md:p-8">
                <div className="simplified-hide absolute right-[-36px] top-[-36px] h-32 w-32 rounded-full bg-acid/70" />
                <div className="simplified-hide absolute bottom-[-44px] left-[-28px] h-28 w-28 rounded-full bg-[#4479a8]/18" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI support</p>
                  <h3 className="mt-5 max-w-sm text-3xl font-semibold leading-[1.08] text-ink">
                    Support that stays useful as your needs change.
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
                    One team understands your systems and provides the capacity needed to keep work moving.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    {["Continuity", "Ownership", "Capacity"].map((item) => (
                      <span key={item} className="rounded-md border border-[#063b32]/15 bg-white px-2 py-3 text-[#063b32] shadow-[0_8px_22px_rgba(17,17,17,0.04)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {whyPrinciples.map(([number, title, copy]) => (
                  <article key={number} className="grid gap-4 rounded-md border border-ink/10 bg-white p-6 sm:grid-cols-[64px_1fr] md:p-7">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-sm font-semibold text-[#063b32]">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-md border border-[#063b32]/15 bg-[#f7ff6a]/35 px-6 py-4 text-sm font-semibold text-[#063b32] md:px-8">
              Continuity · clear ownership · documented systems · support that can grow
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 pb-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.75fr_1fr]">
          <motion.div {...reveal}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Frequently asked questions</p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] md:text-5xl">Questions about VAxAI?</h2>
            <p className="mt-5 text-sm leading-6 text-muted">Clear answers on how we assess your workflow, design AI support, and provide ongoing virtual assistance for everyday admin.</p>
          </motion.div>
          <motion.div {...reveal} className="divide-y divide-ink/10 rounded-md border border-ink/10 bg-white">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-semibold">
                  {question}
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted">{answer}</p>
              </details>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-md border border-ink/10 bg-white shadow-[0_14px_45px_rgba(17,17,17,0.05)] md:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI support to book</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] text-ink md:text-5xl">Admin support that can grow with you</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-muted">Start with a workflow call and leave with a clearer sense of what should be automated, what should stay human, and what support your small business or charity actually needs.</p>
            <button type="button" onClick={() => setIsContactModalOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper">
              Book a workflow call
              <MailCheck className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-cream p-3 md:p-4">
            <PhotoCard src={image.cta} className="min-h-[320px] rounded-md" />
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#063b32] text-sm text-acid">VA</span>
              <span>VAxAI</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
            <div>
              <p className="font-semibold">Services</p>
              <div className="mt-4 grid gap-3 text-muted">
                <a href="#pricing">Assessment</a>
                <a href="#services">AI and Automation</a>
                <a href="#services">VA Support</a>
              </div>
            </div>
            <div>
              <p className="font-semibold">Company</p>
              <div className="mt-4 grid gap-3 text-muted">
                <a href="#experts">About</a>
                <a href="https://www.mt1l.com" target="_blank" rel="noreferrer">MT1L</a>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Contact</button>
              </div>
            </div>
            <div>
              <p className="font-semibold">Support</p>
              <div className="mt-4 grid gap-3 text-muted">
                <a href="#faq">FAQ</a>
                <a href="#access-to-work">Access to Work</a>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Workflow consultation</button>
              </div>
            </div>
            <div>
              <p className="font-semibold">Legal</p>
              <div className="mt-4 grid gap-3 text-muted">
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Privacy</button>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Terms</button>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">EDI policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {isContactModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Contact VAxAI</p>
                <h2 id="contact-title" className="mt-3 text-3xl font-semibold leading-tight">Tell us what support you need</h2>
              </div>
              <button type="button" onClick={() => setIsContactModalOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Close contact form">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              className="grid gap-5 p-6 md:grid-cols-2 md:p-10"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const subject = encodeURIComponent(`VAxAI enquiry: ${String(form.get("queryType"))}`);
                const body = encodeURIComponent(
                  `Name: ${String(form.get("name"))}\nEmail: ${String(form.get("email"))}\nPreferred contact: ${String(form.get("preferredContact"))}\nTelephone: ${String(form.get("telephone") || "Not provided")}\n\n${String(form.get("details"))}`,
                );
                window.location.href = `mailto:hello@vaxai.co.uk?subject=${subject}&body=${body}`;
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
                Query type
                <select required name="queryType" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]">
                  <option>Assessment</option>
                  <option>Build</option>
                  <option>Build and support</option>
                  <option>VAT Framework</option>
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
              <div className="md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper">
                  Send enquiry
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
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
