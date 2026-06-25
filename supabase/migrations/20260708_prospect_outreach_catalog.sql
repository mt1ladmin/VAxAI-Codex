-- Prospect outreach catalog: persistent storage for all 1000+ prospect records.
-- Service-fit fields are included as editable columns.
-- The prospect_outreach_overrides table continues to hold workflow state (assignment, status, etc.).

CREATE TABLE IF NOT EXISTS prospect_outreach_catalog (
  id TEXT PRIMARY KEY,

  -- Core identity
  organisation_name TEXT NOT NULL,
  organisation_type TEXT NOT NULL DEFAULT 'Other',
  location TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  employees INTEGER,
  annual_revenue_gbp BIGINT,
  revenue_basis TEXT NOT NULL DEFAULT '',

  -- Research meta
  need_score INTEGER NOT NULL DEFAULT 3,
  need_rationale TEXT NOT NULL DEFAULT '',
  data_confidence TEXT NOT NULL DEFAULT 'Medium',
  research_date TEXT NOT NULL DEFAULT '',
  priority_region TEXT NOT NULL DEFAULT 'secondary',

  -- Contact
  decision_maker_name TEXT NOT NULL DEFAULT '',
  decision_maker_role TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  financial_source_url TEXT NOT NULL DEFAULT '',
  contact_source_url TEXT NOT NULL DEFAULT '',

  -- Taxonomy
  sector_tags TEXT[] NOT NULL DEFAULT '{}',
  pain_point_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Engagement approach (base)
  engagement_approach TEXT NOT NULL DEFAULT '',

  -- Service-fit fields (editable, initially populated from catalog.json)
  likely_need TEXT,
  complexity_level TEXT,
  complexity_rationale TEXT,
  vaxai_direct_support TEXT[],
  vaxai_partial_support TEXT[],
  partner_support TEXT[],
  capability_boundaries TEXT,
  recommended_engagement TEXT,
  engagement_basis TEXT,
  service_fit_summary TEXT,
  evidence_summary TEXT,
  open_questions TEXT[],
  systems_landscape TEXT,
  admin_capacity TEXT,
  ai_automation_use TEXT,
  data_sensitivity TEXT,
  internal_capability TEXT,
  accessibility_considerations TEXT,
  build_vs_improve TEXT,
  bespoke_build_fit BOOLEAN,
  bespoke_build_note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prospect_outreach_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY prospect_outreach_catalog_admin ON prospect_outreach_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Index for region and need_score filtering used in Finder
CREATE INDEX IF NOT EXISTS idx_poc_region ON prospect_outreach_catalog (region);
CREATE INDEX IF NOT EXISTS idx_poc_need_score ON prospect_outreach_catalog (need_score);
CREATE INDEX IF NOT EXISTS idx_poc_organisation_type ON prospect_outreach_catalog (organisation_type);
