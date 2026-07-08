export type AudienceSection = {
  heading: string;
  paragraphs: string[];
  bulletsLabel?: string;
  bullets?: string[];
  closing?: string;
};

export type AudiencePage = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  serviceType: string;
  audienceName: string;
  title: string;
  intro: string;
  heroHasAccessCta: boolean;
  understanding?: { heading: string; paragraphs: string[] };
  pressures: AudienceSection;
  delayed: AudienceSection;
  how: AudienceSection;
  changes: AudienceSection;
  pricingNote: string;
  accessToWork?: { heading: string; paragraphs: string[] };
  related: { label: string; description: string; linkLabel: string };
};

export const audiencePages: AudiencePage[] = [
  {
    slug: "founders-entrepreneurs",
    metaTitle: "Virtual Assistant & Admin Support for Founders UK",
    metaDescription:
      "VAxAI helps UK founders and entrepreneurs reduce inbox pressure, follow-up gaps and admin overload with tailored virtual assistance, practical workflows, and AI or automation only where helpful.",
    serviceType: "Virtual assistance and admin support for founders",
    audienceName: "Founders & Entrepreneurs",
    title: "Support shaped around how you run your business",
    intro:
      "Founders and entrepreneurs often carry too many priorities at once — client work, growth, scheduling, follow-ups and the admin that keeps everything moving. VAxAI takes time to understand your context, tools and workflows before recommending the right mix of human support, better processes, and AI or automation only where it genuinely helps.",
    heroHasAccessCta: true,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "When you are building a business, admin rarely stays in one place. It spreads across your inbox, calendar, notes, client messages and the follow-ups you mean to send later — while growth work waits.",
      ],
      bullets: [
        "Too many competing priorities and not enough protected focus time",
        "Inbox overload and messages arriving across multiple channels",
        "Inconsistent follow-up on clients, leads and internal actions",
        "Scheduling, diary management and meeting preparation taking longer than they should",
        "Client information spread across different tools with no clear single view",
        "Admin growing faster than the repeatable systems behind the business",
        "Too much information being held in your head because there is no clear handover point",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "When admin stays dependent on the founder, the business becomes harder to grow without increasing pressure on the person at the centre of it.",
        "Leads can go cold, client follow-ups can be missed, and valuable work can be delayed because day-to-day admin keeps taking priority. The risk is not only lost time. It is missed opportunities, inconsistent client experience, and a business that becomes harder to hand over, repeat or scale because too much still depends on you holding everything together.",
      ],

      bullets: [
        "Missed leads and slower client follow-up",
        "Growth work being pushed behind urgent admin",
        "Too much responsibility sitting with the founder",
        "Decisions being made from pressure rather than clarity",
        "Difficulty delegating because processes are not documented",
        "Founder fatigue from holding too much information, context and responsibility alone",
      ],
    },
    how: {
      heading: "How VAxAI support fits",
      paragraphs: [
        "We do not start with software. We start with how your work actually happens — then shape practical support around the way you operate, including where human judgement needs to stay central.",
      ],
      bulletsLabel: "VAxAI can support you through:",
      bullets: [
        "Workflow reviews to identify where time is being lost and pressure is building",
        "Virtual assistance for inbox triage, scheduling, follow-ups and coordination",
        "Clearer processes for client work, leads, recurring tasks and handovers",
        "Light automation where it reduces repetition safely and makes work easier to manage",
        "Practical support that adapts as your business grows, changes or becomes more complex",
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support in place, your business becomes easier to run because fewer things depend on you carrying every task, reminder and next step in your head.",
      ],
      bulletsLabel: "You can gain:",
      bullets: [
        "More protected time for client delivery, sales and strategic growth",
        "Faster and more consistent follow-up with clients, leads and partners",
        "Clearer systems that make delegation easier",
        "Less reliance on memory, late-night admin or last-minute chasing",
        "A calmer operating rhythm around inboxes, scheduling and tasks",
        "Better visibility of what needs action, what can wait and what can be handed over",
      ],
      closing:
        "The goal is not to remove you from your business. It is to reduce the avoidable admin pressure that stops you focusing on the work only you can do.",
    },
    pricingNote:
      "Pricing is tailored to your business stage, client load, tools, systems and the level of support you need.",
    accessToWork: {
      heading: "Your VAxAI support could cost you nothing",
      paragraphs: [
        "If you are eligible, Access to Work may help cover support such as virtual assistance, admin support, workflow tools or support using digital systems.",
        "This may be relevant for disabled or neurodivergent founders, self-employed professionals and business owners who need support to manage work more effectively.",
      ],
    },
    related: {
      label: "Founders & Entrepreneurs",
      description:
        "Founders and entrepreneurs often carry client work, growth, follow-ups and admin at the same time. VAxAI helps create clearer support around how the business actually runs.",
      linkLabel: "View Founder & Entrepreneur support",
    },
  },
  {
    slug: "small-business",
    metaTitle: "Admin Support & Automation for Small Businesses UK",
    metaDescription:
      "VAxAI helps UK small businesses manage customer enquiries, bookings, invoices, documents, follow-ups and team coordination with practical virtual assistance, workflows and automation.",
    serviceType: "Admin support and workflow automation for small businesses",
    audienceName: "Small Businesses",
    title: "Admin support that fits how your business runs",
    intro:
      "Small businesses feel admin pressure quickly — enquiries to answer, bookings to manage, invoices to chase, documents to file and follow-ups that keep the operation moving. VAxAI learns your context, tools and workflows first, then recommends human support, clearer processes, and AI or automation only where they add real value.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "In a small business, work often arrives faster than the systems behind it. Customer messages, internal coordination and repetitive tasks can start to compete with the work that actually earns revenue.",
      ],
      bullets: [
        "Customer enquiries arriving across email, phone and social channels",
        "Bookings, appointments and scheduling handled manually",
        "Invoices, payments and document filing taking more time than expected",
        "Follow-ups on quotes, orders and supplier actions slipping through",
        "Internal processes living in people’s heads rather than shared systems",
        "Team coordination becoming harder as workload grows",
        "Repetitive admin repeating every week without a clearer way to handle it",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "For small businesses, admin pressure can quickly affect customer experience, cash flow and team coordination.",
        "When enquiries, bookings, invoices, documents and follow-ups are not handled consistently, the business can look less reliable than it really is, even when the product or service itself is strong. Small delays can become bigger issues: a missed enquiry, a late invoice, an unclear handover, a forgotten quote, or a customer waiting longer than they should.",
      ],

      bullets: [
        "Customer enquiries being missed or answered too slowly",
        "Bookings, invoices or supplier actions slipping through",
        "Avoidable delays affecting cash flow",
        "Team members wasting time searching for information",
        "Inconsistent customer experience",
        "Growth creating more admin pressure rather than more stability",
      ],
    },
    how: {
      heading: "How VAxAI support fits",
      paragraphs: [
        "We help small businesses create calmer, clearer ways of working — combining virtual assistance and practical process support with automation only where it genuinely reduces repetition.",
      ],
      bulletsLabel: "VAxAI can support you through:",
      bullets: [
        "Reviews of how enquiries, bookings, documents and tasks move through the business",
        "Virtual assistance for inbox management, follow-ups and day-to-day coordination",
        "Clearer ownership of customer information, files and internal actions",
        "Automation for repetitive organisation where appropriate and safe",
        "Implementation support so changes work for the whole team, not just one person",
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support in place, your business can feel more organised without becoming overcomplicated.",
      ],
      bulletsLabel: "You can gain:",
      bullets: [
        "Customer enquiries handled more quickly and consistently",
        "Fewer missed bookings, documents, invoices and follow-ups",
        "Clearer processes that make work easier to repeat, delegate or train",
        "Less time wasted searching for information or chasing updates",
        "More reliable day-to-day operations without adding unnecessary complexity",
        "A business that feels easier to manage as workload increases",
      ],
      closing:
        "The goal is to help the business run more smoothly behind the scenes, so admin does not keep interrupting delivery, customer care or revenue-generating work.",
    },
    pricingNote:
      "Pricing is tailored to your business complexity, team size, tools, systems and the level of ongoing assistance required.",
    related: {
      label: "Small Businesses",
      description:
        "Small businesses feel admin pressure quickly — enquiries, bookings, invoices, documents and follow-ups all need consistent attention.",
      linkLabel: "View Small Business support",
    },
  },
  {
    slug: "charities-non-profits",
    metaTitle: "Virtual Assistant Support for UK Charities & Non-Profits",
    metaDescription:
      "VAxAI helps UK charities and non-profits reduce admin pressure across reporting, volunteer coordination, funding admin, compliance, safeguarding records, inboxes and follow-ups.",
    serviceType: "Virtual assistance and admin support for charities",
    audienceName: "UK Charities & Non-Profits",
    title: "More capacity for the work that matters",
    intro:
      "UK charities and non-profits are often stretched — limited capacity, growing reporting demands, volunteer coordination, funding admin and the everyday communication that keeps services running. VAxAI takes time to understand your context, tools and workflows before shaping practical support around delivery, compliance and relationships.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Charity teams are frequently doing more with less. Admin does not just sit in one inbox — it spreads across service delivery, volunteers, funders, compliance and the follow-ups that keep people safe and supported.",
      ],
      bullets: [
        "Limited capacity across small teams and wider volunteer networks",
        "Reporting and funder administration adding pressure alongside delivery",
        "Volunteer coordination, rotas, onboarding and communication taking significant time",
        "Service delivery admin competing with front-line priorities",
        "Safeguarding records and information handling needing consistent care",
        "Inboxes and requests arriving through multiple channels",
        "Referrals, partner follow-ups and internal actions becoming hard to track",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "For charities, unresolved admin pressure can affect more than internal efficiency.",
        "It can reduce capacity for service delivery, weaken follow-up with beneficiaries, volunteers, funders and partners, and create risks around reporting, safeguarding records and information handling. When teams are already stretched, even small admin gaps can have a wider impact because the work is connected to trust, accountability and people’s experience of the service.",
      ],

      bullets: [
        "Delivery teams losing time to repeated manual admin",
        "Funder reporting becoming more stressful and time-consuming",
        "Volunteer coordination becoming inconsistent",
        "Referrals, partner actions or beneficiary follow-ups becoming harder to track",
        "Safeguarding or compliance records becoming harder to manage consistently",
        "Staff capacity being absorbed by coordination instead of relationships and delivery",
      ],
    },
    how: {
      heading: "How VAxAI support fits",
      paragraphs: [
        "We help charities put calm, practical support around routine administration — while keeping people responsible for the decisions that matter to beneficiaries, volunteers, funders and partners.",
      ],
      bulletsLabel: "VAxAI can support you through:",
      bullets: [
        "Workflow reviews across communication, records, reporting and coordination",
        "Virtual assistance for inboxes, scheduling, follow-ups and document organisation",
        "Clearer processes for information handling, safeguarding records and internal actions",
        "Automation for repetitive admin where it reduces manual burden safely",
        "Ongoing support that adapts as funding, staffing and service priorities change",
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support in place, charity teams can protect more capacity for delivery, relationships and the work that directly supports their mission.",
      ],
      bulletsLabel: "You can gain:",
      bullets: [
        "More staff and volunteer time directed towards service delivery",
        "Clearer tracking of referrals, requests, actions and follow-ups",
        "Less pressure around reporting, records and coordination",
        "More consistent communication with beneficiaries, partners, volunteers and funders",
        "Clearer information handling that supports safeguarding and accountability",
        "Practical systems that help the charity do more with the capacity it already has",
      ],
      closing:
        "The goal is not to add another layer of complexity. It is to make the work easier to manage, easier to track and easier to sustain.",
    },
    pricingNote:
      "Pricing is tailored to your organisation’s size, reporting needs, safeguarding requirements, tools, systems and the level of ongoing support required.",
    related: {
      label: "UK Charities & Non-Profits",
      description:
        "UK charities and non-profits are often stretched across delivery, reporting, volunteer coordination, funding admin and communication.",
      linkLabel: "View Charity & Non-Profit support",
    },
  },
  {
    slug: "neurodivergent-professionals",
    metaTitle: "Admin & Virtual Assistant Support for Neurodivergent Professionals UK",
    metaDescription:
      "VAxAI offers tailored UK support for neurodivergent professionals facing admin overwhelm, task switching, follow-ups, scheduling, consistency challenges and executive functioning pressure.",
    serviceType: "Tailored virtual assistance for neurodivergent professionals",
    audienceName: "Neurodivergent Professionals",
    title: "Support shaped around how you work best",
    intro:
      "Neurodivergent professionals often manage work in ways that standard productivity advice does not reflect. VAxAI takes time to understand your context, tools, preferences and working patterns before recommending the right mix of human support, better processes, and AI or automation only where it genuinely reduces friction.",
    heroHasAccessCta: true,
    understanding: {
      heading: "Built with lived and practical understanding",
      paragraphs: [
        "VAxAI was founded by a neurodivergent professional, so this support is shaped with lived experience as well as practical workflow expertise.",
        "Every person works differently. There is no single neurodivergent experience. But we understand that admin, communication, task switching, follow-through and system maintenance can place extra demands on capacity when the systems around someone do not reflect how they actually work.",
      ],
    },
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "The issue is not a lack of ability. Often, the pressure comes from work systems that rely too heavily on memory, constant switching, manual tracking or unclear processes.",
      ],
      bullets: [
        "Admin systems that work briefly but become hard to maintain",
        "Inbox build-up and communication spread across too many places",
        "Task switching making it harder to return to unfinished actions",
        "Reminders, follow-ups and deadlines depending too much on memory",
        "Planning tools that add more work instead of reducing friction",
        "Difficulty keeping visibility across priorities when everything feels equally urgent",
        "Energy being spent managing the system rather than doing the work itself",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "When support is delayed, the cost is often not the task itself. It is the extra energy spent managing systems that were not designed around how the person works best.",
        "Admin can build up, follow-ups can become harder to return to, communication can spread across too many places, and important work can feel heavier than it needs to because too much depends on memory, switching and self-tracking.",
      ],

      bullets: [
        "More energy spent managing admin instead of doing meaningful work",
        "Follow-ups, deadlines or messages becoming harder to track",
        "Systems working briefly but becoming difficult to maintain over time",
        "Increased cognitive load from too many tools, reminders or unclear processes",
        "Work feeling more reactive because priorities are not visible enough",
        "Avoidable pressure building around tasks that could be supported, simplified or externalised",
      ],
    },
    how: {
      heading: "How VAxAI support fits",
      paragraphs: [
        "We shape support around how you actually work, not around a generic productivity system.",
      ],
      bulletsLabel: "VAxAI can support you through:",
      bullets: [
        "Workflow reviews shaped around your tools, preferences and working patterns",
        "Virtual assistance for inboxes, scheduling, reminders, follow-ups and task tracking",
        "Clearer systems that reduce cognitive load rather than adding extra admin",
        "AI or automation where it supports consistency, prompts, organisation or repeat tasks",
        "Human support where judgement, communication and flexibility matter",
        "Support that can sit alongside Access to Work where you may be eligible",
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support in place, work can become easier to track, return to and sustain.",
      ],
      bulletsLabel: "You can gain:",
      bullets: [
        "Fewer tasks relying on memory alone",
        "Clearer visibility of what needs attention and what can wait",
        "More consistent follow-up without needing to manually hold every detail",
        "Systems that are easier to return to after interruption, transition or overwhelm",
        "Reduced cognitive load around planning, reminders and admin tracking",
        "Support that protects autonomy while making work easier to sustain",
        "Practical help that fits your working patterns rather than forcing a generic productivity system",
      ],
      closing:
        "The goal is not to change how you work. It is to build the right support around how work already happens for you.",
    },
    pricingNote:
      "Pricing is tailored to your context, tools, workload, support needs and the level of ongoing assistance required.",
    accessToWork: {
      heading: "Your VAxAI support could cost you nothing",
      paragraphs: [
        "As a neurodivergent professional Access to Work could help fund support such as virtual assistance, admin support, workflow tools, communication support or help using digital systems.",
        "We can help you understand what this may involve and how VAxAI support could fit around your work.",
      ],
    },
    related: {
      label: "Neurodivergent Professionals",
      description:
        "Neurodivergent professionals may need support that reflects their working patterns, communication load, task switching and the effort involved in maintaining admin systems over time.",
      linkLabel: "View Neurodivergent Professional support",
    },
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
      label: page.related.label,
      description: page.related.description,
      linkLabel: page.related.linkLabel,
    }));
}
