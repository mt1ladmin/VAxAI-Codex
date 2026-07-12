export type JourneyStage = {
  title: string;
  paragraphs: string[];
};

export type AudiencePricing = {
  fullSetupPrice: string;
  ongoingSupportPrice: string;
};

export const sharedFullSetupIncludes = [
  "Thorough review of your current workflows and systems",
  "Practical improvements to your existing tools and processes",
  "Targeted AI and automation only where they genuinely add value",
  "Upskilling you and your team on any AI tools you already use, or training on new ones if beneficial",
];

export const sharedVaSetupIncluded = {
  title: "VA Setup & Training (included in the package)",
  description:
    "We fully brief and train your virtual assistant, whether from our team or one we help you recruit, so they deeply understand your systems, workflows, and preferences.",
};

export const sharedOngoingSupportDescription =
  "Support is flexible. You only pay for hours used. Simpler setups need fewer hours.";

export type AudienceSection = {
  heading: string;
  paragraphs: string[];
  bulletsLabel?: string;
  bullets?: string[];
  journeyLabel?: string;
  journey?: JourneyStage[];
  equation?: string;
  closing?: string;
};

export const sharedPricingIntro = "We offer clear and fair pricing tailored to your needs.";

export const sharedAccessToWork = {
  heading: "Your VAxAI support could cost you nothing",
  paragraphs: [
    "If you are eligible, Access to Work may help cover support such as virtual assistance, admin support, workflow tools or support using digital systems.",
    "We can help you understand what this may involve and how VAxAI support could fit around your work.",
  ],
};

