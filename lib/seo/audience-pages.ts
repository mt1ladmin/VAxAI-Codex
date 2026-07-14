export type JourneyStage = {
  title: string;
  paragraphs: string[];
};

export type AudiencePricing = {
  ongoingSupportPrice: string;
  paymentPlanNote?: string;
};

export const sharedPricingBasis = {
  heading: "Why we don't publish fixed prices",
  paragraphs: [
    "Every organisation's admin is different, so a fixed price would either overcharge you or under-scope the work. Project pricing is based on the scope of the work, its complexity, the timeframe for delivery and how much hands-on admin support is needed alongside it.",
    "To keep estimates honest, we always test on a small scale first, then use what we learn to assess what the full project involves. The cost is agreed with you before any work begins, so there are no surprises.",
  ],
};

export const sharedFullSetupIncludes = [
  "A thorough review of your current workflows, systems and information",
  "Backlog clearing and organisation of documents, records and data",
  "Practical improvements to your existing tools and processes",
  "AI and automation readiness, with targeted tools only where they genuinely add value",
  "Upskilling your team on any AI tools you already use, or training on new ones if beneficial",
];

const foundersFullSetupIncludes = [
  "A thorough review of your workflows, tools, information and automations",
  "Backlog clearing and organisation of your documents, records and data",
  "Practical improvements to your existing tools and processes",
  "AI and automation readiness, with targeted tools only where they genuinely add value",
  "One-to-one upskilling on any AI tools you already use, or training on new ones if beneficial",
];

const publicSectorFullSetupIncludes = [
  "A thorough review of your workflows, records and information management",
  "Backlog clearing and organisation of records, correspondence and data",
  "Practical improvements to your existing tools and processes",
  "AI and automation readiness, mapped to your governance and information-handling requirements",
  "Upskilling your team on any tools that are introduced or already in use",
];

export const sharedVaSetupIncluded = {
  title: "VA Setup & Training (included in the package)",
  description:
    "We fully brief and train your virtual assistant, whether from our team or one we help you recruit, so they deeply understand your systems, workflows, and preferences.",
};

export const sharedOngoingSupportDescription =
  "Day-to-day admin support as and when you need it, available as monthly or quarterly arrangements. Support is flexible and you only pay for hours used. Simpler setups need fewer hours.";

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
    "Our Admin Review can also help individuals eligible for Access to Work, for example neurodivergent professionals who find admin particularly difficult. The review looks at where your admin is coming from and what it actually involves day to day. You would then explain how it affects you, and whether it is tied to your disability or health condition and how, so it is clear where the support needs to sit. For individuals this is a lighter-touch version of the review, so get in touch to discuss what this could look like for you.",
    "We are not medical professionals, and this is not a diagnosis of any kind. We simply help you understand the reality of your admin, not diagnose or determine the disability link ourselves.",
  ],
};

