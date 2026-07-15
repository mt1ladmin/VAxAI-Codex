/**
 * Timeless content ideas for VAxAI Studio Create.
 * Optional checklist — not a plan calendar; reduces blank-page pressure.
 * Aligned to: backlog recovery, AI readiness, ongoing admin, maintain & improve.
 */

export type TopicCategoryId =
  | "foundations"
  | "backlog"
  | "ai_readiness"
  | "ongoing"
  | "maintain"
  | "audiences"
  | "mindset";

export type ContentTopic = {
  id: string;
  category: TopicCategoryId;
  title: string;
  /** Short angle for the create brief */
  angle: string;
  formats: Array<"blog" | "linkedin" | "instagram" | "facebook">;
};

export const TOPIC_CATEGORIES: { id: TopicCategoryId; label: string; blurb: string }[] = [
  {
    id: "foundations",
    label: "Admin foundations",
    blurb: "Why operations and information come before tools.",
  },
  {
    id: "backlog",
    label: "Backlog recovery",
    blurb: "Clearing what has built up and restoring control.",
  },
  {
    id: "ai_readiness",
    label: "AI & automation readiness",
    blurb: "Groundwork so tools have something reliable to work from.",
  },
  {
    id: "ongoing",
    label: "Ongoing admin support",
    blurb: "Day-to-day capacity without stretching the team.",
  },
  {
    id: "maintain",
    label: "Maintain & improve",
    blurb: "Stopping problems from returning after the hard work.",
  },
  {
    id: "audiences",
    label: "Who we help",
    blurb: "Founders, SMEs, charities and public sector angles.",
  },
  {
    id: "mindset",
    label: "Positioning & trust",
    blurb: "Human-led work, VAT thinking, and honest limits.",
  },
];

