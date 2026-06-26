import type { ProspectOutreachRecord } from "@/lib/engagement/prospect-outreach/types";
import {
  buildEngagementApproachFromHub,
  enrichServiceFitWithHub,
  type HubContext,
} from "./knowledge-enrich";
import {
  PARTNER_OFFERS,
  VAXAI_CORE_OFFERS,
  VAXAI_PARTIAL_OFFERS,
} from "./positioning";
import type {
  AiUseLevel,
  BuildVsImprove,
  CapacityLevel,
  ComplexityLevel,
  DataSensitivity,
  EngagementBasis,
  ServiceFitFields,
} from "./types";

type AssessInput = Pick<
  ProspectOutreachRecord,
  | "organisation_name"
  | "organisation_type"
  | "employees"
  | "annual_revenue_gbp"
  | "need_rationale"
  | "need_score"
  | "sector_tags"
  | "pain_point_tags"
  | "engagement_approach"
  | "data_confidence"
>;

const ADMIN_HEAVY_TERMS = [
  "admin",
  "reporting",
  "referral",
  "volunteer",
  "booking",
  "register",
  "contract",
  "tenancy",
  "case management",
  "funding",
  "compliance",
  "manual",
  "spreadsheet",
  "duplicate",
  "coordination",
];

const SENSITIVE_TERMS = [
  "health",
  "safeguarding",
  "housing",
  "benefit",
  "personal data",
  "vulnerable",
  "child",
  "medical",
  "financial",
];

const ACCESSIBILITY_TERMS = [
  "neurodivergent",
  "accessibility",
  "adhd",
  "autism",
  "dyslexia",
  "reasonable adjustment",
  "equality",
];

function inferComplexity(employees: number | null, revenue: number | null): ComplexityLevel {
  const headcount = employees ?? 0;
  if (headcount >= 150 || (revenue ?? 0) >= 15_000_000) return "Very high";
  if (headcount >= 50 || (revenue ?? 0) >= 5_000_000) return "High";
  if (headcount >= 15 || (revenue ?? 0) >= 1_000_000) return "Moderate";
  return "Low";
}

function inferAdminCapacity(employees: number | null, orgType: string): CapacityLevel {
  if (!employees) return "Unknown";
  if (orgType === "Charity" && employees > 40) return "Limited";
  if (employees > 80) return "Limited";
  if (employees > 25) return "Moderate";
  return "Strong";
}

function inferAiUse(rationale: string, tags: string[]): AiUseLevel {
  const text = `${rationale} ${tags.join(" ")}`.toLowerCase();
  if (/\b(ai|automation|chatgpt|copilot|machine learning)\b/.test(text)) {
    if (/\b(advanced|platform|model|integration)\b/.test(text)) return "Moderate";
    return "Limited";
  }
  if (/\b(manual|spreadsheet|paper|email chains)\b/.test(text)) return "None";
  return "Unknown";
}

function inferDataSensitivity(rationale: string, tags: string[]): DataSensitivity {
  const text = `${rationale} ${tags.join(" ")}`.toLowerCase();
  const hits = SENSITIVE_TERMS.filter((t) => text.includes(t));
  if (hits.length >= 2) return "High";
  if (hits.length === 1) return "Elevated";
  return "Standard";
}

function inferLikelyNeed(record: AssessInput): string {
  const rationale = record.need_rationale.trim();
  if (rationale.length > 20) {
    const first = rationale.split(/[.!?]/)[0]?.trim();
    if (first && first.length > 15) return first.endsWith(".") ? first : `${first}.`;
  }
  const sector = record.sector_tags[0] || record.organisation_type.toLowerCase();
  return `Administrative and workflow pressure across ${sector} operations, with opportunity to reduce manual coordination and reporting burden.`;
}

function inferEvidence(record: AssessInput): string {
  const parts = [record.need_rationale.trim()];
  if (record.employees) parts.push(`Approximately ${record.employees} employees reported.`);
  if (record.annual_revenue_gbp) {
    parts.push(`Annual income around £${record.annual_revenue_gbp.toLocaleString("en-GB")}.`);
  }
  if (record.sector_tags.length) parts.push(`Sector signals: ${record.sector_tags.join(", ")}.`);
  return parts.filter(Boolean).join(" ");
}

function pickDirectSupport(complexity: ComplexityLevel, bespoke: boolean): string[] {
  const base: string[] = [
    VAXAI_CORE_OFFERS[0],
    VAXAI_CORE_OFFERS[1],
    VAXAI_CORE_OFFERS[3],
    VAXAI_CORE_OFFERS[6],
  ];
  if (complexity === "Low" || complexity === "Moderate") {
    base.push(VAXAI_CORE_OFFERS[2], VAXAI_CORE_OFFERS[4]);
  }
  if (!bespoke) base.push(VAXAI_CORE_OFFERS[5]);
  return [...new Set(base)];
}

