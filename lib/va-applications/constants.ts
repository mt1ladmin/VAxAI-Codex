/** Shared constants for freelance VA applications (public form + studio). */

export const VA_APPLICANT_TYPES = ["experienced", "early_career"] as const;
export type VaApplicantType = (typeof VA_APPLICANT_TYPES)[number];

export const VA_APPLICANT_TYPE_LABELS: Record<VaApplicantType, string> = {
  experienced: "Experienced freelancer",
  early_career: "Early career / getting started",
};

/** HMRC self-employed setup — not Companies House registration. */
export const VA_SELF_EMPLOYED_STATUSES = [
  "registered_hmrc",
  "will_register",
  "need_setup_help",
] as const;
export type VaSelfEmployedStatus = (typeof VA_SELF_EMPLOYED_STATUSES)[number];

export const VA_SELF_EMPLOYED_LABELS: Record<VaSelfEmployedStatus, string> = {
  registered_hmrc: "Already registered as self-employed with HMRC",
  will_register: "I will register with HMRC when required",
  need_setup_help: "I am new to this and would like help understanding the process",
};

/** Shown on the public application form (subset of statuses). */
export const VA_SELF_EMPLOYED_FORM_OPTIONS: VaSelfEmployedStatus[] = [
  "registered_hmrc",
  "will_register",
];

export const VA_INSURANCE_STATUSES = ["yes", "no", "will_arrange"] as const;
export type VaInsuranceStatus = (typeof VA_INSURANCE_STATUSES)[number];

export const VA_INSURANCE_LABELS: Record<VaInsuranceStatus, string> = {
  yes: "Yes, I already have business insurance",
  no: "Not yet",
  will_arrange: "I will arrange it before any client work starts",
};

/** Shown on the public application form (subset of statuses). */
export const VA_INSURANCE_FORM_OPTIONS: VaInsuranceStatus[] = ["yes", "will_arrange"];

export const VA_EXPERIENCE_YEARS = ["1–3 years", "3–5 years", "5+ years"] as const;
export type VaExperienceYears = (typeof VA_EXPERIENCE_YEARS)[number];

export const VA_AI_KNOWLEDGE_OPTIONS = [
  "Limited / learning",
  "Some practical experience",
  "Confident using and reviewing AI-assisted work",
] as const;
export type VaAiKnowledgeOption = (typeof VA_AI_KNOWLEDGE_OPTIONS)[number];

/**
 * Pipeline statuses.
 * Applications tab: new → contacted → verified → not_suitable
 * Approved tab (talent pool): approved → joined
 */
export const VA_APPLICATION_STATUSES = [
  "new",
  "contacted",
  "verified",
  "approved",
  "joined",
  "not_suitable",
] as const;
export type VaApplicationStatus = (typeof VA_APPLICATION_STATUSES)[number];

export const VA_STATUS_LABELS: Record<VaApplicationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  verified: "Verified",
  approved: "Active",
  joined: "Joined",
  not_suitable: "Not suitable",
};

/** Palette: white, pine-900, acid lime, ink — matches public site */
export const VA_STATUS_COLORS: Record<VaApplicationStatus, string> = {
  new: "bg-acid text-ink border border-acid",
  contacted: "bg-white text-pine-800 border border-pine-900/15",
  verified: "bg-white text-pine-900 border border-pine-900/20",
  approved: "bg-white text-pine-900 border border-pine-900/20",
  joined: "bg-pine-900 text-paper",
  not_suitable: "bg-white text-muted border border-pine-900/10",
};

/** Statuses shown on the Applications (pipeline) tab */
export const VA_PIPELINE_STATUSES: VaApplicationStatus[] = [
  "new",
  "contacted",
  "verified",
  "not_suitable",
];

/** Statuses shown on the Approved (talent pool) tab */
export const VA_APPROVED_STATUSES: VaApplicationStatus[] = ["approved", "joined"];

/**
 * Key specialisms grounded in VAxAI delivery:
 * backlog recovery, AI readiness groundwork, ongoing admin, maintain & improve
 * for founders, SMEs, charities and public sector.
 */
