-- ================================================================
-- VAxAI Studio – AI & Prospect Management Extension
-- ================================================================

-- prospect_import_batches: tracks CSV upload sessions
CREATE TABLE IF NOT EXISTS prospect_import_batches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  filename        text NOT NULL,
  original_csv    text NOT NULL,  -- raw CSV text
  column_mapping  jsonb,          -- user's column mapping choices
  row_count       integer,
  imported_count  integer DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending', -- pending, reviewing, imported, failed
  notes           text,
  created_by      text
);

-- prospect_queue: work queue entries from CSV imports or manual additions
CREATE TABLE IF NOT EXISTS prospect_queue (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  import_batch_id     uuid REFERENCES prospect_import_batches(id) ON DELETE SET NULL,
  organisation_id     uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  contact_id          uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  -- raw prospect data (from CSV or manual entry)
  raw_org_name        text,
  raw_contact_name    text,
  raw_email           text,
  raw_phone           text,
  raw_website         text,
  raw_industry        text,
  raw_location        text,
  raw_linkedin        text,
  raw_notes           text,
  -- queue management
  status              text NOT NULL DEFAULT 'Needs review',
  -- statuses: Needs review, Ready to contact, Contact planned, Contact attempted,
  --           No response, Conversation held, Follow-up required, Opportunity,
  --           Not suitable, Do not contact, Closed
  last_action         text,
  last_action_date    timestamptz,
  next_action         text,
  next_action_date    timestamptz,
  duplicate_of_org_id uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  duplicate_warning   text,
  previous_contact_warning text,
  owner_email         text,
  tags                text[]
);

-- engagement_knowledge_drafts: AI-created draft pain points for review
CREATE TABLE IF NOT EXISTS engagement_knowledge_drafts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  -- source context
  source_phrase       text,       -- the original phrase that triggered the draft
  source_call_id      uuid REFERENCES engagement_interactions(id) ON DELETE SET NULL,
  source_org_id       uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  -- draft content (mirrors pain_points structure)
  category            text,
  title               text NOT NULL,
  plain_english_definition text,
  what_person_says    text[],
  what_this_means     text[],
  what_not_assume     text[],
  common_root_causes  text[],
  natural_questions   text[],
  possible_automation text[],
  possible_ai         text[],
  human_va_responsibilities text[],
  recommendation_pathways text[],
  related_pain_point_ids uuid[],
  tags                text[],
  -- review workflow
  status              text NOT NULL DEFAULT 'pending_review', -- pending_review, approved, rejected, merged
  reviewer_notes      text,
  merged_into_id      uuid REFERENCES engagement_pain_points(id) ON DELETE SET NULL,
  reviewed_by         text,
  reviewed_at         timestamptz,
  created_by          text
);

-- triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_prospect_import_batches_updated_at') THEN
    CREATE TRIGGER set_prospect_import_batches_updated_at BEFORE UPDATE ON prospect_import_batches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_prospect_queue_updated_at') THEN
    CREATE TRIGGER set_prospect_queue_updated_at BEFORE UPDATE ON prospect_queue FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_engagement_knowledge_drafts_updated_at') THEN
    CREATE TRIGGER set_engagement_knowledge_drafts_updated_at BEFORE UPDATE ON engagement_knowledge_drafts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;
