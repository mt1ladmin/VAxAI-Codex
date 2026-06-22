-- ================================================================
-- VAxAI Studio – Client Engagement Module
-- Additive migration: creates new tables only, touches nothing existing
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Core CRM tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_organisations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  name            text NOT NULL,
  audience_type   text,
  industry        text,
  charity_number  text,
  company_number  text,
  website         text,
  main_location   text,
  country         text DEFAULT 'England',
  region          text,
  town_city       text,
  local_authority text,
  postcode_area   text,
  delivery_preference text DEFAULT 'unknown',
  size            text DEFAULT 'Unknown',
  description     text,
  digital_maturity text DEFAULT 'Unknown',
  ai_confidence   text DEFAULT 'Unknown',
  trust_risk_context text,
  known_systems   text[],
  known_pain_points text[],
  source          text,
  owner_email     text,
  status          text DEFAULT 'active',
  tags            text[],
  last_reviewed   date,
  notes           text
);

CREATE TABLE IF NOT EXISTS engagement_contacts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  organisation_id       uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  first_name            text NOT NULL,
  last_name             text,
  role                  text,
  professional_email    text,
  phone                 text,
  linkedin_url          text,
  preferred_channel     text,
  communication_prefs   text,
  contact_source        text,
  contact_basis         text,
  is_suppressed         boolean NOT NULL DEFAULT false,
  suppression_reason    text,
  do_not_contact        boolean NOT NULL DEFAULT false,
  notes                 text,
  owner_email           text,
  tags                  text[]
);

CREATE TABLE IF NOT EXISTS engagement_opportunities (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  title                 text NOT NULL,
  organisation_id       uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  primary_contact_id    uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  stage                 text NOT NULL DEFAULT 'Identified',
  pain_point_ids        uuid[],
  desired_outcomes      text,
  vat_observations      jsonb DEFAULT '{}'::jsonb,
  recommended_pathway   text,
  indicative_value_low  numeric,
  indicative_value_high numeric,
  probability           integer,
  next_action           text,
  expected_decision_date date,
  loss_pause_reason     text,
  owner_email           text,
  notes                 text
);

CREATE TABLE IF NOT EXISTS engagement_interactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  organisation_id     uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  contact_id          uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  opportunity_id      uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  interaction_date    timestamptz NOT NULL DEFAULT now(),
  interaction_type    text NOT NULL DEFAULT 'call',
  channel             text,
  direction           text DEFAULT 'outbound',
  participants        text[],
  summary             text,
  full_notes          text,
  pain_point_ids      uuid[],
  objections          text[],
  commitments         text,
  outcome             text,
  follow_up_date      date,
  created_by          text,
  is_sensitive        boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS engagement_tasks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  title               text NOT NULL,
  organisation_id     uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  contact_id          uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  opportunity_id      uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  owner_email         text,
  due_date            date,
  priority            text DEFAULT 'medium',
  status              text DEFAULT 'open',
  task_type           text DEFAULT 'follow_up',
  notes               text
);

-- ----------------------------------------------------------------
-- 2. Knowledge / guidance tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_pain_points (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  category        text NOT NULL,
  title           text NOT NULL,
  slug            text UNIQUE,
  plain_english_definition text,
  what_person_says text[],
  what_this_means  text[],
  what_not_assume  text[],
  common_root_causes text[],
  natural_questions text[],
  process_map_prompts text[],
  information_data  text[],
  risk_sensitivity  text,
  quick_improvements text[],
  existing_tool_opps text[],
  integration_opps   text[],
  possible_automation text[],
  possible_ai        text[],
  human_va_responsibilities text[],
  tasks_remain_human text[],
  measures_improvement text[],
  explanation_to_prospect text,
  common_objections text[],
  relevant_sectors  text[],
  related_pain_point_ids uuid[],
  recommendation_pathways text[],
  status          text DEFAULT 'approved',
  content_owner   text,
  last_reviewed   date,
  next_review     date
);

CREATE TABLE IF NOT EXISTS engagement_pain_point_synonyms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_point_id uuid NOT NULL REFERENCES engagement_pain_points(id) ON DELETE CASCADE,
  phrase        text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pp_synonyms_phrase ON engagement_pain_point_synonyms USING gin(to_tsvector('english', phrase));
CREATE INDEX IF NOT EXISTS idx_pp_title ON engagement_pain_points USING gin(to_tsvector('english', title));

CREATE TABLE IF NOT EXISTS engagement_playbook_sections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_point_id uuid NOT NULL REFERENCES engagement_pain_points(id) ON DELETE CASCADE,
  section_key   text NOT NULL,
  content       text,
  sort_order    integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS engagement_vat_prompts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  category      text NOT NULL,
  dimension     text NOT NULL CHECK (dimension IN ('value','alignment','trust')),
  prompt        text NOT NULL,
  context_tags  text[],
  pain_point_ids uuid[],
  status        text DEFAULT 'approved',
  sort_order    integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS engagement_recommendation_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  title         text NOT NULL,
  recommendation_type text NOT NULL,
  condition_field     text,
  condition_operator  text,
  condition_value     text,
  priority      integer DEFAULT 10,
  reason        text,
  evidence_needed text,
  risk_gate     boolean DEFAULT false,
  risk_gate_reason text,
  status        text DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS engagement_recommendations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  opportunity_id      uuid REFERENCES engagement_opportunities(id) ON DELETE CASCADE,
  interaction_id      uuid REFERENCES engagement_interactions(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  reason              text,
  evidence_needed     text,
  status              text DEFAULT 'proposed',
  approved_by         text,
  approved_at         timestamptz,
  notes               text
);