export const CONTENT_TOPICS: ContentTopic[] = [
  // Foundations
  {
    id: "admin-doesnt-fix-itself",
    category: "foundations",
    title: "Administration doesn't fix itself",
    angle: "Why admin pressure builds even when people work hard — and what to do first.",
    formats: ["blog", "linkedin", "facebook"],
  },
  {
    id: "ops-gap-not-dedication",
    category: "foundations",
    title: "Senior time on routine admin is an operations gap",
    angle: "Reframe 'dedication' as capacity that should be designed, not absorbed.",
    formats: ["linkedin", "blog"],
  },
  {
    id: "process-in-someones-head",
    category: "foundations",
    title: "If it lives in someone's head, it isn't a process yet",
    angle: "Documenting how work actually runs before any automation.",
    formats: ["blog", "linkedin", "instagram"],
  },
  {
    id: "free-admin-review-what-it-is",
    category: "foundations",
    title: "What a free Admin Review actually covers",
    angle: "Honest, practical: pressure points, foundations, and what we recommend next.",
    formats: ["blog", "linkedin", "facebook"],
  },
  // Backlog
  {
    id: "backlogs-build-slowly",
    category: "backlog",
    title: "Backlogs build slowly, then all at once",
    angle: "How piles form as demand grows faster than capacity — and how to start clearing one.",
    formats: ["blog", "linkedin", "facebook"],
  },
  {
    id: "one-drawer-start",
    category: "backlog",
    title: "Start with one drawer, not the whole warehouse",
    angle: "A practical first step for backlog recovery without a huge project.",
    formats: ["linkedin", "instagram", "facebook"],
  },
  {
    id: "grant-reporting-backlog",
    category: "backlog",
    title: "Grant and funder reporting backlogs",
    angle: "How charities catch up without pulling everyone off delivery.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "public-sector-records-backlog",
    category: "backlog",
    title: "Records and correspondence piles in the public sector",
    angle: "Why transformation stalls on unprocessed information — and where capacity helps.",
    formats: ["blog", "linkedin"],
  },
  // AI readiness
  {
    id: "ai-inherits-filing",
    category: "ai_readiness",
    title: "AI projects inherit your filing system",
    angle: "What disorganised information does to tools — and how to prepare.",
    formats: ["blog", "linkedin", "instagram"],
  },
  {
    id: "before-copilot",
    category: "ai_readiness",
    title: "Before you roll out an AI assistant",
    angle: "Organise shared drives and access so tools have something reliable to use.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "ai-readiness-means",
    category: "ai_readiness",
    title: "What AI readiness means in practice",
    angle: "Data quality, documented processes, organised information — not a product purchase.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "we-dont-sell-ai",
    category: "ai_readiness",
    title: "We prepare for AI — we don't sell it",
    angle: "Why that matters for trust and for recommendations that stay honest.",
    formats: ["linkedin", "blog"],
  },
  {
    id: "duplicates-kill-automation",
    category: "ai_readiness",
    title: "Duplicate files are where good automations go to die",
    angle: "Data hygiene as operational habit, not a one-off IT project.",
    formats: ["linkedin", "instagram"],
  },
  // Ongoing
  {
    id: "inbox-as-todo",
    category: "ongoing",
    title: "When the inbox is the to-do list",
    angle: "Why that fails and how human admin support restores control.",
    formats: ["blog", "linkedin", "facebook"],
  },
  {
    id: "flexible-monthly-support",
    category: "ongoing",
    title: "Why monthly admin support should scale up and down",
    angle: "Capacity that matches the period, without a full-time hire.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "human-in-the-loop",
    category: "ongoing",
    title: "Keeping a person in the loop on AI-assisted work",
    angle: "Checking outputs before they go out under the organisation's name.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "founder-second-pair-of-eyes",
    category: "ongoing",
    title: "A second pair of eyes for solo founders",
    angle: "Judgement calls and routine admin that should stay human.",
    formats: ["linkedin", "blog"],
  },
  // Maintain
  {
    id: "cleared-backlog-returns",
    category: "maintain",
    title: "A cleared backlog returns unless someone maintains it",
    angle: "Why monitoring and data hygiene matter as much as the cleanup.",
    formats: ["blog", "linkedin", "instagram"],
  },
  {
    id: "ten-minutes-hygiene",
    category: "maintain",
    title: "Ten minutes of hygiene beats a rescue project",
    angle: "Small ongoing habits after project work ends.",
    formats: ["linkedin", "instagram", "facebook"],
  },
  {
    id: "automations-quietly-break",
    category: "maintain",
    title: "Automations that quietly stop working",
    angle: "Who watches them, and what 'maintain and improve' actually means.",
    formats: ["blog", "linkedin"],
  },
  // Audiences
  {
    id: "founders-admin-and-growth",
    category: "audiences",
    title: "Founders: admin that competes with growth",
    angle: "Clearing the pile and keeping day-to-day moving without hiring full-time ops.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "sme-growth-chaos",
    category: "audiences",
    title: "SMEs: grow without administrative chaos",
    angle: "Systems and capacity that keep pace with demand.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "charity-mission-capacity",
    category: "audiences",
    title: "Charities: more capacity for mission, less for admin",
    angle: "Reporting, records and volunteers — practical support without tool sales.",
    formats: ["blog", "linkedin", "facebook"],
  },
  {
    id: "public-sector-foundations",
    category: "audiences",
    title: "Public sector: foundations before smarter ways of working",
    angle: "Backlogs, information management, and capacity beside BAU.",
    formats: ["blog", "linkedin"],
  },
  // Mindset
  {
    id: "vat-framework-plain",
    category: "mindset",
    title: "Value, Alignment, Trust — in plain English",
    angle: "How we judge whether AI or a process change should be used.",
    formats: ["blog", "linkedin"],
  },
  {
    id: "not-every-client-wants-ai",
    category: "mindset",
    title: "Not every organisation wants AI — and that's fine",
    angle: "Traditional admin support still matters; skills stay useful either way.",
    formats: ["linkedin", "blog"],
  },
  {
    id: "quote-not-fixed-price",
    category: "mindset",
    title: "Why we quote after we understand the work",
    angle: "No fixed public packages — match the person and the scope first.",
    formats: ["linkedin", "blog"],
  },
  {
    id: "prepare-support-maintain",
    category: "mindset",
    title: "Prepare. Support. Maintain.",
    angle: "The journey in one short piece people can share.",
    formats: ["blog", "linkedin", "instagram"],
  },
];

export function topicsByCategory(category: TopicCategoryId): ContentTopic[] {
  return CONTENT_TOPICS.filter((t) => t.category === category);
}

export function buildBriefFromTopics(selectedIds: string[]): string {
  const selected = CONTENT_TOPICS.filter((t) => selectedIds.includes(t.id));
  if (!selected.length) return "";
  const lines = selected.map((t) => `- ${t.title}: ${t.angle}`);
  return `Please create on-brand VAxAI content using these selected topic angles (timeless, practical, human-led; admin foundations before tools; do not sell AI products):\n\n${lines.join("\n")}\n\nWrite for the platform(s) I choose next. Keep examples honest and hypothetical. Close with a clear, proportionate call to action.`;
}
