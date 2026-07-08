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
  X,
} from "lucide-react";
import { AppSelect } from "@/components/ui/AppSelect";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";

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

type CaseStudy = {
  title: string;
  teaser: string;
  paragraphs?: string[];
  workflowPoints?: string[];
  results?: string[];
  closing?: string;
  placeholder?: boolean;
};

const caseStudies: CaseStudy[] = [
  {
    title: "Here's how we saved a founder 10 hours per week",
    teaser: "A busy professional was spending several hours each week manually managing emails, scheduling meetings, tracking actions and following up outstanding tasks.",
    paragraphs: [
      "After reviewing their workflow, we introduced a combination of process improvements, automation and ongoing support.",
    ],
    results: [
      "Significant reduction in time spent on admin",
      "Fewer missed follow-ups and outstanding actions",
      "Better visibility of priorities and workload",
      "More time available for revenue-generating and client-facing work",
    ],
    closing: "No complicated systems. No unnecessary technology. Just a practical solution that worked for the way they already operated.",
  },
  {
    title: "How we helped a client create clarity across multiple systems",
    teaser: "A growing start-up was using several different tools to manage projects, documents, conversations and client information.",
    paragraphs: [
      "Over time, it became unclear where information should be stored, where tasks should be created, and which platform should be used for communication.",
      "As the team grew, information was being duplicated, conversations were happening in different places, and people were spending unnecessary time searching for files and updates.",
      "We reviewed the existing systems and designed a clear workflow that defined:",
    ],
    workflowPoints: [
      "Where confidential information should be stored",
      "Where project tasks should be managed",
      "Which communication channels should be used for different purposes",
      "How information should move between systems",
    ],
    results: [
      "Clear ownership of information and processes",
      "Reduced duplication across systems",
      "Faster onboarding for new team members",
      "Less time spent searching for information",
      "Greater confidence that sensitive information was stored appropriately",
    ],
  },
  {
    title: "We supported a founder in bringing all communication into one place",
    teaser: "A business was receiving messages, requests and updates from multiple sources including email, project management tools, messaging platforms and client channels.",
    paragraphs: [
      "Important information was becoming fragmented across different systems, making it difficult to maintain visibility and respond consistently.",
      "Following a workflow review, we implemented a centralised communication process supported by automation and AI tools. Information from multiple channels was brought together, categorised and routed to the appropriate location, while human oversight remained in place for important decisions and follow-up actions.",
    ],
    results: [
      "Improved visibility across all incoming communications",
      "Faster response times",
      "Reduced risk of missed messages or actions",
      "Less manual administration",
      "A single source for communication and task management",
    ],
    closing: "Technology handled the repetitive sorting and organisation, while people remained in control of the decisions that mattered.",
  },
  {
    title: "How we helped a team scale without growing admin",
    teaser: "As a business expanded, different team members had developed their own ways of managing clients, files and daily tasks. There was no consistent process, which made it difficult to hand work over or maintain quality as the team grew.",
    paragraphs: [
      "We reviewed their existing workflows, documented key processes and introduced practical automations alongside clear guidance for the team.",
    ],
    results: [
      "Consistent ways of working across the business",
      "Faster onboarding of new staff",
      "Reduced reliance on individual team members",
      "More confidence that work wouldn't fall through the cracks",
    ],
  },
];

