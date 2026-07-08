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
};

export const audiencePages: AudiencePage[] = [
  {
    slug: "founders-entrepreneurs",
    metaTitle: "Virtual Assistant & Admin Support for Founders UK",
    metaDescription:
      "VAxAI helps UK founders and entrepreneurs reduce repetitive admin with virtual assistance, practical AI, automation and human support where judgement still matters.",
    serviceType: "Virtual assistance and admin support for founders",
    eyebrow: "Founders & Entrepreneurs",
    title: "Virtual assistance and admin support for founders and entrepreneurs",
    intro:
      "Founders often carry the weight of the business in their inbox, calendar and follow-ups. VAxAI helps you spend less time managing work and more time growing the business — combining practical AI, automation, better processes and human support where each adds the most value.",
    sections: [
      {
        id: "who-benefits",
        heading: "Who this is for",
        paragraphs: [
          "This work suits founders and entrepreneurs who are spending several hours each week on emails, scheduling, tracking actions and chasing follow-ups — and want a practical way to reclaim that time without adding unnecessary software.",
        ],
        bullets: [
          "Solo founders managing client communication and delivery",
          "Entrepreneurs growing a business without a full admin team",
          "Leaders who need human oversight around important decisions",
          "Founders exploring Access to Work or similar support routes",
        ],
      },
      {
        id: "what-we-help-with",
        heading: "What we help with",
        paragraphs: [
          "We start by understanding how work happens today, then recommend the right mix of virtual assistance, AI, automation and process improvement for the way you already operate.",
        ],
        bullets: [
          "Workflow reviews to identify where admin pressure is building",
          "Virtual assistance for tasks that should stay human",
          "Automation of repetitive organisation where appropriate",
          "Clearer processes so follow-ups and priorities do not get lost",
          "Ongoing support as your business grows and changes",
        ],
      },
      {
        id: "typical-results",
        heading: "What changes in practice",
        bullets: [
          "Significant reduction in time spent on admin",
          "Fewer missed follow-ups and clearer priorities",
          "More time for clients, delivery and business growth",
          "A practical solution built around how you already work",
        ],
        paragraphs: [],
      },
    ],
  },
  {
    slug: "small-business",
    metaTitle: "Admin Support & Automation for Small Businesses UK",
    metaDescription:
      "VAxAI helps UK small businesses create clearer ways of working with virtual assistance, AI, automation and practical process support.",
    serviceType: "Admin support and workflow automation for small businesses",
    eyebrow: "Small Business",
    title: "Admin support and automation for small businesses",
    intro:
      "As small businesses grow, admin, systems and ways of working can start to pull in different directions. VAxAI helps UK small businesses create clearer processes, make better use of existing tools and introduce AI or automation only where it genuinely saves time.",
    sections: [
      {
        id: "who-benefits",
        heading: "Who this is for",
        paragraphs: [
          "Small businesses using multiple systems to manage projects, documents and client information — where it has become harder to know where information belongs or who owns what.",
        ],
        bullets: [
          "Growing teams needing consistent ways of working",
          "Businesses duplicating work across tools and inboxes",
          "Owners who want admin to grow more slowly than the organisation",
          "Teams preparing to onboard new staff without losing clarity",
        ],
      },
      {
        id: "what-we-help-with",
        heading: "What we help with",
        paragraphs: [
          "Rather than starting with technology, we review how work moves across your business and design practical improvements using the right mix of human support, automation and better processes.",
        ],
        bullets: [
          "Assessment of admin workload, tools and team capacity",
          "Clearer ownership of information and tasks",
          "Automation where repetitive work can be handled safely",
          "Virtual assistance for work that needs human judgement",
          "Implementation and training so changes work in practice",
        ],
      },
      {
        id: "typical-results",
        heading: "What changes in practice",
        bullets: [
          "Less duplication across systems and inboxes",
          "Clear ownership of information and responsibilities",
          "Faster onboarding for new team members",
          "Less time spent searching for files and updates",
        ],
        paragraphs: [],
      },
    ],
  },
  {
    slug: "charities-non-profits",
    metaTitle: "Virtual Assistant Support for Charities & Non-Profits UK",
    metaDescription:
      "VAxAI helps UK charities and non-profits reduce admin pressure with virtual assistance, AI, automation and human support so more time goes into delivering services.",
    serviceType: "Virtual assistance and admin support for charities",
    eyebrow: "Charities & Non-Profits",
    title: "Virtual assistance and admin support for charities and non-profits",
    intro:
      "Charities and non-profits need capacity for the work that matters — not endless admin. VAxAI helps UK organisations reduce repetitive administration with practical AI, automation, clearer processes and trusted human support where judgement and relationships still count.",
    sections: [
      {
        id: "who-benefits",
        heading: "Who this is for",
        paragraphs: [
          "Charities and non-profits where messages, requests and updates arrive through multiple channels, making it difficult to maintain visibility, respond consistently and keep focus on service delivery.",
        ],
        bullets: [
          "Small charity teams with limited admin capacity",
          "Non-profits managing volunteers, funders and service users",
          "Organisations where reporting and compliance add pressure",
          "Teams trying to do more without growing back-office headcount",
        ],
      },
      {
        id: "what-we-help-with",
        heading: "What we help with",
        paragraphs: [
          "We help charities put the right support around routine administration while keeping people responsible for the decisions that matter to beneficiaries, funders and partners.",
        ],
        bullets: [
          "Central communication workflows across email and other channels",
          "Automation of repetitive organisation where appropriate",
          "Virtual assistance for follow-ups, scheduling and coordination",
          "Clearer processes that reduce manual reporting burden",
          "Ongoing refinement as priorities and funding change",
        ],
      },
      {
        id: "typical-results",
        heading: "What changes in practice",
        bullets: [
          "Better visibility across incoming requests and actions",
          "Faster response times with fewer missed follow-ups",
          "Less manual administration across channels",
          "More time directed towards delivering services",
        ],
        paragraphs: [],
      },
    ],
  },
  {
    slug: "busy-teams",
    metaTitle: "Admin Support & Workflow Automation for Busy Teams UK",
    metaDescription:
      "VAxAI helps busy UK teams improve how work flows with virtual assistance, AI, automation, clearer processes and ongoing human support.",
    serviceType: "Admin support and workflow automation for teams",
    eyebrow: "Busy Teams",
    title: "Admin support and workflow automation for busy teams",
    intro:
      "Busy teams feel the pressure when work arrives from every direction and no one is quite sure where responsibility sits. VAxAI helps UK teams create clearer ways of working — combining virtual assistance, automation, better processes and human support so work flows more smoothly.",
    sections: [
      {
        id: "who-benefits",
        heading: "Who this is for",
        paragraphs: [
          "Teams where different people have developed their own ways of managing clients, files and daily work — making handover difficult and consistency harder to maintain as the organisation grows.",
        ],
        bullets: [
          "Teams juggling inboxes, projects and reporting at once",
          "Managers needing clearer ownership across workloads",
          "Groups spending more time coordinating work than doing it",
          "Organisations scaling without wanting admin to scale at the same rate",
        ],
      },
      {
        id: "what-we-help-with",
        heading: "What we help with",
        paragraphs: [
          "We document how work happens today, introduce practical automations where they help, and put human support around the tasks that still need judgement, relationships or oversight.",
        ],
        bullets: [
          "Workflow reviews to find where pressure is building",
          "Documented processes the whole team can follow",
          "Automation for repetitive tasks and organisation",
          "Virtual assistance to keep actions and follow-ups moving",
          "Ongoing support as team priorities shift",
        ],
      },
      {
        id: "typical-results",
        heading: "What changes in practice",
        bullets: [
          "More consistent ways of working across the team",
          "Faster onboarding and easier handovers",
          "Reduced reliance on individual team members",
          "Better continuity as workloads and priorities change",
        ],
        paragraphs: [],
      },
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