CREATE TABLE IF NOT EXISTS engagement_sector_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  name                  text NOT NULL,
  audience_types        text[],
  description           text,
  common_operating_model text,
  common_admin_pressures text[],
  typical_stakeholders  text[],
  common_systems        text[],
  common_data_types     text[],
  relevant_risk_areas   text[],
  starting_language     text,
  questions_to_explore  text[],
  common_objections     text[],
  relevant_pain_point_ids uuid[],
  potential_pathways    text[],
  evidence_sources      text[],
  content_owner         text,
  review_date           date,
  status                text DEFAULT 'approved'
);

CREATE TABLE IF NOT EXISTS engagement_personas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  persona_name        text NOT NULL,
  typical_role        text,
  goals               text[],
  pressures           text[],
  decision_responsibilities text[],
  likely_concerns     text[],
  information_needed  text[],
  useful_questions    text[],
  language_to_avoid   text[],
  preferred_detail    text,
  possible_channels   text[],
  evidence_status     text DEFAULT 'hypothesis',
  status              text DEFAULT 'approved'
);

CREATE TABLE IF NOT EXISTS engagement_scripts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  title           text NOT NULL,
  channel         text NOT NULL,
  tone            text,
  audience_type   text,
  industry        text,
  block_type      text,
  content         text NOT NULL,
  placeholders    jsonb DEFAULT '[]'::jsonb,
  version         integer DEFAULT 1,
  status          text DEFAULT 'approved',
  content_owner   text,
  last_reviewed   date
);

CREATE TABLE IF NOT EXISTS engagement_objections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  objection     text NOT NULL,
  response      text NOT NULL,
  category      text,
  tone          text,
  status        text DEFAULT 'approved',
  content_owner text,
  last_reviewed date
);

-- ----------------------------------------------------------------
-- 3. Pricing tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_pricing_rules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  name            text NOT NULL,
  category        text NOT NULL,
  band_low        numeric,
  band_expected   numeric,
  band_high       numeric,
  unit            text DEFAULT 'project',
  description     text,
  inclusions      text[],
  factor_weights  jsonb DEFAULT '{}'::jsonb,
  status          text DEFAULT 'active',
  internal_only   boolean DEFAULT true,
  last_reviewed   date
);

CREATE TABLE IF NOT EXISTS engagement_quotes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  opportunity_id  uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  organisation_id uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  scope_summary   text,
  factors         jsonb DEFAULT '{}'::jsonb,
  range_low       numeric,
  range_expected  numeric,
  range_high      numeric,
  cost_drivers    text[],
  missing_info    text[],
  recommended_package text,
  status          text DEFAULT 'draft',
  approved_by     text,
  approved_at     timestamptz,
  internal_notes  text,
  is_binding      boolean DEFAULT false
);

-- ----------------------------------------------------------------
-- 4. Workflow reviews
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_workflow_reviews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  opportunity_id    uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  organisation_id   uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  scope             text,
  processes_included text[],
  systems_included  text[],
  stakeholders      text[],
  data_categories   text[],
  vat_findings      jsonb DEFAULT '{}'::jsonb,
  recommendations   text[],
  evidence_needed   text[],
  status            text DEFAULT 'draft',
  owner_email       text
);

-- ----------------------------------------------------------------
-- 5. Systems catalogue
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_systems (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  category    text,
  description text,
  common_in   text[]
);

CREATE TABLE IF NOT EXISTS engagement_organisation_systems (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES engagement_organisations(id) ON DELETE CASCADE,
  system_id       uuid REFERENCES engagement_systems(id) ON DELETE SET NULL,
  system_name     text,
  notes           text,
  confidence      text DEFAULT 'hypothesis'
);

-- ----------------------------------------------------------------
-- 6. Compliance / audit
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_suppression_list (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  email       text,
  domain      text,
  reason      text,
  added_by    text,
  expires_at  timestamptz
);

CREATE TABLE IF NOT EXISTS engagement_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  table_name  text NOT NULL,
  record_id   uuid,
  action      text NOT NULL,
  changed_by  text,
  old_data    jsonb,
  new_data    jsonb
);

-- ----------------------------------------------------------------
-- 7. Knowledge library content versions
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_content_versions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  table_name    text NOT NULL,
  record_id     uuid NOT NULL,
  version       integer NOT NULL,
  snapshot      jsonb NOT NULL,
  changed_by    text,
  change_notes  text
);

-- ----------------------------------------------------------------
-- 8. Sources
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS engagement_sources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  title       text NOT NULL,
  url         text,
  author      text,
  published   date,
  content_type text,
  notes       text,
  last_checked date,
  status      text DEFAULT 'active'
);

-- ----------------------------------------------------------------
-- 9. Updated-at triggers
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION engagement_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'engagement_organisations','engagement_contacts','engagement_opportunities',
    'engagement_interactions','engagement_tasks','engagement_pain_points',
    'engagement_vat_prompts','engagement_recommendation_rules',
    'engagement_sector_profiles','engagement_personas','engagement_scripts',
    'engagement_objections','engagement_pricing_rules','engagement_quotes',
    'engagement_workflow_reviews','engagement_sources'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated ON %s;
       CREATE TRIGGER trg_%s_updated
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION engagement_set_updated_at();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;
