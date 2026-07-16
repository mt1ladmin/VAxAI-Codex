/** Shared VAxAI service positioning, used across forms, AI context, and assessments. */

export const VAXAI_CORE_OFFERS = [
  "Admin Review of workflows, systems and information",
  "Backlog recovery and information organisation",
  "AI readiness and practical upskilling",
  "AI and automation readiness groundwork (data quality, document organisation, process documentation)",
  "VTA-informed AI decision support",
  "AI guidance and policy development",
  "Ongoing operational administration and virtual assistance",
  "Monitoring and maintenance of systems, data and processes",
] as const;

export const VAXAI_PARTIAL_OFFERS = [
  "Lightweight process automation within existing tools",
  "Connecting or simplifying data flows between familiar systems",
  "Piloting AI-assisted drafting with human review",
  "Coordinating follow-up across teams and suppliers",
] as const;

export const PARTNER_OFFERS = [
  "Complex bespoke system build or replacement",
  "Enterprise integration or data platform work",
  "Specialist accessibility engineering beyond process design",
  "Highly regulated technical implementation requiring certified specialists",
] as const;

export const COMPLEXITY_LEVELS = ["Low", "Moderate", "High", "Very high"] as const;

export const ENGAGEMENT_BASIS_OPTIONS = [
  "ongoing",
  "project",
  "ad_hoc",
  "mixed",
  "unknown",
] as const;

export const CAPACITY_LEVELS = ["Limited", "Moderate", "Strong", "Unknown"] as const;

export const AI_USE_LEVELS = ["None", "Limited", "Moderate", "Advanced", "Unknown"] as const;

export const DATA_SENSITIVITY_LEVELS = ["Standard", "Elevated", "High", "Unknown"] as const;

export const BUILD_VS_IMPROVE = [
  "improve_existing",
  "new_build_possible",
  "mixed",
  "unclear",
] as const;

export const STUDIO_SERVICE_POSITIONING = `VAxAI is a UK-based, human-led operational administration support and AI readiness service. Brand line: "Reduce admin. Keep the human in the loop." Four connected service areas: backlog recovery, AI and automation readiness (organised information, clean data, documented processes), ongoing operational administration, and monitoring and maintenance. The journey is Prepare, then Support, then Maintain. Strong administrative foundations first, AI and automation second.

Everything starts with the free Admin Review: a structured review of the organisation's administrative operations to understand what is going on and recommend the right support. Further work is scoped properly and always tested on a small scale first, with costs agreed before any work begins. There are no published fixed prices; we quote after understanding scope, complexity, timeframe, the right person for the work, and how much hands-on support is needed. Ongoing support is typically a monthly retainer that can scale up or down. Instalment plans can be agreed for project work. Invite organisations to contact VAxAI for a quote rather than inventing rates.

Prefer improving what the client already has over new systems or complex AI integration. VAxAI does not build or sell AI. Bespoke builds only fit small orgs (roughly under ten people) with clear, proportionate needs; anything larger or more complex, including enterprise builds, goes to trusted external partners, not built in-house.

Primary audience: founders and entrepreneurs, SMEs, charities and non-profits, and public sector organisations, usually without a large internal operations or AI team. MT1L (home of the VTA Framework: Value, Trust, Alignment — never "VAT Framework") handles deeper AI-value strategy work; VAxAI applies the same standard.

Automation can still overwhelm some staff, including neurodivergent employees; flag accessible, human-backed options where relevant. Access to Work may cover support for eligible individuals.`;

export const PROSPECT_FINDER_FEATURE_LABEL = "Prospect Finder";