const sharedWorkWithUsBullets = [
  "Lower overall cost: You get skilled support without the full overhead of employment, as the VA manages their own taxes, insurance, and benefits.",
  "Pay only for what you need: AI and automation handle repetitive work, so human support is mainly for oversight, exceptions, and maintenance. Because your VA deeply understands your systems, you typically need even fewer hours over time.",
  "Full flexibility: Scale support up or down easily with no long-term commitment.",
];

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
  howWeHelp: AudienceSection;
  how: AudienceSection;
  changes: AudienceSection;
  pricing: AudiencePricing;
  workWithUs: AudienceSection;
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
      "Founders and entrepreneurs often carry too many priorities at once: client work, growth, scheduling, follow-ups and the admin that keeps everything moving. VAxAI takes time to understand your context, tools and workflows before recommending the right mix of human support, better processes, and AI or automation only where it genuinely helps.",
    heroHasAccessCta: true,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Running a business alone means everything eventually lands on you, and AI has changed what that looks like rather than removed it. Instead of writing every email or proposal from scratch, you are now the one reading, judging and rewriting whatever AI hands you before it is good enough to send.",
        "The outputs multiply faster than the decisions do. A single request can produce several drafts, a dozen ideas or three different approaches, and without someone else to sense-check them, working out which one is actually right for this client is still down to you.",
      ],
      bullets: [
        "Multiple AI drafts, ideas or options for the same task, with no quick way to know which one is genuinely the best fit",
        "Confident, polished AI outputs that still need a careful second read before you would trust them enough to send",
        "Hours spent reviewing and correcting AI-generated work instead of getting it right once",
        "No one else to sense-check a decision, a draft or a client-facing message before it goes out under your name",
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
    howWeHelp: {
      heading: "What could help",
      paragraphs: [
        "Whether AI is already producing most of your first drafts or you are still working out where it is worth the risk, the value is the same: it is fast at producing options, not at judging which one is right, and it will not flag when a confident-sounding answer is quietly wrong.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts client replies, proposals and content, and pulls together ideas so you are never starting from nothing.",
        "Automation: Keeps routine admin and follow-ups moving in the background, without you having to remember them.",
        "Virtual assistance: A second pair of eyes on AI outputs and decisions. Someone who checks drafts against your tone and this client’s context, asks the questions AI will not, and tells you honestly when the first version is not the right one.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Discovery, Strategy & Implementation",
          paragraphs: [
            "We start by understanding how you already use AI: what you draft with it, what you double-check every time, and what is quietly eating your evenings. From there we design a workflow that keeps the speed without leaving you as the only person deciding whether an output is good enough.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "Once it is running, a dedicated virtual assistant reviews AI drafts and outputs against your standards, flags anything that does not look right, and follows through on the actions that come out of them, so ideas and drafts do not just pile up waiting for you to find time to check them.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI stops being another thing you have to manage alone. Drafts get checked before they reach you, not after you have already sent something you would have wanted to change.",
        "You keep the speed AI gives you, but the judgement calls, the sense-checking and the follow-through no longer rest entirely on your evenings and weekends.",
      ],
      equation:
        "Constant AI output review + a second pair of eyes and clear judgement = faster decisions you can actually trust.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Less time re-reading, editing and second-guessing AI drafts",
        "A trusted second opinion before client-facing work goes out under your name",
        "Fewer decisions made just because an option was first, not because it was right",
        "Clearer judgement on what AI should handle and what still needs your input",
        "More protected time for the client work and growth only you can do",
        "A calmer way of working that does not depend on you catching every mistake yourself",
      ],
    },
    pricing: {
      fullSetupPrice: "From £2,450 (fixed price)",
      ongoingSupportPrice: "£25 per hour (pay only for what you need)",
    },
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. As a solo founder, that means a second pair of eyes on AI-assisted work and predictable, flexible hours, without the cost or complexity of hiring.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get a trusted second opinion and reliable, professional help that grows with your business, with the flexibility and peace of mind your work deserves.",
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
      "Small businesses feel admin pressure quickly: enquiries to answer, bookings to manage, invoices to chase, documents to file and follow-ups that keep the operation moving. VAxAI learns your context, tools and workflows first, then recommends human support, clearer processes, and AI or automation only where they add real value.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "AI can draft a reply to a customer, summarise a supplier email or put together a first version of a quote in seconds. The harder part is making sure what it produces actually sounds like your business, is accurate, and does not need checking every single time by whoever happens to be free.",
        "Without one person responsible for it, AI use in a small team tends to be inconsistent: one person checks everything twice, another sends outputs straight out, and nobody is quite sure where the line should be.",
      ],
      bullets: [
        "Customer-facing replies or documents drafted by AI that need checking before they go out, but no clear person responsible for checking them",
        "Inconsistent AI use across the team, with no shared view of what is safe to automate and what still needs a human look",
        "Time spent verifying AI-generated quotes, summaries or responses against what actually happened",
        "Uncertainty about what customer or business information is safe to put into AI tools",
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
    howWeHelp: {
      heading: "What could help",
      paragraphs: [
        "Whether your team has already started using AI tools informally or you are holding off until you are confident it will not create more problems than it solves, the risk is the same either way: outputs that sound right but are not checked against what is actually true for your business.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts responses to common enquiries, summarises customer messages and prepares first versions of quotes or updates.",
        "Automation: Routes enquiries, chases invoices and handles repeat weekly admin consistently, without relying on whoever remembers to do it.",
        "Virtual assistance: A person who checks AI-generated, customer-facing work before it goes out, keeps it consistent with your brand and the facts, and knows when something needs a human decision instead of an automated one.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Discovery, Strategy & Implementation",
          paragraphs: [
            "We look at where AI and automation are already being used across your team, informally or otherwise, and where the gaps in consistency and checking actually are. From there we set up clear, practical rules for what AI can handle, what needs a human check, and how customer and business information is kept safe.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "A dedicated virtual assistant then checks AI-generated, customer-facing work against your standards, keeps automations running as your business changes, and handles the exceptions that a system should not be making decisions about on its own.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI stops being something individual team members use their own way. Customer-facing work gets checked consistently, whoever produced the first draft.",
        "You get the speed of AI-assisted work without it depending on one person remembering to double-check everything, or nobody checking at all.",
      ],
      equation:
        "Inconsistent AI use across the team + clear rules and human checking = customer-facing work you can rely on.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Consistent, checked customer communication regardless of who or what drafted it",
        "A clear, shared view of what AI can be trusted with and what still needs a person",
        "Less time spent verifying AI outputs against what actually happened",
        "Reduced risk of sending something inaccurate, off-brand or inappropriate to a customer",
        "Automations that keep working reliably as your business and workload change",
        "More confidence using AI, because someone is responsible for checking it",
      ],
    },
    pricing: {
      fullSetupPrice: "From £5,250 (fixed price)",
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For small businesses, that means someone accountable for checking AI and automation, without the cost or complexity of a full-time hire.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get consistent, trustworthy AI-assisted work and reliable support that keeps operations steady as you grow.",
    },
    related: {
      label: "Small Businesses",
      description:
        "Small businesses feel admin pressure quickly: enquiries, bookings, invoices, documents and follow-ups all need consistent attention.",
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
      "UK charities and non-profits are often stretched: limited capacity, growing reporting demands, volunteer coordination, funding admin and the everyday communication that keeps services running. VAxAI takes time to understand your context, tools and workflows before shaping practical support around delivery, compliance and relationships.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "AI can help draft a funding report, summarise case notes or pull together an update in minutes, work that used to take a member of staff far longer. But charities are also working with some of the most sensitive information there is: beneficiary details, safeguarding records, funder relationships built on trust, and a mission that a generic AI suggestion will not automatically understand.",
        "The result is often a governance gap. Staff may already be using AI day to day to save time, while trustees and leadership have little visibility into how it is being used, what data has gone into it, or whether anyone is checking the output against what your beneficiaries and funders actually need.",
      ],
      bullets: [
        "AI-drafted reports, case notes or funder updates that need checking against safeguarding and confidentiality requirements before anyone sees them",
        "Little visibility for trustees or leadership into how AI is actually being used day to day",
        "AI suggestions that sound plausible but do not reflect what your beneficiaries, funders or front-line staff actually need",
        "Uncertainty about being open with funders and beneficiaries about where AI has been used",
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
    howWeHelp: {
      heading: "What could help",
      paragraphs: [
        "Whether staff are already using AI informally to save time on reporting and admin, or your charity is holding back until you are confident it will not create safeguarding or trust risks, the same care applies: AI can speed up the drafting, but it cannot take responsibility for accuracy, confidentiality or whether a recommendation is right for the people you support.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts reporting notes, summarises funder updates and organises information from meetings or emails.",
        "Automation: Tracks referrals, reminders and routine reporting steps so actions are less likely to slip when teams are stretched.",
        "Virtual assistance: A person who checks AI-generated reports and communications for accuracy and appropriateness, keeps sensitive information out of the wrong tools, and helps you stay confident and transparent with funders about how AI is used.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Discovery, Strategy & Implementation",
          paragraphs: [
            "We take time to understand your services, your beneficiaries and the safeguarding, funder and confidentiality requirements you work within, alongside how staff are already using AI day to day. From there we set up clear, practical boundaries for what AI can support with, what information should never go into it, and where a person needs to stay in the loop.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "A dedicated virtual assistant then checks AI-generated reports, case notes and communications before they go out, keeps referrals and follow-ups on track, and helps trustees and funders stay confident that AI is being used appropriately and transparently.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI-assisted work is checked against your safeguarding, confidentiality and funder requirements as a matter of course, not something that depends on whoever is least stretched that day.",
        "Trustees and leadership gain visibility into how AI is actually being used, so it supports your mission and your relationships of trust rather than quietly putting them at risk.",
      ],
      equation:
        "AI speeding up admin and reporting + human checking against safeguarding and mission = capacity you can trust, protected.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Reporting and case notes checked for accuracy and confidentiality before they are shared",
        "Clearer visibility for trustees into how AI is being used across the charity",
        "Confidence being open with funders and beneficiaries about where AI has helped",
        "Less risk of sensitive or safeguarding information ending up in the wrong tool",
        "More staff and volunteer time directed towards delivery and relationships",
        "Practical AI use that stays aligned with your mission, not generic suggestions that miss the context",
      ],
    },
    pricing: {
      fullSetupPrice: "From £5,250 (fixed price)",
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For charities with tight or variable income, that means someone accountable for checking AI-assisted work against safeguarding and funder expectations, at a cost that protects your delivery capacity.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get AI used responsibly alongside reliable, professional support that protects your mission, your beneficiaries and the trust funders place in you.",
    },
    related: {
      label: "UK Charities & Non-Profits",
      description:
        "UK charities and non-profits are often stretched across delivery, reporting, volunteer coordination, funding admin and communication.",
      linkLabel: "View Charity & Non-Profit support",
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