function pickPartialSupport(complexity: ComplexityLevel): string[] {
  if (complexity === "Very high" || complexity === "High") {
    return [VAXAI_PARTIAL_OFFERS[3], VAXAI_PARTIAL_OFFERS[2]];
  }
  return [VAXAI_PARTIAL_OFFERS[0], VAXAI_PARTIAL_OFFERS[1], VAXAI_PARTIAL_OFFERS[2]];
}

function pickPartnerSupport(complexity: ComplexityLevel, bespoke: boolean): string[] {
  const items: string[] = [];
  if (complexity === "High" || complexity === "Very high") {
    items.push(PARTNER_OFFERS[1], PARTNER_OFFERS[3]);
  }
  if (bespoke) items.push(PARTNER_OFFERS[0]);
  if (complexity !== "Low") items.push(PARTNER_OFFERS[2]);
  return [...new Set(items)];
}

function inferEngagementBasis(
  employees: number | null,
  complexity: ComplexityLevel,
): EngagementBasis {
  if (!employees || employees < 12) return "ad_hoc";
  if (complexity === "High" || complexity === "Very high") return "project";
  if (employees < 30) return "mixed";
  return "ongoing";
}

function refineNeedScore(record: AssessInput, complexity: ComplexityLevel): number {
  const text = `${record.need_rationale} ${record.pain_point_tags.join(" ")}`.toLowerCase();
  const adminSignals = ADMIN_HEAVY_TERMS.filter((t) => text.includes(t)).length;
  let score = record.need_score;

  if (adminSignals >= 3 && score < 5) score = Math.min(5, score + 1);
  if (complexity === "Very high" && score > 4) score = 4;
  if (record.data_confidence === "Low" && score > 3) score = Math.min(score, 3);

  return Math.min(5, Math.max(2, score));
}

function buildRecommendedEngagement(
  record: AssessInput,
  complexity: ComplexityLevel,
  bespoke: boolean,
  basis: EngagementBasis,
): string {
  const size = record.employees ?? null;
  const opener =
    size && size < 10
      ? "Start with a short discovery conversation focused on current tools and admin pinch points."
      : "Open with a workflow and systems review workshop with operational leads.";

  const core =
    complexity === "Low" || complexity === "Moderate"
      ? "Offer a practical AI and automation opportunity scan, followed by training and optional virtual assistance for follow-through."
      : "Lead with an existing-system review and AI readiness assessment; position virtual assistance as coordination support rather than a platform replacement.";

  const close = bespoke
    ? "If a small scoped build emerges, keep it clearly bounded and pair with a named technical partner where needed."
    : "Avoid proposing a new platform upfront — confirm priorities, evidence, and internal owners before any technical work.";

  const basisNote =
    basis === "ongoing"
      ? "Frame support as ongoing wraparound assistance alongside existing teams."
      : basis === "ad_hoc"
        ? "Position support as flexible ad hoc help around defined admin and workflow tasks."
        : "Suggest a defined project phase first, with optional ongoing virtual assistance after.";

  return [opener, core, close, basisNote].join(" ");
}

function buildCapabilityBoundaries(complexity: ComplexityLevel, bespoke: boolean): string {
  if (bespoke) {
    return "VAxAI can lead discovery, workflow design, training, and virtual assistance. Any bespoke build should stay small in scope; larger technical delivery needs a specialist partner.";
  }
  if (complexity === "High" || complexity === "Very high") {
    return "VAxAI is well placed for review, training, VAT-informed strategy, and virtual assistance. Complex integrations or enterprise system replacement are outside direct delivery and need a partner.";
  }
  return "VAxAI can directly support review, improvement, training, policy guidance, and virtual assistance within existing tools. New builds are not the default starting point.";
}

function buildOpenQuestions(record: AssessInput): string[] {
  const questions = [
    "Which systems and workflows create the most daily admin pressure?",
    "Who currently owns process improvement and reporting?",
  ];
  if (!record.employees) questions.push("Confirm approximate headcount and team structure.");
  if (record.data_confidence !== "High") questions.push("Validate the primary contact and decision-making route.");
  if (record.organisation_type === "Charity") {
    questions.push("Are there funder reporting or volunteer coordination burdens driving the need?");
  }
  return questions.slice(0, 4);
}

