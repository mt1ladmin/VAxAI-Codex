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
  X,
} from "lucide-react";

const image = {
  hero:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85",
  collageOne:
    "/admin-systems-remote-circles.jpg",
  collageTwo:
    "/admin-systems-network.jpg",
  collageThree:
    "/admin-systems-team.jpg",
  expert:
    "/vaxai-support-control.jpg",
  thesia: "/thesia-profile.jpg",
  cta:
    "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=85",
  footer:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=85",
};

const tools = [
  {
    name: "ChatGPT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    markClass: "bg-[#10A37F]/10",
  },
  {
    name: "Claude",
    logo: "https://cdn.simpleicons.org/anthropic/D97757",
    markClass: "bg-[#D97757]/10",
  },
  { name: "Codex", mark: "CX", markClass: "bg-ink/5 text-ink" },
  {
    name: "Copilot",
    logo: "https://cdn.simpleicons.org/githubcopilot/2563EB",
    markClass: "bg-[#2563EB]/10",
  },
  {
    name: "Zapier",
    logo: "https://cdn.simpleicons.org/zapier/FF4F00",
    markClass: "bg-[#FF4F00]/10",
  },
  {
    name: "Make",
    logo: "https://cdn.simpleicons.org/make/6D28D9",
    markClass: "bg-[#6D28D9]/10",
  },
];

const features = [
  {
    mark: "01",
    title: "Workflow Assessment",
    copy: "We map what is slowing you down across inboxes, diaries, files, tools, and client admin.",
  },
  {
    mark: "02",
    title: "Automation Design",
    copy: "Practical AI-enabled workflows reduce repeat admin while keeping judgement in the right places.",
  },
  {
    mark: "03",
    title: "Inbox + Diary Control",
    copy: "Messages, calendars, documents, and follow-ups stay organised and moving.",
  },
  {
    mark: "04",
    title: "Human VA Oversight",
    copy: "Real support monitors automations, manages exceptions, and keeps updates clear.",
  },
];

const experts = [
  {
    name: "Thesia Kouloungou",
    role: "AI & Workflow Lead",
    copy: "Hi, I am the founder and CEO of MT1L and VAxAI. I lead our AI consultations and workflow reviews, helping you find where AI, automation, or small process changes can take pressure off your day without adding tools you do not need.",
    photo: image.thesia,
  },
  {
    name: "Workflow Audit",
    role: "Assessment",
    copy: "A clear review of the admin load, current tools, and pressure points.",
  },
  {
    name: "Managed Support",
    role: "VA Oversight",
    copy: "Ongoing virtual assistance, exception handling, and admin updates.",
  },
];

const plans = [
  {
    title: "Workflow Audit",
    label: "Assess",
    copy: "For understanding what is slipping and where automation can help first.",
    items: ["Admin pain-point map", "Workflow review", "Automation opportunities", "Priority action plan"],
  },
  {
    title: "Automation Setup",
    label: "Build",
    featured: true,
    copy: "For founders and teams ready to create a workable AI-enabled admin system.",
    items: ["Inbox and diary workflows", "File and client admin setup", "AI automation design", "Launch support"],
  },
  {
    title: "Managed Support",
    label: "Support",
    copy: "For busy teams that need ongoing VA support and automation oversight.",
    items: ["Human VA oversight", "Issue handling", "Client correspondence", "Regular admin overview"],
  },
];

const process = [
  ["01", "Assess the admin load", "We understand what is piling up, where time is going, and where the workflow breaks."],
  ["02", "Design the AI system", "We decide what can be automated, what needs human judgement, and what needs cleaner foundations."],
  ["03", "Support and improve", "VA support monitors the system, manages exceptions, and handles extra admin requests."],
];

const faqs = [
  ["Who is VAxAI for?", "Founders, consultants, charities, small businesses, and busy individuals who need help getting everyday admin under control."],
  ["Do you only set up AI tools?", "No. We assess your workflow, design practical automation, and provide virtual assistance support so the system is monitored and managed."],
  ["What admin can you help with?", "Inbox management, diary management, file organisation, client correspondence, follow-ups, workflow tracking, and other recurring admin tasks."],
  ["What does human oversight mean?", "A real person monitors the automation, handles exceptions, applies judgement, and keeps you informed about what is happening."],
  ["Can I request extra admin support?", "Yes. Alongside automation oversight, you can request additional virtual assistance or practical admin support when needed."],
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
      className={`overflow-hidden bg-cover bg-center ${className}`}
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

function ToolScroller() {
  const repeatedTools = [...tools, ...tools];

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex min-w-max gap-3 pr-4 md:animate-tool-scroll">
        {repeatedTools.map((tool, index) => (
          <div
            key={`${tool.name}-${index}`}
            className="flex h-20 min-w-[190px] items-center justify-center gap-3 rounded-md border border-ink/10 bg-white px-6 text-sm font-semibold text-ink shadow-[0_10px_30px_rgba(17,17,17,0.04)]"
            aria-label={tool.name}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${tool.markClass}`}>
              {"logo" in tool ? (
                <img src={tool.logo} alt="" className="h-5 w-5" loading="lazy" />
              ) : (
                tool.mark
              )}
            </span>
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  return (
    <main id="top" className="min-h-screen bg-paper text-ink">
      <section className="bg-[#063b32] px-4 pb-16 pt-5 text-paper md:px-8 md:pb-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-7 text-xs font-semibold text-paper/70 md:flex">
            <a href="#services">Services</a>
            <a href="#experts">Experts</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <a href="/contact" className="hidden rounded-md bg-acid px-4 py-2 text-xs font-semibold text-ink md:inline-flex">
            Book a call
          </a>
          <button className="grid h-9 w-9 place-items-center rounded-md border border-white/15 md:hidden" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </nav>

        <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div {...reveal}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-acid">AI admin support</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1] md:text-7xl">
              AI-powered admin support for people with too much to hold
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/72 md:text-lg">
              VAxAI helps founders, consultants, charities and small teams bring inboxes, diaries, files and client follow-up under control with smart automation and human VA oversight.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/contact" className="inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink">
                Book a workflow call
                <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-xs font-semibold text-paper/65">Built for founders, consultants, charities and small teams</span>
            </div>
          </motion.div>
          <motion.div {...reveal} className="relative mx-auto w-full max-w-[420px]">
            <PhotoCard src={image.hero} className="aspect-[0.86] rounded-[28px]" />
            <div className="absolute -bottom-7 -left-6 w-44 rounded-2xl bg-acid p-4 text-ink shadow-soft">
              <div className="mb-5 flex items-center gap-1">
                {[24, 34, 20, 42, 28].map((height, index) => (
                  <span key={index} className="w-3 rounded-full bg-ink" style={{ height }} />
                ))}
              </div>
              <p className="text-xs font-semibold uppercase leading-4">Workflow calmer by Friday</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[120px_1fr] md:items-start">
          <motion.div {...reveal} className="flex items-center gap-3">
            <PhotoCard src={image.cta} className="h-12 w-12 rounded-md" />
            <div>
              <p className="text-sm font-semibold">VAxAI</p>
              <p className="text-xs text-muted">AI consultancy + virtual assistance</p>
            </div>
          </motion.div>
          <motion.p {...reveal} className="max-w-4xl text-sm leading-7 text-muted md:text-base">
            We work with the tools you already know and trust, then add the right AI and automation where it genuinely reduces admin pressure.
          </motion.p>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">AI systems and admin tools</p>
          <ToolScroller />
        </div>
      </section>

      <section id="services" className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Admin systems, automation and human support in one place"
            copy="We combine workflow assessment, practical AI automation, and real VA support so important admin stops falling between the cracks."
            narrow
          />
          <motion.div {...reveal} className="mt-10 grid gap-4 md:grid-cols-3">
            <PhotoCard src={image.collageOne} className="aspect-[0.78] rounded-md md:translate-y-8" />
            <PhotoCard src={image.collageTwo} className="aspect-[0.78] rounded-md" />
            <PhotoCard src={image.collageThree} className="aspect-[0.78] rounded-md md:translate-y-8" />
          </motion.div>
        </div>
      </section>

      <section className="bg-[#063b32] px-4 py-20 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="What VAxAI helps you get under control"
            copy="From inboxes and diary management to file systems and client correspondence, we create calm, workable admin systems with automation and human judgement built in."
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
                <p className="mt-1 text-xs text-muted">Automation watched by real VA oversight.</p>
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
            className="mt-12 flex flex-col gap-5 rounded-md border border-white/12 bg-white/[0.07] p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Access to Work</p>
              <h3 className="mt-3 max-w-xl text-2xl font-semibold leading-tight text-paper">
                Your VAxAI support could cost you nothing.
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
          <SectionTitle title="Meet The Experts Behind Our Success" narrow />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
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
            copy="Choose the level of support you need, from a focused workflow audit to ongoing virtual assistance and automation oversight."
            narrow
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.title}
                className={`rounded-md border p-6 ${plan.featured ? "border-[#063b32] bg-[#063b32] text-paper" : "border-ink/10 bg-white"}`}
              >
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${plan.featured ? "text-acid" : "text-muted"}`}>{plan.title}</p>
                <h3 className="mt-5 text-4xl font-semibold">{plan.label}</h3>
                <p className={`mt-4 min-h-20 text-sm leading-6 ${plan.featured ? "text-paper/72" : "text-muted"}`}>{plan.copy}</p>
                <ul className="mt-8 space-y-3 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-black ${plan.featured ? "bg-acid text-ink" : "bg-[#063b32] text-paper"}`}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {plan.featured ? (
                  <a href="/contact" className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-acid px-4 py-3 text-sm font-semibold text-ink">
                    Book a workflow call
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#063b32] px-4 py-20 text-paper md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="A practical process for turning admin chaos into calm"
            copy="We assess the pressure points, design the right AI-enabled workflow, then stay close enough to manage issues, provide oversight, and keep you informed."
            narrow
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {process.map(([step, title, copy]) => (
              <article key={step} className="rounded-md border border-white/12 bg-white/[0.06] p-6">
                <p className="text-sm font-semibold text-acid">{step}</p>
                <h3 className="mt-10 text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-paper/68">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Why VAxAI is different"
            copy="We do not just set up tools and disappear. We pair automation with virtual assistance, human oversight, and clear updates."
            narrow
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-md border border-ink/10 bg-white p-6">
              <h3 className="font-semibold">Typical automation setup</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted">
                {["Tool setup without context", "Limited workflow understanding", "No one monitoring exceptions", "You still manage the admin fallout"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-100 text-[10px] font-black text-red-600">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-md border border-ink/10 bg-white p-6">
              <h3 className="font-semibold">VAxAI approach</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted">
                {["Workflow assessment first", "AI automation designed around real admin", "Human VA oversight", "Clear updates and extra support when needed"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#063b32] text-[10px] font-black text-acid">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
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
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-md bg-[#063b32] text-paper md:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">VAxAI experts to book</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] md:text-5xl">Your admin, calmer by next week</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-paper/70">Start with a workflow call and leave with a clearer sense of what should be automated, what should be delegated, and what needs proper oversight.</p>
            <a href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink">
              Book a workflow call
              <MailCheck className="h-4 w-4" />
            </a>
          </div>
          <PhotoCard src={image.cta} className="min-h-[320px]" />
        </div>
      </section>

      <footer className="border-t border-ink/10 px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#063b32] text-[11px] text-acid">VA</span>
              VAxAI
            </div>
            <PhotoCard src={image.footer} className="mt-6 aspect-[2.5] max-w-sm rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
            {[
              ["Services", "Workflow audit", "Automation setup", "Managed support"],
              ["Company", "About", "Experts", "Contact"],
              ["Support", "FAQ", "Client admin", "Workflow call"],
              ["Legal", "Privacy", "Terms", "Accessibility"],
            ].map(([heading, ...links]) => (
              <div key={heading}>
                <p className="font-semibold">{heading}</p>
                <div className="mt-4 grid gap-3 text-muted">
                  {links.map((link) => (
                    <a key={link} href="/contact">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

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
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper"
                  >
                    Talk to us about Access to Work
                  </a>
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
    </main>
  );
}
