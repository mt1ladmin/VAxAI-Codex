"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleX,
  ClipboardList,
  FileStack,
  Inbox,
  Layers3,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

const trustLabels = [
  "Founders",
  "Consultants",
  "Charities",
  "Small Teams",
  "Client Services",
  "Operations",
];

const features = [
  {
    icon: ClipboardList,
    title: "Workflow Assessment",
    copy: "We map what is slowing you down across inboxes, diaries, files, tools, and client admin.",
  },
  {
    icon: Bot,
    title: "AI Automation Design",
    copy: "We design practical AI workflows that reduce repeat admin without removing human judgement.",
  },
  {
    icon: Inbox,
    title: "Inbox, Diary & File Control",
    copy: "We help keep messages, schedules, documents, and follow-ups organised and moving.",
  },
  {
    icon: UserRoundCheck,
    title: "Human VA Oversight",
    copy: "Our virtual assistance support monitors automations, handles exceptions, and gives you clear updates.",
  },
];

const roles = [
  ["Admin Workflow Consultant", "Workflow Assessment", "Maps your admin load, tools, and process gaps into a clear action plan."],
  ["AI Systems Designer", "Automation Design", "Builds practical AI-enabled workflows for repeatable admin tasks."],
  ["Virtual Assistance Lead", "Human Oversight", "Keeps automations monitored, exceptions handled, and updates clear."],
  ["Inbox & Diary Specialist", "Inbox + Diary", "Helps manage messages, calendars, follow-ups, and priority admin."],
  ["File & Process Organiser", "File Management", "Creates cleaner structures for documents, records, and repeat workflows."],
  ["Client Admin Support", "Client Correspondence", "Supports client follow-up, admin requests, and day-to-day communication flow."],
];

const plans = [
  {
    plan: "Workflow Audit",
    label: "Assess",
    description:
      "A focused review of your admin load, current tools, and quick-win automation opportunities.",
    bullets: [
      "Admin pain-point map",
      "Workflow and system review",
      "Automation opportunities",
      "Priority action plan",
      "Handover call",
    ],
  },
  {
    plan: "Automation Setup",
    label: "Build",
    description:
      "For founders and teams ready to design practical AI workflows and admin systems.",
    featured: true,
    bullets: [
      "Inbox and diary workflows",
      "File and client admin setup",
      "AI automation design",
      "VA oversight plan",
      "Launch support",
    ],
  },
  {
    plan: "Managed Support",
    label: "Support",
    description:
      "Ongoing virtual assistance, automation monitoring, and human judgement for busy teams.",
    bullets: [
      "Human VA oversight",
      "Automation issue handling",
      "Inbox and client correspondence",
      "Regular admin overview",
      "Extra admin requests",
    ],
  },
];

const faqs = [
  [
    "Who is VAxAI for?",
    "Founders, consultants, charities, small businesses, and busy individuals who need help getting everyday admin under control.",
  ],
  [
    "Do you only set up AI tools?",
    "No. We assess your workflow, design practical automation, and provide virtual assistance support so the system is monitored and managed.",
  ],
  [
    "What admin can you help with?",
    "Inbox management, diary management, file organisation, client correspondence, follow-ups, workflow tracking, and other recurring admin tasks.",
  ],
  [
    "What does human oversight mean?",
    "A real person monitors the automation, handles exceptions, applies judgement, and keeps you informed about what is happening.",
  ],
  [
    "Can I request extra admin support?",
    "Yes. Alongside automation oversight, you can request additional virtual assistance or practical admin support when needed.",
  ],
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: "easeOut" },
};