const sharedWorkWithUsBullets = [
  "Lower overall cost: You get skilled, dedicated support without the overhead of employment, and without pulling your own people away from the work only they can do.",
  "Pay only for what you need: Once the groundwork is done and the right tasks are automated, human support is mainly for oversight, exceptions and upkeep, so hours typically reduce over time.",
  "Full flexibility: Scale support up or down, monthly or quarterly, with no long-term commitment, and costs agreed up front so there are no surprises.",
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
    metaTitle: "Admin Support & AI Readiness for Founders UK",
    metaDescription:
      "VAxAI helps UK founders and entrepreneurs clear admin backlogs, organise information, prepare for AI and automation, and keep the everyday admin of running a business moving with reliable human support.",
    serviceType: "Admin support and AI readiness for founders",
    audienceName: "Founders & Entrepreneurs",
    title: "Reduce the admin, so you can focus on growth",
    intro:
      "When you run a business alone, every unfiled document, unanswered email and half-finished system eventually lands back on you. AI can help, but only if the information and processes behind it are in order, and keeping them in order is itself a job. VAxAI starts with a free Admin Health Check to see where the pressure is building. From there we clear the backlog, organise your information, prepare the groundwork AI and automation need to actually work, and provide reliable human support, virtual or in person for a pitch, meeting or event, for the everyday admin and judgement calls you would rather keep human.",
    heroHasAccessCta: true,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Running a business alone means the admin never really stops. Files pile up in folders only you understand, the inbox fills faster than you can clear it, and the invoicing, scheduling and record-keeping that keep the business running always compete with the client work that actually pays for it.",
        "AI looks like the way out, and it can genuinely help. But point an AI assistant at a shared drive full of duplicates, outdated versions and files it should never touch, and you get confident answers built on the wrong information. The groundwork has to come first, and as a solo founder there is no one else to do it.",
        "The same is true of automation. Every booking flow, email sequence or reporting tool you set up to save time still needs configuring properly, watching for when it breaks, and updating as your business changes. Larger competitors have teams for this. For you, it is one more layer on top of everything else.",
        "And underneath it all is the admin that was never about AI in the first place: chasing payments, replying to routine enquiries, keeping records straight. That workload existed before AI and it does not disappear once AI arrives. It just sits alongside the new work of reviewing outputs and maintaining tools.",
      ],
      bullets: [
        "A backlog of filing, invoicing, follow-ups or record-keeping that never quite gets cleared",
        "Documents and information scattered across drives, inboxes and tools, hard to find when you need them",
        "AI tools that produce confident but unreliable results because the information behind them is disorganised",
        "Automations that need setting up, monitoring and fixing when they quietly stop working",
        "Processes that exist only in your head, which makes delegating anything feel impossible",
        "No one to sense-check a decision, a draft or a client-facing message before it goes out under your name",
        "Evenings and weekends absorbed by admin instead of the growth work only you can do",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "When the groundwork keeps being postponed, the business becomes harder to grow without increasing pressure on the person at the centre of it.",
        "Leads go cold, follow-ups get missed and valuable work is delayed because day-to-day admin keeps taking priority. The longer it runs, the harder the backlog is to clear, and the further away AI and automation get from being genuinely useful.",
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
        "Whether you are already using AI day to day or still deciding whether it is worth the risk, the same things determine whether your admin gets lighter: clearing what has built up, organising the information and processes your business runs on, and having reliable human support for the work that should stay human. That is exactly how our support is structured.",
      ],
      bulletsLabel: "Four kinds of support explained:",
      bullets: [
        "Backlog recovery: We clear the filing, records, invoicing and follow-ups that have built up, so you are working from a clean slate instead of a growing pile.",
        "AI & automation readiness: We organise your documents, data and processes so the tools you choose have accurate information to work from. We don't build or sell the AI itself, so our only interest is your readiness.",
        "Ongoing admin support: A dedicated assistant handles the inbox, scheduling, invoicing and client admin day to day, and gives you a second pair of eyes on AI outputs before they go out under your name, virtually or in person for a pitch, meeting or event.",
        "Maintain & improve: Regular admin health checks, data hygiene and process reviews stop the backlog rebuilding and catch problems while they are still small.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Free Admin Health Check",
          paragraphs: [
            "A short conversation and review, with no obligation. We look at where administrative pressure is building in your business, where your systems need strengthening and what support would make the biggest difference, then tell you honestly what would help, and what wouldn't.",
          ],
        },
        {
          title: "Admin Review & small-scale test",
          paragraphs: [
            "If you decide to go further, we carry out a full Admin Review: your admin in general, where it is really coming from, and what AI and automation have added on top. We always test on a small scale first, then use what we learn to assess the full project accurately, and the cost is agreed with you before any work begins. For complex builds we identify trusted external partners and work with them on your behalf rather than building these ourselves.",
          ],
        },
        {
          title: "Prepare & support",
          paragraphs: [
            "We do the groundwork: clearing the backlog, organising documents and data, documenting processes and preparing your information for any AI or automation you choose to adopt. Alongside it, a dedicated virtual assistant takes on the everyday admin and the judgement calls you would rather keep human.",
          ],
        },
        {
          title: "Maintain & improve",
          paragraphs: [
            "Admin does not stay fixed on its own. Regular health checks, data hygiene and process reviews keep your systems in shape as your business grows, so improvements last instead of quietly slipping.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right groundwork and support, admin stops being the thing you do instead of growth. Information is organised and findable, the backlog is cleared and stays cleared, and any AI or automation you use is working from accurate information instead of guesswork.",
        "You keep the speed technology gives you, but the sense-checking, the maintenance and the everyday admin no longer rest entirely on your evenings and weekends.",
      ],
      equation:
        "Cleared backlog + organised information + a second pair of eyes = more time to compete on the work only you can do.",
      bulletsLabel: "You can gain:",
      bullets: [
        "A backlog cleared, and a system that stops it rebuilding",
        "Documents and data organised so you, and any AI tool you use, can rely on them",
        "Automations that keep working without you having to notice when they break",
        "A trusted second opinion before client-facing work goes out under your name",
        "Processes documented so you can finally delegate with confidence",
        "Reliable support for the everyday admin you would rather keep human than hand to AI",
        "More protected time for the client work and growth only you can do",
      ],
    },
    pricing: {
      ongoingSupportPrice: "£25 per hour (pay only for what you need)",
      paymentPlanNote:
        "Prefer to spread the cost? For project work we can also agree flexible payment plans, for example paying in up to three instalments.",
    },
    pricingIntro:
      "Support built for solo founders and entrepreneurs, priced around your actual situation rather than a standard package, so the groundwork and support your business needs do not compete with your growth budget.",
    fullSetupIncludes: foundersFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. As a solo founder, that means the groundwork actually getting done, a second pair of eyes on AI-assisted work, reliable help with the everyday admin and judgement calls you would rather keep human, and flexible hours, all without the cost or complexity of hiring.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: The groundwork gets done, fewer things quietly break in the background, and you get reliable, professional help that grows with your business.",
    },
    related: {
      label: "Founders & Entrepreneurs",
      description:
        "Founders and entrepreneurs often carry client work, growth and the whole admin backlog at the same time. VAxAI clears the backlog and builds support around how the business actually runs.",
      linkLabel: "View Founder & Entrepreneur support",
    },
  },
  {
    slug: "small-business",
    metaTitle: "Admin Support, Backlog Recovery & AI Readiness for SMEs UK",
    metaDescription:
      "VAxAI helps UK small and medium-sized businesses (SMEs) clear admin backlogs, organise documents and data, prepare for AI and automation, and keep day-to-day admin moving with reliable human support.",
    serviceType: "Admin support, backlog recovery and AI readiness for SMEs",
    audienceName: "SMEs",
    title: "Grow without administrative chaos holding you back",
    intro:
      "As a business grows, its admin grows faster: more systems, more documents, more processes that live in someone's head. AI and automation promise relief, but they rely on the organised information and clear workflows most growing teams have never had time to build. VAxAI starts with a free Admin Health Check to see where the pressure is building. From there we clear backlogs, organise your information, prepare the groundwork technology needs to work, and provide reliable human support, remote or on-site when a client visit, delivery or handover needs someone there, so your team can stay on the work only they can do.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Most SMEs do not have an admin problem because people are not working hard enough. Demand grows, resources stay limited, and routine work keeps losing to urgent priorities, until documents are scattered across systems, data no longer matches reality and processes live in whoever has been there longest.",
        "That is exactly the environment where AI and automation disappoint. Point them at disorganised data and unclear workflows and they produce poor outputs, new problems and more correction work, not time saved. The technology is rarely the issue. The foundations are.",
        "Even where tools are already in use, someone has to own the whole picture: which automations are actually saving time, which have quietly fallen out of date, and whether AI-assisted work going out to customers is being checked consistently rather than by whoever happens to be free.",
        "And none of it replaces the admin your team was already carrying: scheduling, supplier queries, invoicing, filing, keeping records up to date. That work does not go away when technology arrives. Without dedicated capacity behind it, it just gets heavier.",
      ],
      bullets: [
        "Documents scattered across shared drives, inboxes and systems, with no one sure which version is current",
        "Customer, supplier or project data that no longer matches reality",
        "Processes that live in someone's head and leave with them",
        "Backlogs of filing, reporting or record-keeping that grow faster than the team can clear them",
        "AI tools and automations adopted piecemeal, with no shared view of what is actually working",
        "Customer-facing work drafted by AI that needs checking, with no clear owner for checking it",
        "Skilled people stuck on routine admin instead of the work they were hired for",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "For SMEs, admin pressure quickly reaches customers, cash flow and the team itself.",
        "When enquiries, bookings, invoices, documents and follow-ups are not handled consistently, the business looks less reliable than it really is, even when the product or service is strong. And the longer the groundwork is postponed, the more expensive it becomes, because every new tool is layered on top of information that cannot support it.",
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
        "Whether your team is already using AI informally or holding off until you are confident it will not create more problems than it solves, the same things determine whether it helps: clearing what has built up, organising the information and processes the business runs on, and having reliable human capacity for the work that should stay human. That is exactly how our support is structured.",
      ],
      bulletsLabel: "Four kinds of support explained:",
      bullets: [
        "Backlog recovery: We review, clean and organise the documents, records and data that have built up, and process outstanding reporting and compliance work, so your team stops paying interest on old admin.",
        "AI & automation readiness: We organise information, separate what is confidential from what is shareable, standardise data and map the processes worth automating, so the tools you choose behave predictably. We don't build or sell the AI itself.",
        "Ongoing admin support: Reliable capacity for scheduling, inboxes, reporting, document management and the exceptions automation should not handle alone, with customer-facing AI outputs checked consistently before they go out.",
        "Maintain & improve: Regular admin health checks, data hygiene and process reviews stop the backlog rebuilding as the business grows and changes.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Free Admin Health Check",
          paragraphs: [
            "A short conversation and review, with no obligation. We look at where administrative pressure is building across your team, where your systems need strengthening and what support would make the biggest difference, then tell you honestly what would help, and what wouldn't.",
          ],
        },
        {
          title: "Admin Review & small-scale test",
          paragraphs: [
            "If you decide to go further, we carry out a full Admin Review: your team's admin in general, where it is really coming from, and what AI and automation have added on top, informally or otherwise. We always test on a small scale first, then use what we learn to assess the full project accurately, and the cost is agreed with you before any work begins. For complex builds we identify trusted external partners and work with them on your behalf rather than building these ourselves.",
          ],
        },
        {
          title: "Prepare & support",
          paragraphs: [
            "We do the groundwork: clearing backlogs, organising documents and data, standardising information and documenting the processes worth automating. Alongside it, a dedicated virtual assistant keeps the everyday admin moving and checks customer-facing AI outputs against your standards.",
          ],
        },
        {
          title: "Maintain & improve",
          paragraphs: [
            "Systems drift as businesses grow. Regular health checks, data hygiene and process reviews keep information accurate, automations current and the backlog from quietly rebuilding.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right groundwork and support, the business stops depending on whoever happens to be free. Information is organised and trustworthy, customer-facing work is checked consistently, and automations stay accurate as things change.",
        "Growth stops meaning more chaos, because the systems that run the business keep pace with the business itself.",
      ],
      equation:
        "Organised information + clear processes + dedicated human capacity = a business that runs reliably as it grows.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Documents and data organised, current and findable across the team",
        "A cleared backlog, and processes documented so it does not rebuild",
        "A clear, shared view of what AI and automation can be trusted with",
        "Customer-facing work checked consistently, regardless of who or what drafted it",
        "Automations that keep working instead of quietly falling out of date",
        "Faster onboarding, because how things work is written down",
        "Skilled people back on the work they were actually hired to do",
      ],
    },
    pricing: {
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Support built for SMEs and growing teams, priced around your actual situation rather than a standard package, so the groundwork and reliable support your business needs do not add payroll complexity.",
    fullSetupIncludes: sharedFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For SMEs, that means the groundwork actually getting done, someone accountable for keeping information and automations reliable, and dependable cover for the everyday admin your team would rather keep human, without the cost or complexity of a full-time hire.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: You get organised information, systems that keep working as you grow, and reliable support that keeps operations steady.",
    },
    related: {
      label: "SMEs",
      description:
        "SMEs feel admin pressure quickly: enquiries, bookings, invoices, documents and follow-ups all need consistent attention.",
      linkLabel: "View SME support",
    },
  },
  {
    slug: "charities-non-profits",
    metaTitle: "Admin Support, Backlog Recovery & AI Readiness for UK Charities",
    metaDescription:
      "VAxAI helps UK charities and non-profits clear admin backlogs, organise records safely, prepare for AI and automation, and keep funder, volunteer and case admin moving with reliable human support.",
    serviceType: "Admin support, backlog recovery and AI readiness for charities",
    audienceName: "UK Charities & Non-Profits",
    title: "Less administrative pressure, more capacity for your mission",
    intro:
      "Charities are asked to do more with less every year, and admin absorbs capacity the mission needs: funder reporting, volunteer coordination, case records, compliance paperwork. AI can help, but charities also hold some of the most sensitive information there is, so the groundwork and oversight matter more, not less. VAxAI starts with a free Admin Health Check to see where the pressure is building. From there we clear backlogs, organise information safely, prepare the groundwork AI and automation need, and provide reliable human support, virtual or in person for an event, service day or site visit, so more of your capacity goes to delivery.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Charity admin has always stretched thin teams: funder reporting deadlines, volunteer rotas, case file upkeep, compliance paperwork. When capacity is short, routine work builds into backlogs, records drift out of date, and the people delivering services absorb the difference.",
        "AI looks like a way to claw capacity back, and used well it can be. But charities work with beneficiary details, safeguarding records and funder relationships built on trust. An AI assistant drawing on a shared drive full of outdated policies, duplicates and files it should never access is not a time-saver. It is a risk.",
        "There is often a governance gap too. Staff may already be using AI day to day to save time, while trustees and leadership have little visibility into how it is being used, what information has gone into it, or whether anyone is checking outputs before they reach funders or beneficiaries.",
        "None of this replaces the underlying admin. Reporting, rotas and records still need doing whether or not AI is in the picture, and without dedicated capacity, the preparation that would make technology safe and useful keeps being postponed.",
      ],
      bullets: [
        "Backlogs of reporting, case file upkeep or compliance paperwork that never quite get cleared",
        "Documents and records scattered across drives and inboxes, with outdated versions still in circulation",
        "Sensitive information stored alongside everyday files, with no clear separation of what AI tools should be able to touch",
        "AI-drafted reports or case notes that need checking against safeguarding and confidentiality requirements",
        "Little visibility for trustees or leadership into how AI is actually being used day to day",
        "Volunteer coordination and referral tracking that depend on one stretched person",
        "Staff and volunteer time absorbed by admin instead of delivery and relationships",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "For charities, unresolved admin pressure can affect more than internal efficiency.",
        "It can reduce capacity for service delivery, weaken follow-up with beneficiaries, volunteers, funders and partners, and create risks around reporting, safeguarding records and information handling. When teams are already stretched, even small admin gaps can have a wider impact because the work is connected to trust, accountability and people's experience of the service.",
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
        "Whether staff are already using AI informally to save time or your charity is holding back until it is confident there is no safeguarding or trust risk, the same things determine whether it helps: clearing what has built up, organising information safely, and having reliable human capacity for the work that should stay human. That is exactly how our support is structured.",
      ],
      bulletsLabel: "Four kinds of support explained:",
      bullets: [
        "Backlog recovery: We review, clean and organise records, process outstanding reporting and compliance work, and bring case files and volunteer records back up to date.",
        "AI & automation readiness: We organise information, separate confidential and safeguarding-sensitive material from what tools may access, and map the processes worth automating, always against your safeguarding and funder requirements. We don't build or sell the AI itself.",
        "Ongoing admin support: Reliable capacity for funder reporting, volunteer coordination, inboxes and case admin, with AI-assisted work checked for accuracy and appropriateness before anyone outside the charity sees it.",
        "Maintain & improve: Regular admin health checks, data hygiene and process reviews keep records accurate and give trustees ongoing visibility, so new risks do not quietly build up.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Free Admin Health Check",
          paragraphs: [
            "A short conversation and review, with no obligation. We look at where administrative pressure is building across your charity, where your systems need strengthening and what support would make the biggest difference, then tell you honestly what would help, and what wouldn't.",
          ],
        },
        {
          title: "Admin Review & small-scale test",
          paragraphs: [
            "If you decide to go further, we take time to understand your services and beneficiaries, then carry out a full Admin Review: the funder, volunteer and case admin that comes with running a charity, what AI and automation have added on top, and your safeguarding, funder and confidentiality requirements. We always test on a small scale first, then use what we learn to assess the full project accurately, and the cost is agreed with you before any work begins. For complex builds we identify trusted external partners and work with them on your behalf.",
          ],
        },
        {
          title: "Prepare & support",
          paragraphs: [
            "We do the groundwork: clearing backlogs, organising records safely, separating sensitive material and documenting processes. Alongside it, a dedicated virtual assistant keeps funder, volunteer and case admin moving and checks AI-assisted work before it goes out, so trustees and funders stay confident that AI is being used appropriately and transparently.",
          ],
        },
        {
          title: "Maintain & improve",
          paragraphs: [
            "Charities change: new funders, new volunteers, new requirements. Regular health checks, data hygiene and process reviews keep records accurate and systems reliable, so improvements last beyond the project that created them.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With the right groundwork and support, AI and automation are checked against your safeguarding, confidentiality and funder requirements as a matter of course, and the everyday funder, volunteer and case admin stops depending on whoever is least stretched that day.",
        "Trustees and leadership can see how AI is actually being used, records stay accurate as the charity changes, and more of every pound and hour goes to the mission.",
      ],
      equation:
        "Organised, safe information + human checking against safeguarding and mission = protected capacity you can trust.",
      bulletsLabel: "You can gain:",
      bullets: [
        "A cleared backlog of reporting, records and compliance work",
        "Information organised safely, with confidential material clearly separated",
        "Reporting and case notes checked for accuracy and confidentiality before they are shared",
        "Clearer visibility for trustees into how AI is being used across the charity",
        "Volunteer, referral and reporting systems that stay accurate instead of quietly drifting",
        "Confidence being open with funders and beneficiaries about where AI has helped",
        "More staff and volunteer time directed towards delivery and relationships",
      ],
    },
    pricing: {
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Support built for charities with tight or variable income, priced around your actual situation rather than a standard package, so groundwork and safeguarding-aware support do not compete with delivery budgets.",
    fullSetupIncludes: sharedFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For charities with tight or variable income, that means the groundwork actually getting done, someone accountable for checking AI-assisted work against safeguarding and funder expectations, and dependable cover for the everyday admin you would rather keep human, at a cost that protects your delivery capacity.",
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
  {
    slug: "public-sector",
    metaTitle: "Backlog Recovery & AI Readiness for the UK Public Sector",
    metaDescription:
      "VAxAI helps UK public sector organisations reduce administrative backlogs, strengthen information management and prepare for AI, automation and smarter ways of working, with experienced people in the loop.",
    serviceType: "Backlog recovery, information management and AI readiness for public sector organisations",
    audienceName: "Public Sector",
    title: "Reduced backlogs and stronger foundations for smarter ways of working",
    intro:
      "Public sector teams are expected to modernise while demand rises and resources tighten. Unprocessed records, correspondence volumes and databases that no longer match reality slow services down, and they are also exactly what stops AI and automation from delivering. VAxAI starts with a free Admin Health Check to see where the pressure is building. From there we clear backlogs, strengthen information management and prepare processes for automation, working within your governance and information-handling requirements, with experienced people in the loop throughout.",
    heroHasAccessCta: false,
    pressures: {
      heading: "Does this sound familiar?",
      paragraphs: [
        "Backlogs in public sector teams rarely happen because people are not working hard enough. Demand grows, resources are limited, and routine work loses to urgent priorities, until unprocessed records, correspondence and outdated databases start slowing everything else down.",
        "Modernisation is the standing instruction, and AI and automation are usually part of the plan. But records that are inconsistent between teams, workflows that vary by office and data that no longer matches reality are precisely the conditions in which automation fails, produces poor outputs and creates correction work instead of saving time.",
        "The preparation that would fix this, reviewing records, standardising data, documenting processes, is real work that someone has to do. Teams already stretched covering business as usual rarely have the capacity, so transformation programmes inherit the problem and the backlog keeps growing.",
        "And public sector admin carries obligations most organisations do not: information requests, retention schedules, audit trails, statutory reporting. Getting information management right is not just groundwork for technology. It is part of the job.",
      ],
      bullets: [
        "Backlogs of unprocessed records, correspondence or casework building faster than teams can clear them",
        "Records and data that are inconsistent between teams, systems or offices",
        "Databases and registers that no longer match reality",
        "Processes that vary by team and live in individual experience rather than documentation",
        "Reporting that takes longer every quarter as information gets harder to pull together",
        "Automation or AI ambitions blocked because the underlying information is not ready",
        "Skilled staff absorbed by routine administration instead of service delivery",
      ],
    },
    delayed: {
      heading: "What happens when support is delayed",
      paragraphs: [
        "When backlogs and information problems go unaddressed, the effects reach beyond the team: slower services for the public, rising pressure on staff, and growing risk around records, reporting and compliance.",
        "Digital and AI programmes launched on top of disorganised information tend to cost more, deliver less and erode confidence in future change, which makes the next attempt harder still.",
      ],
      bullets: [
        "Service delays that affect the public directly",
        "Rising error and compliance risk as records drift out of date",
        "Reporting and information requests absorbing more staff time",
        "Transformation programmes stalling on data quality",
        "Experienced staff leaving, taking undocumented processes with them",
        "Budgets spent on technology the foundations cannot support",
      ],
    },
    howWeHelp: {
      heading: "What could help",
      paragraphs: [
        "Whether your organisation is preparing a transformation programme or simply trying to get back in control of the day-to-day, the same things determine progress: clearing what has built up, strengthening how information is managed, and having dedicated capacity so preparation does not compete with business as usual. That is exactly how our support is structured.",
      ],
      bulletsLabel: "Four kinds of support explained:",
      bullets: [
        "Backlog recovery: We review, clean and organise records and correspondence, process outstanding work, and reduce the backlog while documenting workflows so it does not rebuild.",
        "AI & automation readiness: We standardise data, organise information with appropriate access in mind and map the processes worth automating, so the tools your organisation chooses behave predictably. We don't build or sell the AI itself.",
        "Ongoing admin support: Reliable additional capacity for reporting, correspondence, record-keeping and routine administration, working within your procedures and information-handling requirements.",
        "Maintain & improve: Regular admin health checks, data hygiene and process reviews keep records accurate and processes current as demands change.",
      ],
    },
    how: {
      heading: "",
      paragraphs: [],
      journeyLabel: "Our Process",
      journey: [
        {
          title: "Free Admin Health Check",
          paragraphs: [
            "A short conversation and review, with no obligation. We look at where administrative pressure is building, where information management needs strengthening and what support would make the biggest difference, then tell you honestly what would help, and what wouldn't.",
          ],
        },
        {
          title: "Admin Review & small-scale test",
          paragraphs: [
            "If you decide to go further, we carry out a full Admin Review of the records, correspondence and processes involved, working within your governance, procurement and information-handling requirements. We always test on a small scale first, then use what we learn to assess the full engagement accurately, and the cost is agreed before any work begins. For complex builds we identify trusted external partners and work with them on your behalf.",
          ],
        },
        {
          title: "Prepare & support",
          paragraphs: [
            "We do the groundwork: clearing backlogs, organising and standardising records, and documenting workflows, delivered as dedicated capacity alongside business as usual rather than instead of it, with ongoing support for reporting, correspondence and routine administration where it helps.",
          ],
        },
        {
          title: "Maintain & improve",
          paragraphs: [
            "Demands on public services do not stand still. Regular health checks, data hygiene and process reviews keep records accurate and processes current, so the backlog does not quietly return once the project ends.",
          ],
        },
      ],
    },
    changes: {
      heading: "What changes in practice",
      paragraphs: [
        "With dedicated capacity behind the groundwork, backlogs come down without pulling staff away from services, information becomes consistent and reliable, and automation is introduced onto foundations that can actually support it.",
        "Teams move from constantly catching up to staying in control, and modernisation plans stop stalling on the state of the data.",
      ],
      equation:
        "Cleared backlogs + consistent, reliable information + documented processes = services ready for smarter ways of working.",
      bulletsLabel: "You can gain:",
      bullets: [
        "Backlogs reduced without adding pressure to existing staff",
        "Records and data made consistent, current and reliable",
        "Processes documented and standardised across teams",
        "Reporting and information requests answered faster, from information you can trust",
        "AI and automation introduced where the foundations genuinely support them",
        "Reduced risk around records, retention and compliance",
        "Skilled staff focused on service delivery rather than routine administration",
      ],
    },
    pricing: {
      ongoingSupportPrice: "£35 per hour (pay only for what you need)",
    },
    pricingIntro:
      "Public sector engagements vary widely in scale and requirements, so support is scoped and priced per organisation, and we are happy to work within your procurement processes.",
    fullSetupIncludes: publicSectorFullSetupIncludes,
    workWithUs: {
      heading: "The Benefits of Our Approach",
      paragraphs: [
        "Our pricing and support model is built to give you high-quality, sustainable help without stretching your budget. For public sector teams, that means dedicated capacity for the groundwork transformation depends on, delivered alongside business as usual rather than instead of it, by people working to consistent standards and with compliance in mind.",
      ],
      bullets: sharedWorkWithUsBullets,
      closing:
        "In short: Backlogs come down, information becomes something you can rely on, and preparation is done properly, so technology investment delivers what it promised.",
    },
    related: {
      label: "Public Sector",
      description:
        "Public sector teams face rising demand, limited resources and modernisation pressure at the same time. VAxAI provides the capacity to clear backlogs and prepare the foundations.",
      linkLabel: "View Public Sector support",
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
