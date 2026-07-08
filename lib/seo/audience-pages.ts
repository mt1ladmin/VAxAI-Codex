import type { ServiceSection } from "@/components/marketing/ServiceLandingPage";

export type AudiencePage = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  serviceType: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: ServiceSection[];
  pricingNotes: string[];
};

export const audiencePages: AudiencePage[] = [
  {
    slug: "founders-entrepreneurs",
    metaTitle: "Virtual Assistant & Admin Support for Founders UK",
    metaDescription:
      "VAxAI helps UK founders and entrepreneurs reduce inbox pressure, follow-up gaps and admin overload with tailored virtual assistance, practical workflows, and AI or automation only where helpful.",
    serviceType: "Virtual assistance and admin support for founders",
    eyebrow: "Founders & Entrepreneurs",
    title: "Support shaped around how you run your business",
    intro:
      "Founders and entrepreneurs often carry too many priorities at once — client work, growth, scheduling, follow-ups and the admin that keeps everything moving. VAxAI takes time to understand your context, tools and workflows before recommending the right mix of human support, better processes, and AI or automation only where it genuinely helps.",
    sections: [
      {
        id: "pressures",
        heading: "Pressures we often see",
        paragraphs: [
          "When you are building a business, admin rarely stays in one place. It spreads across your inbox, calendar, notes, client messages and the follow-ups you mean to send later — while growth work waits.",
        ],
        bullets: [
          "Too many competing priorities and not enough protected focus time",
          "Inbox overload and messages arriving across multiple channels",
          "Inconsistent follow-up on clients, leads and internal actions",
          "Scheduling, diary management and meeting preparation taking longer than it should",
          "Client management spread across tools with no clear single view",
          "Admin growing faster than the repeatable systems behind it",
        ],
      },
      {
        id: "how-we-help",
        heading: "How VAxAI support fits",
        paragraphs: [
          "We do not start with software. We start with how your work actually happens — then shape practical support around the way you operate, including where human judgement must stay central.",
        ],
        bullets: [
          "Workflow reviews to see where time is being lost and pressure is building",
          "Virtual assistance for inbox triage, scheduling, follow-ups and coordination",
          "Clearer processes so client work and priorities do not depend on memory alone",
          "Light automation for repetitive organisation where it reduces friction safely",
          "Ongoing support that adapts as your business grows and changes",
        ],
      },
      {
        id: "what-changes",
        heading: "What changes in practice",
        bullets: [
          "More protected time for clients, delivery and business growth",
          "Fewer missed follow-ups and clearer visibility of what needs attention",
          "Scheduling and admin handled with consistency behind the scenes",
          "Repeatable ways of working that do not rely on you holding everything in your head",
        ],
        paragraphs: [],
      },
    ],
    pricingNotes: [
      "Pricing is tailored to your business stage, client load, systems and the level of support you need.",
      "If you may be eligible, Access to Work could cover some or all of your support — we can help you understand what that may involve.",
    ],
  },
  {
    slug: "small-business",
    metaTitle: "Admin Support & Automation for Small Businesses UK",
    metaDescription:
      "VAxAI helps UK small businesses manage customer enquiries, bookings, invoices, documents, follow-ups and team coordination with practical virtual assistance, workflows and automation.",
    serviceType: "Admin support and workflow automation for small businesses",
    eyebrow: "Small Business",
    title: "Admin support that fits how your business runs",
    intro:
      "Small businesses feel admin pressure quickly — enquiries to answer, bookings to manage, invoices to chase, documents to file and follow-ups that keep the operation moving. VAxAI learns your context, tools and workflows first, then recommends human support, clearer processes, and AI or automation only where they add real value.",
    sections: [
      {
        id: "pressures",
        heading: "Pressures we often see",
        paragraphs: [
          "In a small business, work often arrives faster than the systems behind it. Customer messages, internal coordination and repetitive tasks can start to compete with the work that actually earns revenue.",
        ],
        bullets: [
          "Customer enquiries and messages arriving across email, phone and social channels",
          "Bookings, appointments and scheduling handled manually",
          "Invoices, payments and document filing taking more time than expected",
          "Follow-ups on quotes, orders and supplier actions slipping through",
          "Internal processes that live in people's heads rather than shared systems",
          "Team coordination becoming harder as workload grows",
          "Repetitive admin repeating every week without a clearer way to handle it",
        ],
      },
      {
        id: "how-we-help",
        heading: "How VAxAI support fits",
        paragraphs: [
          "We help small businesses create calmer, clearer ways of working — combining virtual assistance and practical process support with automation only where it genuinely reduces repetition.",
        ],
        bullets: [
          "Reviews of how enquiries, bookings, documents and tasks move through the business",
          "Virtual assistance for inbox management, follow-ups and day-to-day coordination",
          "Clearer ownership of customer information, files and internal actions",
          "Automation for repetitive organisation where appropriate and safe",
          "Implementation support so changes work for the whole team",
        ],
      },
      {
        id: "what-changes",
        heading: "What changes in practice",
        bullets: [
          "Customer enquiries and follow-ups handled more consistently",
          "Less time spent searching for documents, details and updates",
          "Clearer internal processes that are easier to hand over or repeat",
          "Admin that grows more slowly than the business itself",
        ],
        paragraphs: [],
      },
    ],
    pricingNotes: [
      "Pricing is tailored to your business complexity, team size, systems and the level of ongoing assistance required.",
      "If you may be eligible, Access to Work could cover some or all of your support — we can help you understand what that may involve.",
    ],
  },
  {
    slug: "charities-non-profits",
    metaTitle: "Virtual Assistant Support for UK Charities & Non-Profits",
    metaDescription:
      "VAxAI helps UK charities and non-profits reduce admin pressure across reporting, volunteer coordination, funding admin, compliance, safeguarding records, inboxes and follow-ups.",
    serviceType: "Virtual assistance and admin support for charities",
    eyebrow: "Charities & Non-Profits",
    title: "More capacity for the work that matters",
    intro:
      "UK charities and non-profits are often stretched — limited capacity, growing reporting demands, volunteer coordination, funding admin and the everyday communication that keeps services running. VAxAI takes time to understand your context, tools and workflows before shaping practical support around delivery, compliance and relationships.",
    sections: [
      {
        id: "pressures",
        heading: "Pressures we often see",
        paragraphs: [
          "Charity teams are frequently doing more with less. Admin does not just sit in one inbox — it spreads across service delivery, volunteers, funders, compliance and the follow-ups that keep people safe and supported.",
        ],
        bullets: [
          "Limited capacity across a small core team and wider volunteer network",
          "Reporting and funder administration adding pressure alongside delivery",
          "Volunteer coordination, rotas, onboarding and communication taking significant time",
          "Service delivery admin competing with front-line priorities",
          "Compliance, safeguarding records and information handling needing consistent care",
          "Inboxes and requests arriving through multiple channels",
          "Follow-ups on referrals, partners and internal actions becoming hard to track",
        ],
      },
      {
        id: "how-we-help",
        heading: "How VAxAI support fits",
        paragraphs: [
          "We help charities put calm, practical support around routine administration — while keeping people responsible for the decisions that matter to beneficiaries, volunteers, funders and partners.",
        ],
        bullets: [
          "Workflow reviews across communication, records, reporting and coordination",
          "Virtual assistance for inboxes, scheduling, follow-ups and document organisation",
          "Clearer processes for information handling, safeguarding records and internal actions",
          "Automation for repetitive organisation where it reduces manual burden safely",
          "Ongoing support that adapts as funding, staffing and service priorities change",
        ],
      },
      {
        id: "what-changes",
        heading: "What changes in practice",
        bullets: [
          "Better visibility across requests, actions and follow-ups",
          "Less time lost to manual reporting and repeated coordination",
          "Clearer information handling across teams and volunteers",
          "More capacity directed towards service delivery and relationships",
        ],
        paragraphs: [],
      },
    ],
    pricingNotes: [
      "Pricing is tailored to your organisation's size, reporting needs, safeguarding requirements and the level of ongoing support required.",
      "If you may be eligible, Access to Work could cover some or all of your support — we can help you understand what that may involve.",
    ],
  },
  {
    slug: "neurodivergent-professionals",
    metaTitle: "Admin & Virtual Assistant Support for Neurodivergent Professionals UK",
    metaDescription:
      "VAxAI offers tailored UK support for neurodivergent professionals facing admin overwhelm, task switching, follow-ups, scheduling, consistency challenges and executive functioning pressure.",
    serviceType: "Tailored virtual assistance for neurodivergent professionals",
    eyebrow: "Neurodivergent Professionals",
    title: "Support shaped around how your mind works",
    intro:
      "Neurodivergent professionals often face admin and organisation challenges that standard productivity advice does not solve — overwhelm, task switching, inconsistent follow-through, inbox build-up, scheduling friction and difficulty maintaining systems over time. VAxAI offers calm, practical support tailored to your working context, combining human assistance, accessible workflows, and AI or automation only where it genuinely helps.",
    sections: [
      {
        id: "pressures",
        heading: "Pressures we often see",
        paragraphs: [
          "Admin pressure can feel especially heavy when executive functioning, sensory load, communication demands and inconsistent systems all collide. The issue is rarely effort — it is often that the work environment was not designed around how you actually function.",
        ],
        bullets: [
          "Overwhelm when inboxes, tasks and messages all demand attention at once",
          "Difficulty with task switching, prioritisation and knowing what to do next",
          "Follow-ups, reminders and actions slipping despite genuine intent",
          "Scheduling, diary management and planning taking disproportionate energy",
          "Inconsistent admin habits when systems feel too rigid or too vague",
          "Communication across email, messages and meetings becoming hard to track",
          "Maintaining organisation when workload, energy or context keeps changing",
        ],
      },
      {
        id: "how-we-help",
        heading: "How VAxAI support fits",
        paragraphs: [
          "We take time to understand your role, tools, energy patterns and the types of admin that create the most friction. Support is shaped around accessible ways of working — not forcing you into a one-size-fits-all system.",
        ],
        bullets: [
          "Workflow reviews focused on where admin pressure and inconsistency build up",
          "Human virtual assistance for inbox support, scheduling, follow-ups and coordination",
          "Clearer, calmer processes that reduce decision fatigue and context switching",
          "AI or automation only where it simplifies repetitive organisation without adding noise",
          "Ongoing support that adapts as your role, workload and needs change",
          "Practical help understanding Access to Work if funded support may be relevant",
        ],
      },
      {
        id: "what-changes",
        heading: "What changes in practice",
        bullets: [
          "Less admin carried alone in your head or inbox",
          "More consistent follow-through with human support behind the scenes",
          "Scheduling and communication handled in a steadier, more predictable way",
          "Ways of working that feel usable rather than demanding constant self-monitoring",
        ],
        paragraphs: [],
      },
    ],
    pricingNotes: [
      "Pricing is tailored to your role, support needs and the level of ongoing assistance required.",
      "If you may be eligible, Access to Work could cover some or all of your support — we can help you understand what that may involve.",
    ],
  },
];

export const audiencePagePaths = audiencePages.map((page) => `/${page.slug}`);

export function getAudiencePage(slug: string): AudiencePage | undefined {
  return audiencePages.find((page) => page.slug === slug);
}

export function getRelatedAudienceLinks(currentSlug: string) {
  return audiencePages
    .filter((page) => page.slug !== currentSlug)
    .map((page) => ({
      href: `/${page.slug}`,
      label: page.eyebrow,
      description: page.intro.split(".")[0] + ".",
    }));
}