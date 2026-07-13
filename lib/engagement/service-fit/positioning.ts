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

export const STUDIO_SERVICE_POSITIONING = `VAxAI is an admin support service; admin is the specialism, AI, automation, and human virtual assistance are just the tools. Start from an Admin Review (general admin plus what AI has added), then recommend the right mix, virtual or in person.

Prefer improving what the client already has over new systems or complex AI integration. Bespoke builds only fit small orgs (roughly under ten people) with clear, proportionate needs; anything larger or more complex, including enterprise builds, goes to trusted external partners, not built in-house.

Primary audience: founders and entrepreneurs, SMEs, and charities and non-profits of all sizes, usually without a large internal operations or AI team. MT1L (home of the VAT Framework: Value, Alignment, Trust) handles deeper AI-value strategy work; VAxAI applies the same standard.

Automation can still overwhelm some staff, including neurodivergent employees; flag accessible, human-backed options where relevant.`;

export const PROSPECT_FINDER_FEATURE_LABEL = "Prospect Finder";