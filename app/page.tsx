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
import { AppSelect } from "@/components/ui/AppSelect";

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
    title: "More examples coming soon",
    teaser: "We are adding more client examples to this section. Each one will illustrate a different challenge and how a practical combination of process, automation and human support helped resolve it.",
    placeholder: true,
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
    copy: [
      "A focused review of your admin workload, tools, processes and team — identifying where pressure is building and what the right response looks like.",
    ],
    items: ["VAT Framework review", "AI value and risk map", "Workflow and capacity review", "Practical recommendations and next steps"],
  },
  {
    step: "02",
    title: "Strategy, Implementation & Capability Building",
    label: "Assess + Implement",
    copy: [
      "We put the right solution in place based on your assessment — improving processes, making better use of existing tools, introducing new systems or training your team.",
    ],
    items: ["Everything included in Assess", "Tool selection and implementation support", "Team training and capability building", "Documentation and handover"],
  },
  {
    step: "03",
    title: "Recommended: Ongoing Support",
    label: "Assess + Implement + Support",
    featured: true,
    copy: [
      "Continued support after implementation — VA assistance, system monitoring and ongoing adjustments as your workload and priorities change.",
    ],
    items: ["Everything included in Assess and Implement", "Process and system optimisation", "Team support and guidance", "Dedicated support hours within your package"],
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
    ["left-[7%] top-10 h-32 w-32 rounded-full bg-acid/70"],
    ["left-[24%] bottom-10 h-20 w-20 rounded-full bg-[#f28a4b]/40"],
    ["left-[43%] top-16 h-24 w-24 rounded-full bg-[#8fd0b0]/45"],
    ["right-[23%] bottom-12 h-16 w-16 rotate-12 rounded-md bg-[#f6c84f]/50"],
    ["right-[8%] top-10 h-36 w-36 rounded-full bg-[#4479a8]/25"],
  ];

  return (
    <motion.div
      {...reveal}
      className="relative mt-10 px-6 py-28 text-ink"
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
  const [openCase, setOpenCase] = useState<number | null>(null);
  const [contactStep, setContactStep] = useState<"form" | "submitted" | "calendly">("form");
  const [preferredContact, setPreferredContact] = useState("Email");
  const [supportType, setSupportType] = useState("Assessment");
  const [wantsDiscoveryCall, setWantsDiscoveryCall] = useState<boolean | null>(null);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
  const [previewPosts, setPreviewPosts] = useState<PostPreview[]>([]);

  useEffect(() => {
    fetch("/api/posts?limit=3")
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setPreviewPosts(data); })
      .catch(() => {});
  }, []);

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

      <section className="bg-[#063b32] px-4 pb-16 pt-5 text-paper md:px-8 md:pb-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <MiniLogo />
          <div className="hidden items-center gap-5 text-xs font-semibold text-paper/70 md:flex">
            <a href="#pricing" className="hover:text-paper">Services</a>
            <a href="#experts" className="hover:text-paper">About</a>
            <a href="#vat-framework" className="hover:text-paper">VAT Framework</a>
            <a href="#access-to-work" className="hover:text-paper">Access to Work</a>
            <a href="#faq" className="hover:text-paper">FAQ</a>
            <a href="/insights" className="text-[#f5f274]/80 hover:text-[#f5f274]">Insights & Resources</a>
          </div>
          <button type="button" onClick={() => setIsContactModalOpen(true)} className="hidden rounded-md bg-acid px-4 py-2 text-xs font-semibold text-ink md:inline-flex">
            Get in touch
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-md border border-white/15 md:hidden" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </nav>

        <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
          <motion.div {...reveal}>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1] md:text-7xl">
              Reduce admin. Keep the human touch.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/72 md:text-lg">
              We help small businesses, charities, founders and busy teams reduce repetitive admin through a practical mix of AI, automation and human virtual support.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setIsContactModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 text-sm font-semibold text-ink">
                Start your workflow review
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
          <motion.div {...reveal} className="relative mx-auto w-full max-w-[420px]">
            <PhotoCard src={image.hero} className="aspect-[0.86] rounded-[28px]" />
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal}>
            <h2 className="text-2xl font-semibold leading-snug md:text-3xl">
              What working with VAxAI looks like
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              Whether you&apos;re drowning in emails, chasing follow-ups, managing spreadsheets or struggling to keep information organised, we help create systems that save time, reduce pressure and keep work moving.
            </p>
          </motion.div>
          <motion.div {...reveal} className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-md border border-ink/10 bg-white p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Before VAxAI</p>
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
                    <span className="mt-0.5 shrink-0 text-sm font-semibold text-ink/40">—</span>
                    <p className="text-sm leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[#063b32]/15 bg-[#f3f9f5] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">After VAxAI</p>
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
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="bg-[#063b32] px-4 py-20 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Real results from working with VAxAI"
            copy="Every client challenge is different. Here are some examples of how we have helped organisations reduce admin, create clarity and keep work moving."
            narrow
          />
          {/* 3-col layout: left cards | centre image | right cards */}
          <div className="mt-12 grid gap-5 md:grid-cols-[1fr_260px_1fr] md:grid-rows-2">

            {/* Card 01 — row 1, col 1 */}
            {(() => { const study = caseStudies[0]; return (
              <article className="flex flex-col overflow-hidden rounded-md border border-white/12 bg-white/[0.07]">
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

            {/* Centre image — spans both rows */}
            <div className="hidden overflow-hidden rounded-md md:row-span-2 md:block">
              <PhotoCard src={image.expert} className="h-full w-full min-h-[320px]" />
            </div>

            {/* Card 02 — row 1, col 3 */}
            {(() => { const study = caseStudies[1]; return (
              <article className="flex flex-col overflow-hidden rounded-md border border-white/12 bg-white/[0.07]">
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

            {/* Card 03 — row 2, col 1 */}
            {(() => { const study = caseStudies[2]; return (
              <article className="flex flex-col overflow-hidden rounded-md border border-white/12 bg-white/[0.07]">
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

            {/* Card 04 — row 2, col 3 */}
            {(() => { const study = caseStudies[3]; return (
              <article className="flex flex-col overflow-hidden rounded-md border border-white/12 bg-white/[0.07]">
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 text-[10px] font-bold text-acid/70">04</span>
                  <h3 className="text-base font-semibold text-paper">{study.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-paper/68">{study.teaser}</p>
                  {!study.placeholder && (
                    <button type="button" onClick={() => setOpenCase(3)} className="mt-4 inline-flex w-fit text-xs font-semibold text-acid hover:underline">
                      Click to see the results →
                    </button>
                  )}
                </div>
              </article>
            ); })()}

            {/* Mobile-only image (shown between the two rows of cards on small screens) */}
            <div className="overflow-hidden rounded-md md:hidden">
              <PhotoCard src={image.expert} className="aspect-[16/7] w-full" />
            </div>
          </div>

          <motion.div
            {...reveal}
            id="access-to-work"
            className="mt-12 flex flex-col gap-5 rounded-2xl border border-white/12 bg-white/[0.07] p-6 md:flex-row md:items-center md:justify-between"
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
            title="Three ways to work with us"
            copy="Every organisation is different. We start by understanding how work happens today and recommend the right mix — whether that means improving existing systems, implementing new ones, or combining technology with human support."
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
                  <h3 className="mt-3 text-2xl font-semibold leading-tight">{plan.label}</h3>
                  <div className="mt-4 min-h-20 space-y-3 text-sm leading-6 text-muted">
                    {plan.copy.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
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
                    Book a discovery call
                  </button>
                ) : null}
              </article>
              ))}
            </div>
            <div className="mt-3 grid gap-3 rounded-md border border-ink/10 bg-[#f3f9f5] p-5 text-sm leading-6 text-muted md:grid-cols-[1fr_0.9fr]">
              <p>
                Pricing is tailored to each client and depends on factors such as organisational complexity, existing systems, implementation requirements, training needs and the level of ongoing support required. This may differ for businesses, charities, consultants, founders and individual professionals.
              </p>
              <p>
                Before any assessment begins, we will discuss your requirements and provide a clear quotation for the recommended scope of work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="vat-framework" className="bg-[#063b32] px-4 pt-24 pb-20 text-paper md:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            light
            title="Value, Alignment and Trust"
            copy="VAxAI uses the MT1L VAT Framework to decide whether existing tools, new systems, AI, automation or human support are the right fit."
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


      <section id="faq" className="px-4 py-20 md:px-8">
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

      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Insights &amp; Resources</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                Our insights cover practical approaches to AI, automation and admin — written for people who want clarity, not jargon.
                If something resonates, you can attach it to your enquiry when you get in touch.
              </p>
            </div>
            <a href="/insights" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink md:mt-0">
              View all insights
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
          {previewPosts.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {previewPosts.map((post) => (
                <motion.a
                  key={post.id}
                  href={`/insights/${post.slug}`}
                  {...reveal}
                  className="group flex flex-col overflow-hidden rounded-md border border-ink/10 bg-white transition hover:shadow-[0_8px_30px_rgba(17,17,17,0.1)]"
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

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_14px_45px_rgba(17,17,17,0.05)] md:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">VAxAI support to book</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] text-ink md:text-5xl">Admin support that can grow with you</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-muted">Start with a workflow call and leave with a clearer sense of what should be automated, what should stay human, and what support your small business or charity actually needs.</p>
            <button type="button" onClick={() => setIsContactModalOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#063b32] px-5 py-3 text-sm font-semibold text-paper">
              Book a discovery call
              <MailCheck className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-cream p-3 md:p-4">
            <PhotoCard src={image.cta} className="min-h-[320px] rounded-md" />
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-3 text-2xl font-semibold">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#063b32] text-sm text-acid">VA</span>
            <span>VAxAI</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="mb-5 font-semibold">Services</p>
              <div className="grid gap-4 text-muted">
                <a href="#pricing">Assessment</a>
                <a href="#services">AI and Automation</a>
                <a href="#services">VA Support</a>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold">Company</p>
              <div className="grid gap-4 text-muted">
                <a href="#experts">About</a>
                <a href="https://www.mt1l.com" target="_blank" rel="noreferrer">MT1L</a>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Contact</button>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold">Support</p>
              <div className="grid gap-4 text-muted">
                <a href="#faq">FAQ</a>
                <a href="#access-to-work">Access to Work</a>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Workflow consultation</button>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold">Insights</p>
              <div className="grid gap-4 text-muted">
                <a href="/insights">Insights &amp; Resources</a>
                <a href="/#vat-framework">VAT Framework</a>
              </div>
            </div>
            <div>
              <p className="mb-5 font-semibold">Legal</p>
              <div className="grid gap-4 text-muted">
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Privacy</button>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">Terms</button>
                <button type="button" onClick={() => setIsContactModalOpen(true)} className="w-fit text-left">EDI policy</button>
                <a href="/admin/login" className="mt-1 w-fit text-xs text-muted/50 hover:text-muted">VAxAI Studio</a>
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
                      <span className="mt-0.5 shrink-0 text-ink/40">—</span>
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
