/** Shared VAxAI service positioning, used across forms, AI context, and assessments. */

export const VAXAI_CORE_OFFERS = [
  "Existing-system and workflow review",
  "AI and automation opportunity assessment",
  "AI readiness and practical upskilling",
  "Team training and workshops",
  "VAT-informed AI strategy and decision support",
  "AI guidance and policy development",
  "Ongoing or ad hoc virtual assistance",
  "Support managing existing systems and processes",
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

export const STUDIO_SERVICE_POSITIONING = `VAxAI is an admin support service. AI, automation, and human virtual assistance are the tools used to reduce admin, not the specialism itself. The core model is an Admin Review: look at the organisation's admin in general and where it is coming from, then at the admin AI has added on top, to get a full picture, then recommend the right mix of AI, automation, and human support, virtual or in person.

Virtual assistance is part of the wider admin offer. AI may simplify individual tasks, while human support provides coordination, follow-up, judgement, oversight, and consistency, especially where AI outputs still need checking.

Automation does not remove administrative pressure for everyone. Neurodivergent employees may still find systems, notifications, and automated workflows overwhelming. Where relevant, note how accessible processes and flexible human support could help.

Do not default to recommending a completely new system or complex AI integration where none exists. Prioritise review, improvement, connection, support, and helping teams use what they already have.

A new or bespoke build is only a possible fit where the organisation is relatively small (roughly fewer than ten people), requirements are not highly complex, outcomes are clearly defined, risks are proportionate, and any need for a technical specialist is explicit. For larger or more complex environments, and for any complex or enterprise build, VAxAI does not build these in-house, it identifies trusted external partners and works with them on the client's behalf.

Primary audience: founders and entrepreneurs, small and medium-sized businesses (SMEs), and charities and non-profits of all sizes, typically organisations without a large internal operations or AI team. MT1L, home of the VAT Framework (Value, Alignment, Trust), is the separate arm for deeper AI-value strategy work; VAxAI applies the same VAT standard to its own recommendations.`;

export const PROSPECT_FINDER_FEATURE_LABEL = "Prospect Finder";