function SectionIntro({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  light?: boolean;
}) {
  return (
    <motion.div {...reveal} className="mx-auto max-w-4xl text-center">
      {eyebrow ? (
        <p className={`mb-5 text-sm font-semibold uppercase tracking-[0.18em] ${light ? "text-acid" : "text-muted"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-4xl font-black leading-[0.98] md:text-6xl ${light ? "text-paper" : "text-ink"}`}>
        {title}
      </h2>
      <p className={`mx-auto mt-6 max-w-3xl text-lg leading-8 md:text-xl ${light ? "text-[#CFCBC2]" : "text-muted"}`}>
        {copy}
      </p>
    </motion.div>
  );
}

function WorkflowVisual() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[32px] bg-ink p-5 text-paper shadow-soft md:min-h-[560px] md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,242,116,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_38%)]" />
      <div className="relative grid h-full gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-[340px] flex-col justify-between rounded-[24px] border border-white/15 bg-white/[0.07] p-5 backdrop-blur md:p-7">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-acid px-4 py-2 text-sm font-bold text-ink">
              Live admin flow
            </span>
            <Sparkles className="h-6 w-6 text-acid" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            {[
              ["Inbox triage", "Priority follow-up ready"],
              ["Diary changes", "Conflicts reviewed"],
              ["Client files", "Clean handover created"],
            ].map(([title, status]) => (
              <div key={title} className="rounded-2xl border border-white/12 bg-paper p-4 text-ink">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm text-muted">{status}</p>
                  </div>
                  <Check className="h-5 w-5 rounded-full bg-acid p-1 text-ink" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold uppercase text-[#CFCBC2]">
            <span className="rounded-xl border border-white/12 py-3">Assess</span>
            <span className="rounded-xl border border-white/12 py-3">Build</span>
            <span className="rounded-xl border border-white/12 py-3">Support</span>
          </div>
        </div>
        <div className="grid gap-5">
          <div className="rounded-[24px] bg-acid p-6 text-ink">
            <CalendarCheck className="mb-10 h-8 w-8" aria-hidden="true" />
            <p className="text-3xl font-black leading-none">AI admin support that stays human</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-[24px] border border-white/15 bg-white/[0.07] p-5">
              <FileStack className="mb-10 h-7 w-7 text-acid" aria-hidden="true" />
              <p className="text-sm text-[#CFCBC2]">Files organised</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/[0.07] p-5">
              <Layers3 className="mb-10 h-7 w-7 text-acid" aria-hidden="true" />
              <p className="text-sm text-[#CFCBC2]">Exceptions handled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="bg-night px-5 py-20 text-paper md:px-8 md:py-28 lg:py-32">
        <motion.div {...reveal} className="mx-auto flex min-h-[78vh] max-w-6xl flex-col items-center justify-center text-center">
          <p className="mb-8 rounded-full border border-white/14 px-4 py-2 text-sm text-[#CFCBC2]">
            VAxAI · AI Consultancy + Virtual Assistance
          </p>
          <h1 className="max-w-5xl text-5xl font-black leading-[0.96] md:text-7xl lg:text-[88px]">
            AI-powered admin support for people with too much to hold
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-[#CFCBC2] md:text-xl">
            VAxAI helps founders, consultants, charities and small teams bring inboxes, diaries, files and client follow-up under control with smart automation and human VA oversight.
          </p>
          <a href="/contact" className="mt-10 inline-flex items-center gap-3 rounded-lg bg-acid px-6 py-4 text-base font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#fff977]">
            Book a workflow call
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex -space-x-3" aria-hidden="true">
              {["A", "I", "V"].map((letter) => (
                <span key={letter} className="grid h-10 w-10 place-items-center rounded-full border-2 border-night bg-paper text-sm font-black text-ink">
                  {letter}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-[#CFCBC2]">
              Built for founders, consultants, charities and small teams
            </p>
          </div>
        </motion.div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.6fr]">
          <motion.div {...reveal} className="h-fit rounded-[28px] border border-ink/12 bg-cream p-8">
            <p className="text-3xl font-black">VAxAI</p>
            <p className="mt-3 text-muted">AI Consultancy + Virtual Assistance</p>
          </motion.div>
          <motion.p {...reveal} className="text-3xl font-black leading-tight md:text-5xl">
            We understand what is piling up, assess your current workflow, design the right AI-enabled system, then provide VA support to monitor automations, manage exceptions, and keep you confidently on top of the details.
          </motion.p>
        </div>
      </section>

      <section className="border-y border-ink/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustLabels.map((label) => (
            <span key={label} className="text-sm font-bold uppercase tracking-[0.18em] text-muted">
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            title="Admin systems, automation and human support in one place"
            copy="We combine workflow assessment, practical AI automation, and real VA support so important admin stops falling between the cracks."
          />
          <motion.div {...reveal} className="mt-14">
            <WorkflowVisual />
          </motion.div>
        </div>
      </section>

      <section className="bg-night px-5 py-20 text-paper md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            light
            title="What VAxAI helps you get under control"
            copy="From inboxes and diary management to file systems and client correspondence, we create calm, workable admin systems with automation and human judgement built in."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {features.map((feature) => (
              <motion.article {...reveal} key={feature.title} className="rounded-[28px] border border-white/14 bg-white/[0.06] p-7">
                <feature.icon className="h-8 w-8 text-acid" aria-hidden="true" />
                <h3 className="mt-12 text-2xl font-black">{feature.title}</h3>
                <p className="mt-4 leading-7 text-[#CFCBC2]">{feature.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            title="A support bench built for everyday admin"
            copy="Specialist service roles give you the right blend of workflow thinking, automation design, and practical virtual assistance."
          />
          <div className="scrollbar-none mt-14 flex snap-x gap-5 overflow-x-auto pb-4">
            {roles.map(([title, label, copy], index) => (
              <motion.article
                {...reveal}
                key={title}
                className="min-w-[280px] snap-start rounded-[28px] border border-ink/12 bg-cream p-6 md:min-w-[350px]"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-black text-acid">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <p className="mt-4 leading-7 text-muted">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            title="Support built around your admin reality"
            copy="Choose the level of support you need, from a focused workflow audit to ongoing virtual assistance and automation oversight."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.article
                {...reveal}
                key={plan.plan}
                className={`rounded-[28px] border p-7 ${plan.featured ? "border-acid bg-acid text-ink shadow-soft" : "border-ink/12 bg-cream"}`}
              >
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">{plan.plan}</p>
                <h3 className="mt-6 text-5xl font-black">{plan.label}</h3>
                <p className="mt-5 min-h-24 leading-7 text-muted">{plan.description}</p>
                <ul className="mt-8 space-y-4">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night px-5 py-20 text-paper md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            light
            title="A practical process for turning admin chaos into calm"
            copy="We assess the pressure points, design the right AI-enabled workflow, then stay close enough to manage issues, provide oversight, and keep you informed."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {[
              ["01", "Assess the Admin Load", "We understand what is slipping, where time is going, and how your current workflow actually operates."],
              ["02", "Design the AI System", "We decide what should be automated, what needs human judgement, and what foundations must be in place."],
              ["03", "Support, Monitor & Improve", "Our VA support keeps the system moving, manages issues, shares updates, and handles extra admin requests."],
            ].map(([step, title, copy]) => (
              <motion.article {...reveal} key={title} className="rounded-[28px] border border-white/14 bg-white/[0.06] p-7">
                <p className="text-5xl font-black text-acid">{step}</p>
                <h3 className="mt-14 text-2xl font-black">{title}</h3>
                <p className="mt-4 leading-7 text-[#CFCBC2]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            title="Why VAxAI is different"
            copy="We do not just set up tools and disappear. We pair automation with virtual assistance, human oversight, and clear updates so you know what is happening without managing every detail yourself."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <motion.article {...reveal} className="rounded-[28px] border border-ink/12 bg-cream p-7">
              <h3 className="text-3xl font-black">Typical automation setup</h3>
              <ul className="mt-8 space-y-5">
                {["Tool setup without context", "Limited workflow understanding", "No one monitoring exceptions", "You still manage the admin fallout"].map((item) => (
                  <li key={item} className="flex gap-3 text-muted">
                    <CircleX className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
            <motion.article {...reveal} className="rounded-[28px] border border-ink bg-ink p-7 text-paper">
              <h3 className="text-3xl font-black">VAxAI approach</h3>
              <ul className="mt-8 space-y-5">
                {["Workflow assessment first", "AI automation designed around real admin", "Human VA oversight", "Clear updates and extra support when needed"].map((item) => (
                  <li key={item} className="flex gap-3 text-[#CFCBC2]">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-acid p-0.5 text-ink" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-4xl">
          <SectionIntro
            title="Frequently asked questions about VAxAI"
            copy="Clear answers on how we assess your workflow, design AI support, and provide ongoing virtual assistance for everyday admin."
          />
          <div className="mt-12 divide-y divide-ink/12 rounded-[28px] border border-ink/12 bg-cream">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-xl font-black">
                  {question}
                  <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-4 max-w-3xl leading-7 text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
