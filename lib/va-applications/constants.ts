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

export const VA_INSURANCE_STATUSES = ["yes", "no", "will_arrange"] as const;
export type VaInsuranceStatus = (typeof VA_INSURANCE_STATUSES)[number];

export const VA_INSURANCE_LABELS: Record<VaInsuranceStatus, string> = {
  yes: "Yes, I have business insurance",
  no: "Not yet",
  will_arrange: "I will arrange insurance before client work starts",
};

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
  approved: "Approved",
  joined: "Joined",
  not_suitable: "Not suitable",
};

export const VA_STATUS_COLORS: Record<VaApplicationStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  contacted: "bg-sky-100 text-sky-900",
  verified: "bg-violet-100 text-violet-900",
  approved: "bg-emerald-100 text-emerald-900",
  joined: "bg-pine-900 text-white",
  not_suitable: "bg-stone-200 text-stone-700",
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
  "Document organisation & backlog clearing",
  "Data entry & data hygiene",
  "Email management",
  "Calendar & diary management",
  "Executive / founder support",
  "Research",
  "Customer service & enquiries",
  "CRM & records management",
  "Process documentation",
  "Project coordination",
  "Sales & pipeline admin",
  "Social media admin",
  "E-commerce / Shopify admin",
  "HR admin",
  "IT & systems admin (light)",
  "Charity & funder admin",
  "Public sector records & correspondence",
  "Support for neurodivergent professionals",
  "Human review of AI-assisted work",
] as const;

export const VA_SECTOR_INTEREST_OPTIONS = [
  "Founders & entrepreneurs",
  "Small & medium businesses",
  "Charities & non-profits",
  "Public sector",
  "Professional services",
  "Healthcare & wellbeing",
  "Education",
  "Retail & e-commerce",
  "Technology",
  "Other",
] as const;

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
