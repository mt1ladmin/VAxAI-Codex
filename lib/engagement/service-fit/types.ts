import type {
  AI_USE_LEVELS,
  BUILD_VS_IMPROVE,
  CAPACITY_LEVELS,
  COMPLEXITY_LEVELS,
  DATA_SENSITIVITY_LEVELS,
  ENGAGEMENT_BASIS_OPTIONS,
} from "./positioning";

export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];
export type EngagementBasis = (typeof ENGAGEMENT_BASIS_OPTIONS)[number];
export type CapacityLevel = (typeof CAPACITY_LEVELS)[number];
export type AiUseLevel = (typeof AI_USE_LEVELS)[number];
export type DataSensitivity = (typeof DATA_SENSITIVITY_LEVELS)[number];
export type BuildVsImprove = (typeof BUILD_VS_IMPROVE)[number];

/** Service-fit fields stored on prospect catalog records and snapshots. */
export type ServiceFitFields = {
  likely_need: string;
  complexity_level: ComplexityLevel;
  complexity_rationale: string;
  vaxai_direct_support: string[];
  vaxai_partial_support: string[];
  partner_support: string[];
  capability_boundaries: string;
  recommended_engagement: string;
  engagement_basis: EngagementBasis;
  service_fit_summary: string;
  evidence_summary: string;
  open_questions: string[];
  systems_landscape: string;
  admin_capacity: CapacityLevel;
  ai_automation_use: AiUseLevel;
  data_sensitivity: DataSensitivity;
  internal_capability: CapacityLevel;
  accessibility_considerations: string | null;
  build_vs_improve: BuildVsImprove;
  bespoke_build_fit: boolean;
  bespoke_build_note: string | null;
};