export type ProspectOutreachRecord = {
  id: string;
  organisation_name: string;
  organisation_type: "Charity" | "Business" | "Social enterprise" | "Other";
  location: string;
  region: string;
  website: string;
  employees: number | null;
  annual_revenue_gbp: number | null;
  revenue_basis: string;
  need_score: number;
  need_rationale: string;
  decision_maker_name: string;
  decision_maker_role: string;
  email: string;
  phone: string;
  financial_source_url: string;
  contact_source_url: string;
  data_confidence: "High" | "Medium" | "Low";
  sector_tags: string[];
  pain_point_tags: string[];
  engagement_approach: string;
  research_date: string;
  priority_region: "primary" | "secondary" | "deprioritized";
};

export type ProspectOutreachMeta = {
  research_date: string;
  total_count: number;
  by_region: Record<string, number>;
  by_need_score: Record<string, number>;
  methodology: string;
};

export type ProspectOutreachCatalog = {
  meta: ProspectOutreachMeta;
  prospects: ProspectOutreachRecord[];
};

export const OUTREACH_REGIONS = [
  "Norfolk",
  "Suffolk",
  "Cambridgeshire",
  "Greater Manchester",
  "Merseyside",
  "East of England (other)",
] as const;

export const NEED_SCORE_COLORS: Record<number, string> = {
  5: "bg-[#063b32]/15 text-[#063b32]",
  4: "bg-emerald-100 text-emerald-800",
  3: "bg-amber-100 text-amber-800",
  2: "bg-slate-100 text-slate-600",
  1: "bg-gray-100 text-gray-500",
};

export const CONFIDENCE_COLORS: Record<string, string> = {
  High: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-red-100 text-red-700",
};