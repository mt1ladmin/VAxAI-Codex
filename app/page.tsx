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
    "/hero-remote-work-circles.jpg",
  expert:
    "/vaxai-support-control.jpg",
  thesia: "/thesia-profile.jpg",
  rebecca: "/rebecca-bradshaw.jpg",
  cta: "/footer-team-smiling.jpg",
};

const tools = [
  {
    name: "ChatGPT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    markClass: "bg-[#10A37F]/10",
  },
  {
    name: "Claude",
    logo: "https://cdn.simpleicons.org/claude/D97757",
    markClass: "bg-[#D97757]/10",
  },
  {
    name: "Codex",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    markClass: "bg-ink/5",
  },
  {
    name: "Copilot",
    logo: "https://cdn.simpleicons.org/githubcopilot/111111",
    markClass: "bg-ink/5",
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
    copy: "We map admin pressure across inboxes, data, tools, teams, and client or service-user follow-up.",
  },
  {
    mark: "02",
    title: "Automation Design",
    copy: "We identify where chatbots, workflow automation, reports, social scheduling, or AI support will actually add value.",
  },
  {
    mark: "03",
    title: "Inbox + Diary Control",
    copy: "Messages, calendars, documents, data entry, and follow-ups stay organised and moving.",
  },
  {
    mark: "04",
    title: "Human VA Oversight",
    copy: "Trained VA support monitors automations, manages exceptions, and keeps people in the loop.",
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
    title: "Workflow Audit",
    label: "Assess",
    price: "Starting at £1,500 + VAT",
    copy: "A tailored consultation and assessment of your real admin load, data, tools, and support needs.",
    items: ["MT1L VAT framework review", "AI value and risk map", "Setup plan you can use yourself", "Build recommendation"],
  },
  {
    title: "Automation Setup",
    label: "Build",
    featured: true,
    price: "Starting at £5,000 + VAT",
    copy: "For small businesses and charities ready for us to build the workflows, automations, and oversight model.",
    items: ["Workflow automation and chatbots", "Data and reporting setup", "Team handover and training", "Complexity priced after assessment"],
  },
  {
    title: "Managed Support",
    label: "Support",
    price: "From £30ph + VAT",
    copy: "Flexible VA support once you are a VAxAI client, without being locked into a long contract.",
    items: ["Ad hoc, weekly, monthly or annual hours", "VA trained on your automation", "Virtual or in-person support", "Less VA time needed as admin is automated"],
  },
];

const process = [
  ["01", "Understand the reality", "We consult with you to understand what work looks like in practice, not just what the process says on paper."],
  ["02", "Apply the MT1L VAT framework", "We ask whether AI creates meaningful Value, fits how work gets done, and will be trusted by the people affected."],
  ["03", "Build and support", "We design the system, train the VA support around it, and keep human oversight close enough to prevent drift."],
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
  ["01", "Starts with the work, not the tool", "We map pressure points, decisions, handoffs and the people affected before choosing any automation."],
  ["02", "Tests whether AI earns its place", "The MT1L VAT framework checks Value, fit with real work, and trust before anything is built."],
  ["03", "Keeps human support close", "Your VA support is trained on the system, watches exceptions, and can grow through our vetted partner network."],
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
              <img src={tool.logo} alt="" className="h-5 w-5 object-contain" loading="lazy" />
            </span>
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
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
      className="relative mt-10 overflow-hidden rounded-md border border-ink/10 bg-cream px-6 py-14 text-ink"
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-80">
        {nodes.map(([classes], index) => (
          <span key={index} className={`absolute block ${classes}`} />
        ))}
        <span className="absolute left-[15%] top-1/2 h-px w-[70%] -translate-y-1/2 bg-ink/12" />
        <span className="absolute left-[30%] top-[28%] h-[46%] w-px rotate-[-18deg] bg-ink/10" />
        <span className="absolute right-[32%] top-[23%] h-[52%] w-px rotate-[22deg] bg-ink/10" />
      </div>
      <div className="relative mx-auto grid max-w-3xl gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Assessment • Automation • VA support</p>
        <p className="text-2xl font-semibold leading-tight md:text-4xl">Systems that connect tools, people and judgement</p>
      </div>
    </motion.div>
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
              VAxAI helps small businesses, charities and busy teams bring inboxes, diaries, files, data and follow-up under control with practical automation and human VA oversight.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/contact" className="inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink">
                Book a workflow call
                <ArrowRight className="h-4 w-4" />
              </a>
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
            We work with tools you know and trust, then add AI and automation where it genuinely reduces admin pressure.
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
          <GeometricDivider />
        </div>
      </section>

      <section className="bg-[#063b32] px-4 py-20 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="What VAxAI helps you get under control"
            copy="From inboxes and diary management to files, data, reports, chatbot support and client or service-user follow-up, we create workable systems with automation and human judgement built in."
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
            copy="Pricing starts with your real workflow. Complexity, integrations, data quality, dashboards, team size and support level all shape the final quote."
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
                <p className={`mt-3 text-sm font-semibold ${plan.featured ? "text-acid" : "text-[#063b32]"}`}>{plan.price}</p>
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
            copy="We assess the pressure points, apply our value framework, then build only what makes the work easier, safer and more trusted."
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
            copy="We are not here to force a technical solution onto human work. We become an extension of your team and choose work where we can support your organisation long term."
            narrow
          />
          <div className="mt-10 overflow-hidden rounded-md border border-ink/10 bg-white shadow-[0_14px_45px_rgba(17,17,17,0.05)]">
            <div className="grid lg:grid-cols-[0.9fr_1.35fr]">
              <div className="relative overflow-hidden bg-[#063b32] p-7 text-paper md:p-8">
                <div className="absolute right-[-36px] top-[-36px] h-32 w-32 rounded-full bg-acid/70" />
                <div className="absolute bottom-[-44px] left-[-28px] h-28 w-28 rounded-full bg-[#8fd0b0]/20" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">MT1L VAT framework</p>
                  <h3 className="mt-5 max-w-sm text-3xl font-semibold leading-[1.08]">
                    Automation has to pass a human test first.
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-paper/70">
                    We only recommend AI where it makes the work easier, safer and more trusted.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    {["Value", "Reality", "Trust"].map((item) => (
                      <span key={item} className="rounded-md border border-white/14 bg-white/[0.07] px-2 py-3">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-ink/10">
                {whyPrinciples.map(([number, title, copy]) => (
                  <article key={number} className="grid gap-4 p-6 sm:grid-cols-[64px_1fr] md:p-7">
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
            <div className="border-t border-ink/10 bg-cream px-6 py-4 text-sm font-semibold text-[#063b32] md:px-8">
              Tailored assessment · practical build · trained VA oversight · partner network as you grow
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
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-md bg-[#063b32] text-paper md:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">VAxAI support to book</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] md:text-5xl">Admin support that can grow with you</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-paper/70">Start with a workflow call and leave with a clearer sense of what should be automated, what should stay human, and what support your small business or charity actually needs.</p>
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
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#063b32] text-sm text-acid">VA</span>
              <span>VAxAI</span>
            </div>
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