export const VA_SPECIALISMS = [
  "Administrative support",
  "Document organisation and backlog clearing",
  "Data entry and data hygiene",
  "Email management",
  "Calendar and diary management",
  "Executive and founder support",
  "Research",
  "Customer service and enquiries",
  "CRM and records management",
  "Process documentation",
  "Project coordination",
  "Sales and pipeline admin",
  "Social media admin",
  "E-commerce and Shopify admin",
  "HR admin",
  "IT and systems admin (light)",
  "Charity and funder admin",
  "Public sector records and correspondence",
  "Support for neurodivergent professionals",
  "Human review of AI-assisted work",
] as const;

/** Organisation types applicants have worked with / want to support */
export const VA_CLIENT_SECTORS = [
  "Founders and entrepreneurs",
  "Private sector SMEs",
  "Charities / non-profits",
  "Public sector",
] as const;
export type VaClientSector = (typeof VA_CLIENT_SECTORS)[number];

/** Industries / domains shown after the applicant picks client sector(s) */
export const VA_INDUSTRIES_BY_SECTOR: Record<VaClientSector, readonly string[]> = {
  "Founders and entrepreneurs": [
    "Technology and software",
    "Professional and business services",
    "Creative and media",
    "E-commerce and retail",
    "Health and wellbeing",
    "Education and training",
    "Food and hospitality",
    "Finance and fintech",
    "Property and real estate",
    "Marketing and communications",
    "Sustainability and environment",
    "Consumer products",
    "Other / multi-sector",
  ],
  "Private sector SMEs": [
    "Agriculture, forestry and fishing",
    "Manufacturing",
    "Energy and utilities",
    "Construction and trades",
    "Wholesale and retail trade",
    "Transportation and storage",
    "Accommodation and food services",
    "Information and communication",
    "Financial and insurance services",
    "Real estate",
    "Professional, scientific and technical",
    "Administrative and support services",
    "Education (private / independent)",
    "Human health and social work",
    "Arts, entertainment and recreation",
    "Other service activities",
  ],
  "Charities / non-profits": [
    "Grant-funded charities",
    "Social enterprises and CICs",
    "Membership and associations",
    "Faith and community organisations",
    "Health and wellbeing non-profits",
    "Education and youth",
    "Housing and homelessness",
    "Environment and sustainability",
    "Arts and culture",
    "International development",
    "Other charity / non-profit",
  ],
  "Public sector": [
    "Central government",
    "Local government",
    "NHS and healthcare",
    "Education (state / public)",
    "Policing and criminal justice",
    "Defence and security",
    "Emergency services",
    "Social care",
    "Housing and social housing",
    "Transport and infrastructure",
    "Regulatory bodies and agencies",
    "Devolved administrations",
    "Arms-length bodies",
    "Public corporations",
    "Other public services",
  ],
};

/** Union of industry options for one or more selected client sectors */
export function industriesForSectors(sectors: readonly string[]): string[] {
  const allowed = new Set<string>();
  for (const sector of sectors) {
    if ((VA_CLIENT_SECTORS as readonly string[]).includes(sector)) {
      for (const item of VA_INDUSTRIES_BY_SECTOR[sector as VaClientSector]) {
        allowed.add(item);
      }
    }
  }
  return [...allowed];
}

export type VaApplication = {
  id: string;
  created_at: string;
  updated_at: string;
  applicant_type: VaApplicantType;
  full_name: string;
  email: string;
  telephone: string | null;
  location: string | null;
  uk_based: boolean;
  self_employed_status: VaSelfEmployedStatus;
  has_business_insurance: VaInsuranceStatus;
  can_prove_identity: boolean;
  specialisms: string[];
  sectors_interests: string | null;
  work_specialises_in: string | null;
  ai_knowledge: string | null;
  availability_hours_per_week: string | null;
  availability_notes: string | null;
  cv_path: string | null;
  cv_file_name: string | null;
  cv_url: string | null;
  photo_url: string | null;
  cover_note: string | null;
  admin_notes: string | null;
  status: VaApplicationStatus;
  last_action: string | null;
  last_action_date: string | null;
  profile_extras: Record<string, unknown>;
};

export function isVaApplicationStatus(value: string): value is VaApplicationStatus {
  return (VA_APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function isPipelineStatus(status: VaApplicationStatus): boolean {
  return VA_PIPELINE_STATUSES.includes(status);
}

export function isApprovedPoolStatus(status: VaApplicationStatus): boolean {
  return VA_APPROVED_STATUSES.includes(status);
}
