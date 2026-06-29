import type { ServiceFitFields } from "@/lib/engagement/service-fit/types";

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
} & Partial<ServiceFitFields>;

export type ProspectOutreachMeta = {
  research_date: string;
  total_count: number;
  target_total?: number;
  target_charity_total?: number;
  target_business_total?: number;
  charity_count?: number;
  business_count?: number;
  available_count?: number;
  filtered_count?: number;
  queued_count?: number;
  unassigned_count?: number;
  with_tasks_count?: number;
  preparing_to_engage_count?: number;
  engagement_started_count?: number;
  opportunity_identified_count?: number;
  is_client_count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  by_region: Record<string, number>;
  filtered_by_region?: Record<string, number>;
  by_need_score: Record<string, number>;
  by_organisation_type?: Record<string, number>;
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
  "Essex",
  "Hertfordshire",
  "Bedfordshire",
  "East of England (other)",
  "Greater London",
  "Greater Manchester",
  "Merseyside",
  "Lancashire",
  "Cheshire",
  "Cumbria",
  "North West England (other)",
  "West Yorkshire",
  "South Yorkshire",
  "North Yorkshire",
  "East Riding of Yorkshire",
  "Yorkshire and the Humber (other)",
  "Tyne and Wear",
  "County Durham",
  "Northumberland",
  "North East England (other)",
  "West Midlands",
  "Warwickshire",
  "Staffordshire",
  "Shropshire",
  "Worcestershire",
  "Herefordshire",
  "Midlands (other)",
  "Derbyshire",
  "Nottinghamshire",
  "Leicestershire",
  "Lincolnshire",
  "East Midlands (other)",
  "Kent",
  "Surrey",
  "East Sussex",
  "West Sussex",
  "Hampshire",
  "Berkshire",
  "Oxfordshire",
  "Buckinghamshire",
  "South East England (other)",
  "Devon",
  "Cornwall",
  "Somerset",
  "Dorset",
  "Wiltshire",
  "Gloucestershire",
  "Bristol",
  "South West England (other)",
  "Scotland",
  "Wales",
  "Northern Ireland",
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

export const COMPLEXITY_COLORS: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-800",
  Moderate: "bg-sky-100 text-sky-800",
  High: "bg-amber-100 text-amber-800",
  "Very high": "bg-rose-100 text-rose-800",
};