const experts = [
  {
    name: "Thesia Kouloungou",
    role: "Founder and CEO, MT1L and VAxAI",
    copy: "Hi, I’m Thesia. I lead our AI consultations and workflow reviews, using the VAT Framework™ to help you make clearer decisions about AI, automation and the way work gets done. My role is to help you see where AI can genuinely help, where existing tools and workflows could work better, and where human judgement should remain central.",
    photo: image.thesia,
  },
  {
    name: "Rebecca Bradshaw",
    role: "Co-founder and VA Operations Lead",
    copy: "Hi, I’m Rebecca. I lead the virtual assistance side of VAxAI, helping you put the right human support around the work that should not be left to AI. That includes keeping tasks, follow-ups and processes moving, and monitoring automations so they continue to work as intended. When additional capacity is needed, I help with the VA recruitment, vetting and onboarding process.",
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
    buildsOn: null as string | null,
    copy: [
      "We review your admin workload, processes, tools and team capacity to identify where pressure is building and what type of support or improvement would make the greatest difference.",
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
    label: "Implement",
    journeyTone: "from-white via-acid/10 to-mint/20",
    accentRing: "ring-forest/15",
    buildsOn: "Assess",
    copy: [
      "Using the findings from your assessment, we help put the right solution in place. This may include improving existing processes, making better use of your current tools, introducing new systems, automating repetitive tasks or training your team.",
    ],
    items: [
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
    label: "Support",
    featured: true,
    journeyTone: "from-acid/15 via-white to-mint/25",
    accentRing: "ring-forest/20",
    buildsOn: "Implement",
    copy: [
      "We continue to support you after implementation, helping your processes and systems remain useful as your workload, team and priorities change. This can include virtual assistance, system monitoring, team support and ongoing improvements.",
    ],
    items: [
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
  ["Who is VAxAI for?", "Small businesses, charities, consultants, and teams that want admin, workflow automation, and AI support without losing the human judgement their work needs."],
  ["What does the assessment include?", "It is based on your unique case. We consult with you, review current tools and data, identify where AI adds value, and give you a practical setup plan you can use yourself or ask us to build."],
  ["How do you decide whether AI is needed?", "We use the MT1L VAT framework: will it create meaningful Value, fit the reality of how work gets done, and be trusted by the people affected? If AI is not the answer, we say so."],
  ["Why does pricing vary?", "Complexity, data quality, business size, integrations, dashboards, and ongoing support all affect the final cost. We explain this after assessment before any build starts."],
  ["What does VA oversight mean?", "A trained VA understands your automation, monitors exceptions, manages tasks AI should not touch, and reduces the stress of AI going rogue."],
  ["Can support be flexible?", "Yes. Once you are a VAxAI client, support can be ad hoc, weekly, monthly, or annual. We can also provide in-person support at extra cost when needed."],
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
    <div className={`relative h-10 w-full overflow-hidden ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
    </div>
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

      <section className="section-forest relative overflow-hidden px-4 pb-20 pt-5 text-paper md:px-8 md:pb-24">
        <div className="simplified-hide pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-acid/10 blur-3xl" aria-hidden="true" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-5 text-xs font-semibold text-paper/70 md:flex">
            <a href="#pricing" className="hover:text-paper">Services</a>
            <a href="#experts" className="hover:text-paper">About</a>
            <a href="#vat-framework" className="hover:text-paper">VAT Framework</a>
            <a href="#access-to-work" className="hover:text-paper">Access to Work</a>
            <a href="#faq" className="hover:text-paper">FAQ</a>
            <a href="/insights" className="text-[#f5f274]/80 hover:text-[#f5f274]">Insights & Resources</a>
          </div>
          <button type="button" onClick={() => setIsContactModalOpen(true)} className="btn-primary hidden px-4 py-2 text-xs md:inline-flex">
            Get in touch
          </button>
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/15 md:hidden"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileNavOpen && (
          <div className="mx-auto max-w-6xl md:hidden">
            <div className="mt-2 flex flex-col gap-1 rounded-xl border border-white/10 bg-[#052d25] p-4">
              {[
                { label: "Services", href: "#pricing" },
                { label: "About", href: "#experts" },
                { label: "VAT Framework", href: "#vat-framework" },
                { label: "Access to Work", href: "#access-to-work" },
                { label: "FAQ", href: "#faq" },
                { label: "Insights & Resources", href: "/insights" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md px-4 py-2.5 text-sm font-semibold text-paper/80 hover:bg-white/10 hover:text-paper"
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => { setMobileNavOpen(false); setIsContactModalOpen(true); }}
                className="mt-2 rounded-md bg-acid px-4 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Get in touch
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div {...reveal}>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1] md:text-7xl">
              Reduce admin. Keep the human touch.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/72 md:text-lg">
              We help small businesses, charities, founders and busy teams reduce repetitive admin through a practical mix of AI, automation and human virtual support.
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
          <motion.div {...reveal}>
            <p className="eyebrow text-muted">The shift</p>
            <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
              What working with VAxAI looks like
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Whether you&apos;re drowning in emails, chasing follow-ups, managing spreadsheets or struggling to keep information organised, we help create systems that save time, reduce pressure and keep work moving.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-60px" }} className="mt-10 grid gap-5 md:grid-cols-2">
            <motion.div variants={staggerChild} className="card-surface rounded-2xl p-6">
              <p className="mb-4 eyebrow text-muted">Before VAxAI</p>
              <div className="grid gap-3">
                {[
                  "Inboxes full of unread emails",
                  "Follow-ups being missed or delayed",
                  "Information spread across multiple systems",
                  "Manual reporting taking hours each week",
                  "Team members unsure who owns what",
                  "Valuable time spent on repetitive admin instead of meaningful work",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-sm font-semibold text-ink/40">·</span>
                    <p className="text-sm leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={staggerChild} className="rounded-2xl border border-forest/10 bg-gradient-to-br from-mint/70 via-white to-cream/30 p-6 shadow-card">
              <p className="mb-4 eyebrow text-forest">After VAxAI</p>
              <div className="grid gap-3">
                {[
                  "Inboxes organised and prioritised",
                  "Follow-ups tracked and completed on time",
                  "Clear processes everyone can follow",
                  "Reporting streamlined and easier to manage",
                  "Better visibility of responsibilities and workload",
                  "More time for clients, projects and strategic work",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">✓</span>
                    <p className="text-sm leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SectionWave />
      <section id="services" className="section-forest relative px-4 py-20 text-paper md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Real results from working with VAxAI"
            copy="Every organisation works differently, but the goal is always the same: less admin, clearer processes and more time for the work that matters. Here are a few examples of how we've helped clients achieve that."
            narrow
          />
          {/* 3-col layout: left cards | centre image | right cards */}
          <div className="mt-12 grid gap-5 md:grid-cols-[1fr_260px_1fr] md:grid-rows-2">

            {/* Card 01: row 1, col 1 */}
            {(() => { const study = caseStudies[0]; return (
              <article className="card-forest flex flex-col overflow-hidden rounded-2xl">
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 text-[10px] font-bold text-acid/70">01</span>
                  <h3 className="text-base font-semibold text-paper">{study.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-paper/68">{study.teaser}</p>
                  <button type="button" onClick={() => setOpenCase(0)} className="mt-4 inline-flex w-fit text-xs font-semibold text-acid hover:underline">
                    Click to see the results →
                  </button>
                </div>
              </article>
            ); })()}

            {/* Centre image: spans both rows */}
            <div className="hidden overflow-hidden rounded-2xl ring-1 ring-white/10 md:row-span-2 md:block">
              <PhotoCard src={image.expert} className="h-full w-full min-h-[320px]" />
            </div>

            {/* Card 02: row 1, col 3 */}
            {(() => { const study = caseStudies[1]; return (
              <article className="card-forest flex flex-col overflow-hidden rounded-2xl">
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 text-[10px] font-bold text-acid/70">02</span>
                  <h3 className="text-base font-semibold text-paper">{study.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-paper/68">{study.teaser}</p>
                  <button type="button" onClick={() => setOpenCase(1)} className="mt-4 inline-flex w-fit text-xs font-semibold text-acid hover:underline">
                    Click to see the results →
                  </button>
                </div>
              </article>
            ); })()}

            {/* Card 03: row 2, col 1 */}
            {(() => { const study = caseStudies[2]; return (
              <article className="card-forest flex flex-col overflow-hidden rounded-2xl">
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 text-[10px] font-bold text-acid/70">03</span>
                  <h3 className="text-base font-semibold text-paper">{study.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-paper/68">{study.teaser}</p>
                  <button type="button" onClick={() => setOpenCase(2)} className="mt-4 inline-flex w-fit text-xs font-semibold text-acid hover:underline">
                    Click to see the results →
                  </button>
                </div>
              </article>
            ); })()}

            {/* Card 04: row 2, col 3 */}
            {(() => { const study = caseStudies[3]; return (
              <article className="card-forest flex flex-col overflow-hidden rounded-2xl">
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 text-[10px] font-bold text-acid/70">04</span>
                  <h3 className="text-base font-semibold text-paper">{study.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-paper/68">{study.teaser}</p>
                  <button type="button" onClick={() => setOpenCase(3)} className="mt-4 inline-flex w-fit text-xs font-semibold text-acid hover:underline">
                    Click to see the results →
                  </button>
                </div>
              </article>
            ); })()}

            {/* Mobile-only image (shown between the two rows of cards on small screens) */}
            <div className="overflow-hidden rounded-2xl md:hidden">
              <PhotoCard src={image.expert} className="aspect-[16/7] w-full" />
            </div>
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
              <p className="mt-2 text-sm leading-6 text-paper/68">Want to find out more?</p>
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

      <section id="pricing" className="bg-paper px-4 pb-24 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Three ways to work with us"
            copy="Every organisation is different. We start by understanding how work happens today and recommend the right mix, whether that means improving existing systems, implementing new ones, or combining technology with human support."
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
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-ink/8 pt-5 text-sm">
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
      <section id="vat-framework" className="section-forest px-4 pb-20 pt-20 text-paper md:px-8 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Value, Alignment and Trust (vat)"
            copy="Our work is guided by the MT1L VAT Framework™, developed by Thesia. It shapes how we design services, work with clients and use AI and automation. For VAxAI, this means we do not introduce AI or automation simply because it is possible. We recommend it only where it adds value, aligns with the reality of how you work and can be trusted in practice."
            narrow
          />
          
          <motion.div {...reveal} className="mx-auto mt-10 max-w-3xl text-center">
          
            <a href="https://www.mt1l.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-acid">
              Want to learn more about MT1L and the VAT Framework? Check our the main MT1L Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section id="faq" className="section-paper-warm section-flow-top px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.75fr_1fr] md:gap-12">
          <motion.div {...reveal}>
            <p className="eyebrow text-muted">Frequently asked questions</p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">Questions about VAxAI?</h2>
            <p className="mt-5 text-sm leading-7 text-muted">Clear answers on how we assess your workflow, design AI support, and provide ongoing virtual assistance for everyday admin.</p>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="btn-forest mt-6"
            >
              Book a discovery call
              <MailCheck className="h-4 w-4" />
            </button>
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

      <section className="bg-paper px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Insights &amp; Resources</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                Our insights cover practical approaches to AI, automation and admin. If something
                resonates, you can attach it to your enquiry when you get in touch.
              </p>
            </div>
            <a href="/insights" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-forest/20 md:mt-0">
              View all insights
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
          {previewPosts.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {previewPosts.map((post) => (
                <motion.a
                  key={post.id}
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  {...reveal}
                  className="card-surface group flex flex-col overflow-hidden rounded-2xl"
                >
                  {post.cover_image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-ink/5">
                      <img src={post.cover_image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" loading="lazy" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {post.content_type && (
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{post.content_type}</p>
                    )}
                    <h3 className="text-sm font-semibold leading-snug text-ink">{post.title}</h3>
                    {post.description && (
                      <p className="mt-2 flex-1 text-xs leading-5 text-muted line-clamp-3">{post.description}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#063b32]">
                      Read more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
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
            <div className="flex h-full max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="flex shrink-0 items-center justify-between gap-6 bg-[#063b32] px-6 py-5 text-paper md:px-10 rounded-t-3xl">
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
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10 rounded-t-3xl">
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
                    Thank you. We have received your message and will be in touch shortly.
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
                      <input required type="tel" name="telephone" autoComplete="tel" className="rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                    </label>
                  ) : null}
                  <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                    Tell us more
                    <textarea required name="details" rows={5} className="resize-y rounded-md border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#063b32]" />
                  </label>
                  <div className="rounded-2xl border border-[#063b32]/20 bg-[#f3f9f5] p-5 md:col-span-2">
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

      {openCase !== null && caseStudies[openCase] && !caseStudies[openCase].placeholder ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenCase(null); }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10 rounded-t-3xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acid">Case study</p>
                <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight">{caseStudies[openCase].title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenCase(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-paper"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 md:p-10">
              <p className="text-sm leading-7 text-muted">{caseStudies[openCase].teaser}</p>
              {caseStudies[openCase].paragraphs?.map((p, pi) => (
                <p key={pi} className="mt-4 text-sm leading-7 text-muted">{p}</p>
              ))}
              {caseStudies[openCase].workflowPoints && (
                <ul className="mt-4 grid gap-2 rounded-md border border-ink/10 bg-cream p-4">
                  {caseStudies[openCase].workflowPoints!.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm leading-6 text-muted">
                      <span className="mt-0.5 shrink-0 text-ink/40">·</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {caseStudies[openCase].results && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">Results</p>
                  <ul className="mt-3 grid gap-2">
                    {caseStudies[openCase].results!.map((r) => (
                      <li key={r} className="flex gap-3 text-sm leading-6 text-muted">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-acid text-[10px] font-black text-ink">✓</span>
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
                  className="inline-flex items-center gap-2 rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper"
                >
                  Work with us
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCase(null)}
                  className="inline-flex items-center rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
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
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-paper shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-6 bg-[#063b32] px-6 py-6 text-paper md:px-10 rounded-t-3xl">
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
          background-color: #063b32 !important;
          border-color: #063b32 !important;
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
          background-color: #063b32 !important;
          color: #ffffff !important;
        }
      `}</style>
      <SimplifiedModeToggle />
    </main>
  );
}