function inferAccessibility(rationale: string, tags: string[]): string | null {
  const text = `${rationale} ${tags.join(" ")}`.toLowerCase();
  if (ACCESSIBILITY_TERMS.some((t) => text.includes(t))) {
    return "Consider how automated notifications, system changes, and new tools may affect neurodivergent staff; pair process improvements with flexible human support and accessible ways of working.";
  }
  if (/\b(volunteer|frontline|support worker|staff wellbeing)\b/.test(text)) {
    return "Where workflow changes are proposed, check whether staff with accessibility or neurodivergent needs may need additional coordination support — not only tooling changes.";
  }
  return null;
}

function inferSystemsLandscape(record: AssessInput): string {
  const text = record.need_rationale.toLowerCase();
  if (/\b(crm|database|case management|erp|sharepoint|microsoft|google)\b/.test(text)) {
    return "Likely mix of established operational systems with manual reporting or handoffs between teams.";
  }
  if (/\b(spreadsheet|excel|paper|email)\b/.test(text)) {
    return "Processes appear partly manual — spreadsheets, email chains, or paper-led coordination may be common.";
  }
  return "Systems landscape not fully confirmed — assume familiar charity/SMB tools with workflow friction rather than a greenfield build.";
}

export function assessServiceFit(
  record: AssessInput & Partial<ServiceFitFields>,
): ServiceFitFields & { need_score: number } {
  const complexity = inferComplexity(record.employees, record.annual_revenue_gbp);
  const employees = record.employees ?? 0;
  const bespoke =
    employees > 0 &&
    employees < 10 &&
    (complexity === "Low" || complexity === "Moderate") &&
    record.data_confidence !== "Low";

  const buildVsImprove: BuildVsImprove = bespoke
    ? "new_build_possible"
    : complexity === "High" || complexity === "Very high"
      ? "improve_existing"
      : "mixed";

  const likelyNeed = inferLikelyNeed(record);
  const evidence = inferEvidence(record);
  const direct = pickDirectSupport(complexity, bespoke);
  const partial = pickPartialSupport(complexity);
  const partner = pickPartnerSupport(complexity, bespoke);
  const basis = inferEngagementBasis(record.employees, complexity);
  const recommended = buildRecommendedEngagement(record, complexity, bespoke, basis);
  const boundaries = buildCapabilityBoundaries(complexity, bespoke);
  const needScore = refineNeedScore(record, complexity);

  const complexityRationale =
    employees > 0
      ? `${employees} employees and ${record.organisation_type.toLowerCase()} operating context suggest ${complexity.toLowerCase()} delivery complexity.`
      : `Limited size data — complexity assumed ${complexity.toLowerCase()} from sector and stated admin burden.`;

  const summary = `${likelyNeed.replace(/\.$/, "")} — ${complexity} complexity. Best fit: ${direct[0].toLowerCase()} with ${basis === "ongoing" ? "ongoing" : basis === "ad_hoc" ? "ad hoc" : "project-based"} support.`;

  return {
    likely_need: likelyNeed,
    complexity_level: complexity,
    complexity_rationale: complexityRationale,
    vaxai_direct_support: direct,
    vaxai_partial_support: partial,
    partner_support: partner,
    capability_boundaries: boundaries,
    recommended_engagement: recommended,
    engagement_basis: basis,
    service_fit_summary: summary.slice(0, 280),
    evidence_summary: evidence.slice(0, 500),
    open_questions: buildOpenQuestions(record),
    systems_landscape: inferSystemsLandscape(record),
    admin_capacity: inferAdminCapacity(record.employees, record.organisation_type),
    ai_automation_use: inferAiUse(record.need_rationale, record.pain_point_tags),
    data_sensitivity: inferDataSensitivity(record.need_rationale, record.sector_tags),
    internal_capability: inferAdminCapacity(record.employees, record.organisation_type),
    accessibility_considerations: inferAccessibility(record.need_rationale, record.pain_point_tags),
    build_vs_improve: buildVsImprove,
    bespoke_build_fit: bespoke,
    bespoke_build_note: bespoke
      ? "Small-team context may allow a tightly scoped build, but only after workflow review and with specialist support identified for technical delivery."
      : employees >= 10
        ? "Organisation size and complexity make a new system build a lower-priority starting point — review and support existing tools first."
        : null,
    need_score: needScore,
  };
}

/** Apply service-fit reassessment while preserving core research fields. */
export function reassessProspectRecord(
  record: ProspectOutreachRecord,
  hub?: HubContext | null,
): ProspectOutreachRecord {
  const assessed = enrichServiceFitWithHub(assessServiceFit(record), hub ?? null);
  const { need_score, ...fit } = assessed;

  const engagementApproach = buildEngagementApproachFromHub(
    record.engagement_approach,
    fit,
    hub ?? null,
  );

  return {
    ...record,
    need_score,
    need_rationale: record.need_rationale,
    engagement_approach: engagementApproach,
    ...fit,
  };
}