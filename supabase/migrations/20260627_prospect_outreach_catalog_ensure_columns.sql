-- Ensure prospect_outreach_catalog has all required columns.
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is idempotent.
-- This guards against schema drift when the table pre-existed the 20260708 migration.

CREATE TABLE IF NOT EXISTS prospect_outreach_catalog (
  id TEXT PRIMARY KEY,
  organisation_name TEXT NOT NULL,
  organisation_type TEXT NOT NULL DEFAULT 'Other',
  location TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  employees INTEGER,
  annual_revenue_gbp BIGINT,
  revenue_basis TEXT NOT NULL DEFAULT '',
  need_score INTEGER NOT NULL DEFAULT 3,
  need_rationale TEXT NOT NULL DEFAULT '',
  data_confidence TEXT NOT NULL DEFAULT 'Medium',
  research_date TEXT NOT NULL DEFAULT '',
  priority_region TEXT NOT NULL DEFAULT 'secondary',
  decision_maker_name TEXT NOT NULL DEFAULT '',
  decision_maker_role TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  financial_source_url TEXT NOT NULL DEFAULT '',
  contact_source_url TEXT NOT NULL DEFAULT '',
  sector_tags TEXT[] NOT NULL DEFAULT '{}',
  pain_point_tags TEXT[] NOT NULL DEFAULT '{}',
  engagement_approach TEXT NOT NULL DEFAULT '',
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

-- Add any columns that may be missing if the table pre-existed
ALTER TABLE prospect_outreach_catalog
  ADD COLUMN IF NOT EXISTS website TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS employees INTEGER,
  ADD COLUMN IF NOT EXISTS annual_revenue_gbp BIGINT,
  ADD COLUMN IF NOT EXISTS revenue_basis TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS data_confidence TEXT NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS research_date TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS priority_region TEXT NOT NULL DEFAULT 'secondary',
  ADD COLUMN IF NOT EXISTS decision_maker_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS decision_maker_role TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS financial_source_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_source_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sector_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pain_point_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engagement_approach TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS likely_need TEXT,
  ADD COLUMN IF NOT EXISTS complexity_level TEXT,
  ADD COLUMN IF NOT EXISTS complexity_rationale TEXT,
  ADD COLUMN IF NOT EXISTS vaxai_direct_support TEXT[],
  ADD COLUMN IF NOT EXISTS vaxai_partial_support TEXT[],
  ADD COLUMN IF NOT EXISTS partner_support TEXT[],
  ADD COLUMN IF NOT EXISTS capability_boundaries TEXT,
  ADD COLUMN IF NOT EXISTS recommended_engagement TEXT,
  ADD COLUMN IF NOT EXISTS engagement_basis TEXT,
  ADD COLUMN IF NOT EXISTS service_fit_summary TEXT,
  ADD COLUMN IF NOT EXISTS evidence_summary TEXT,
  ADD COLUMN IF NOT EXISTS open_questions TEXT[],
  ADD COLUMN IF NOT EXISTS systems_landscape TEXT,
  ADD COLUMN IF NOT EXISTS admin_capacity TEXT,
  ADD COLUMN IF NOT EXISTS ai_automation_use TEXT,
  ADD COLUMN IF NOT EXISTS data_sensitivity TEXT,
  ADD COLUMN IF NOT EXISTS internal_capability TEXT,
  ADD COLUMN IF NOT EXISTS accessibility_considerations TEXT,
  ADD COLUMN IF NOT EXISTS build_vs_improve TEXT,
  ADD COLUMN IF NOT EXISTS bespoke_build_fit BOOLEAN,
  ADD COLUMN IF NOT EXISTS bespoke_build_note TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure RLS is enabled and admin policy exists
ALTER TABLE prospect_outreach_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prospect_outreach_catalog_admin ON prospect_outreach_catalog;
CREATE POLICY prospect_outreach_catalog_admin ON prospect_outreach_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE INDEX IF NOT EXISTS idx_poc_region ON prospect_outreach_catalog (region);
CREATE INDEX IF NOT EXISTS idx_poc_need_score ON prospect_outreach_catalog (need_score);
CREATE INDEX IF NOT EXISTS idx_poc_organisation_type ON prospect_outreach_catalog (organisation_type);
