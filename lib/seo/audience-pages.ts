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

const foundersFullSetupIncludes = [
  "Thorough review of your current workflows, tools and automations",
  "Practical improvements to your existing tools and processes",
  "Targeted AI and automation only where they genuinely add value",
  "One-to-one upskilling on any AI tools you already use, or training on new ones if beneficial",
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
  pricingIntro: string;
  fullSetupIncludes: string[];
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
    title: "Support built around how you use AI and run your business",
    intro:
      "Founders and entrepreneurs are increasingly running their business with AI: drafting content, automating admin and generating ideas faster than ever. But speed creates its own pressure. AI-generated work still needs reviewing, tools and automations still need managing, and with fewer resources than bigger competitors, you are often doing all of it alone. VAxAI combines AI consultancy with hands-on virtual assistant support to help you decide what to automate, keep AI outputs and automations under control, and free up time for the work that actually grows your business.",
    heroHasAccessCta: true,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Running a business alone means everything eventually lands on you, and AI has changed what that looks like rather than removed it. Instead of writing every email or proposal from scratch, you are now the one reading, judging and rewriting whatever AI hands you before it is good enough to send.",
        "The outputs multiply faster than the decisions do. A single request can produce several drafts, a dozen ideas or three different approaches, and without someone else to sense-check them, working out which one is actually right for this client is still down to you.",
        "It is not only outputs that pile up. Every automation you set up to save time, a booking flow, an email sequence, a reporting tool, still needs someone to configure it properly, watch for when it breaks, and update it as your business changes. Larger competitors have whole teams to manage this. As a solo founder, that layer of complexity sits with you too, on top of the work AI was meant to free up.",
      ],
      bullets: [
        "Multiple AI drafts, ideas or options for the same task, with no quick way to know which one is genuinely the best fit",
        "Confident, polished AI outputs that still need a careful second read before you would trust them enough to send",
        "Automations and tools that need setting up, monitoring and fixing when they quietly stop working",
        "Hours spent reviewing AI-generated work and maintaining automations instead of doing client work or growth activity",
        "No one else to sense-check a decision, a draft or a client-facing message before it goes out under your name",
        "Trying to compete with better-resourced competitors while carrying all of this admin and oversight alone",
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
        "Whether AI is already producing your first or second drafts on most tasks and running a few automations, or you are still working out where it is worth the risk, the same two things determine whether it actually helps: deciding what is genuinely worth automating in the first place, and making sure the outputs and automations keep working once they are live.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts client replies, proposals and content, and pulls together ideas so you are never starting from nothing.",
        "Automation: Handles the repeat admin behind the scenes, quotes, reminders, bookings, once it has been set up properly and mapped to how you actually work.",
        "Virtual assistance: A second pair of eyes on AI outputs and decisions, and a person who keeps your automations running, catches when something breaks, and handles the admin that still needs a human judgement call.",
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
            "We start by understanding how you already use AI and automation: what you draft with it, what you have automated, what you still double-check every time, and what is quietly eating your evenings. From there we design and set up a workflow that keeps the speed without leaving you as the only person deciding whether an output is good enough, or fixing things when they break.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "Once it is running, a dedicated virtual assistant reviews AI drafts and outputs against your standards, keeps your automations working as your business changes, and follows through on the actions that come out of them, so ideas, drafts and admin do not just pile up waiting for you to find time.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI and automation stop being extra things you have to manage alone. Drafts get checked before they reach you, and automations get maintained before they quietly break, not after you have already lost time to it.",
        "You keep the speed AI and automation give you, but the judgement calls, the sense-checking, the maintenance and the follow-through no longer rest entirely on your evenings and weekends.",
      ],
      equation:
        "Constant AI review and automation upkeep + a second pair of eyes and clear judgement = more time to compete on the work only you can do.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Less time re-reading, editing and second-guessing AI drafts",
        "Automations that keep working without you having to notice when they break",
        "A trusted second opinion before client-facing work goes out under your name",
        "Clearer judgement on what is worth automating and what still needs your input",
        "More protected time for the client work and growth only you can do",
        "A fairer footing against better-resourced competitors, without needing their headcount",
      ],
    },
    pricing: {
      fullSetupPrice: "From £2,450 (fixed price)",
      ongoingSupportPrice: "£25 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Support built for solo founders and entrepreneurs, priced so a second pair of eyes and reliable automation upkeep do not compete with your growth budget.",
    fullSetupIncludes: foundersFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. As a solo founder, that means a second pair of eyes on AI-assisted work, someone keeping your automations running, and predictable, flexible hours, all without the cost or complexity of hiring.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get a trusted second opinion, fewer things quietly breaking in the background, and reliable, professional help that grows with your business, with the flexibility and peace of mind your work deserves.",
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
    title: "Support built around how your team uses AI and runs the business",
    intro:
      "Small businesses are increasingly using AI day to day: drafting replies, automating admin and speeding up routine work. But without one person responsible for it, AI and automation use across a small team can become inconsistent and hard to manage, and mistakes can reach customers before anyone catches them. VAxAI combines AI consultancy with hands-on virtual assistant support to help you decide what to automate, keep AI-assisted work accurate and consistent, and free up time for the work that earns revenue.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "AI can draft a reply to a customer, summarise a supplier email or put together a first version of a quote in seconds. The harder part is making sure what it produces actually sounds like your business, is accurate, and does not need checking every single time by whoever happens to be free.",
        "Without one person responsible for it, AI use in a small team tends to be inconsistent: one person checks everything twice, another sends outputs straight out, and nobody is quite sure where the line should be.",
        "It is not only customer messages either. As you add more AI tools and automations, quotes, invoicing, scheduling, reporting, they all need setting up properly and keeping an eye on. Without someone responsible for the whole picture, tools pile up faster than anyone has time to manage them, and it becomes unclear what is actually saving time and what is quietly creating more work.",
      ],
      bullets: [
        "Customer-facing replies or documents drafted by AI that need checking before they go out, but no clear person responsible for checking them",
        "Inconsistent AI use across the team, with no shared view of what is safe to automate and what still needs a human look",
        "A growing number of AI tools and automations across the business, with no one keeping track of what is actually working",
        "Time spent verifying AI-generated quotes, summaries or responses against what actually happened",
        "Automations that quietly stop working or fall out of date as the business changes",
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
        "Whether your team has already started using AI tools and automations informally or you are holding off until you are confident it will not create more problems than it solves, the same two things determine whether it actually helps: deciding what is worth automating consistently across the business, and making sure someone is responsible for keeping it accurate and up to date.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts responses to common enquiries, summarises customer messages and prepares first versions of quotes or updates.",
        "Automation: Routes enquiries, chases invoices and handles repeat weekly admin consistently, once it has been set up to match how your business actually works.",
        "Virtual assistance: A person who checks AI-generated, customer-facing work before it goes out, keeps automations running as things change, and knows when something needs a human decision instead of an automated one.",
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
            "We look at where AI and automation are already being used across your team, informally or otherwise, from customer replies to invoicing and reporting, and where the gaps in consistency and checking actually are. From there we set up clear, practical rules for what AI can handle, what needs a human check, and how customer and business information is kept safe.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "A dedicated virtual assistant then checks AI-generated, customer-facing work against your standards, keeps automations running and up to date as your business changes, and handles the exceptions that a system should not be making decisions about on its own.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI and automation stop being something individual team members manage their own way. Customer-facing work gets checked consistently, and automations get kept up to date, whoever set them up originally.",
        "You get the speed of AI-assisted work without it depending on one person remembering to double-check everything, or tools quietly falling out of date as the business grows.",
      ],
      equation:
        "Inconsistent AI use and unmanaged automations + clear rules and human checking = a business that runs reliably as it grows.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Consistent, checked customer communication regardless of who or what drafted it",
        "A clear, shared view of what AI can be trusted with and what still needs a person",
        "Automations that keep working reliably instead of quietly falling out of date",
        "Less time spent verifying AI outputs against what actually happened",
        "Reduced risk of sending something inaccurate, off-brand or inappropriate to a customer",
        "More confidence using AI and automation, because someone is responsible for checking it",
      ],
    },
    pricing: {
      fullSetupPrice: "From £5,250 (fixed price)",
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Support built for growing teams, priced so consistent AI checking and reliable automation upkeep do not add payroll complexity.",
    fullSetupIncludes: sharedFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For small businesses, that means someone accountable for checking AI-assisted work and keeping automations reliable, without the cost or complexity of a full-time hire.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get consistent, trustworthy AI-assisted work, automations that keep working as you grow, and reliable support that keeps operations steady.",
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
    title: "Support built around how your charity uses AI and delivers its mission",
    intro:
      "Charities are increasingly using AI to save time on reporting, case notes and admin. But without clear oversight, AI and automation use can create new risks around safeguarding, confidentiality and funder trust, on top of the admin it was meant to reduce. VAxAI combines AI consultancy with hands-on virtual assistant support to help you decide where AI genuinely helps, keep it aligned with your mission and safeguarding responsibilities, and protect capacity for delivery and relationships.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "AI can help draft a funding report, summarise case notes or pull together an update in minutes, work that used to take a member of staff far longer. But charities are also working with some of the most sensitive information there is: beneficiary details, safeguarding records, funder relationships built on trust, and a mission that a generic AI suggestion will not automatically understand.",
        "The result is often a governance gap. Staff may already be using AI day to day to save time, while trustees and leadership have little visibility into how it is being used, what data has gone into it, or whether anyone is checking the output against what your beneficiaries and funders actually need.",
        "It is not only drafting either. As referral tracking, volunteer coordination or reporting reminders get automated, someone still needs to set them up properly, keep them accurate, and notice when they stop reflecting how the charity actually works, on top of the admin capacity was supposed to free up.",
      ],
      bullets: [
        "AI-drafted reports, case notes or funder updates that need checking against safeguarding and confidentiality requirements before anyone sees them",
        "Little visibility for trustees or leadership into how AI is actually being used day to day",
        "AI suggestions that sound plausible but do not reflect what your beneficiaries, funders or front-line staff actually need",
        "Referral tracking, volunteer coordination or reporting automations that need setting up properly and keeping accurate as things change",
        "Staff capacity still absorbed by managing tools and systems instead of delivery and relationships",
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
        "Whether staff are already using AI and automation informally to save time on reporting and admin, or your charity is holding back until you are confident it will not create safeguarding or trust risks, the same two things determine whether it actually helps: deciding what is appropriate to automate at all, and making sure someone is responsible for checking it stays accurate, safe and aligned with your mission.",
      ],
      bulletsLabel: "Three types of support explained:",
      bullets: [
        "AI: Drafts reporting notes, summarises funder updates and organises information from meetings or emails.",
        "Automation: Tracks referrals, reminders and routine reporting steps, once it has been set up to reflect how your services and safeguarding responsibilities actually work.",
        "Virtual assistance: A person who checks AI-generated reports and communications for accuracy and appropriateness, keeps referral and volunteer systems accurate and up to date, and helps you stay confident and transparent with funders about how AI is used.",
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
            "We take time to understand your services, your beneficiaries and the safeguarding, funder and confidentiality requirements you work within, alongside how staff are already using AI and automation day to day. From there we set up clear, practical boundaries for what AI can support with, what information should never go into it, and where a person needs to stay in the loop.",
          ],
        },
        {
          title: "Ongoing Support",
          paragraphs: [
            "A dedicated virtual assistant then checks AI-generated reports, case notes and communications before they go out, keeps referral, volunteer and reporting systems accurate as things change, and helps trustees and funders stay confident that AI is being used appropriately and transparently.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right support, AI and automation are checked against your safeguarding, confidentiality and funder requirements as a matter of course, not something that depends on whoever is least stretched that day.",
        "Trustees and leadership gain visibility into how AI is actually being used, and referral, volunteer and reporting systems stay accurate as your charity changes, so capacity goes further without new risks quietly building up.",
      ],
      equation:
        "AI and automation speeding up admin + human checking against safeguarding and mission = protected capacity you can trust.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Reporting and case notes checked for accuracy and confidentiality before they are shared",
        "Clearer visibility for trustees into how AI is being used across the charity",
        "Referral, volunteer and reporting systems that stay accurate instead of quietly drifting out of date",
        "Confidence being open with funders and beneficiaries about where AI has helped",
        "Less risk of sensitive or safeguarding information ending up in the wrong tool",
        "More staff and volunteer time directed towards delivery and relationships",
      ],
    },
    pricing: {
      fullSetupPrice: "From £5,250 (fixed price)",
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Support built for charities with tight or variable income, priced so safeguarding-aware AI checking and reliable systems do not compete with delivery budgets.",
    fullSetupIncludes: sharedFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For charities with tight or variable income, that means someone accountable for checking AI-assisted work against safeguarding and funder expectations, and keeping your systems reliable, at a cost that protects your delivery capacity.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get AI used responsibly, systems that stay reliable, and dependable, professional support that protects your mission, your beneficiaries and the trust funders place in you.",
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
