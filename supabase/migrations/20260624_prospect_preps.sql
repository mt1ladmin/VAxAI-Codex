-- ================================================================
-- VAxAI Studio – Prospect Prep History
-- Persists built prospect preps (replaces browser localStorage)
-- ================================================================

CREATE TABLE IF NOT EXISTS engagement_prospect_preps (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  name                text NOT NULL,
  client_type         text,
  prep_notes          text,
  sector_snapshot     jsonb,
  persona_snapshot    jsonb,
  relevant_pains      jsonb NOT NULL DEFAULT '[]'::jsonb,
  relevant_vats       jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords            text[],
  content_fingerprint text NOT NULL,
  created_by          text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_prospect_preps_fingerprint
  ON engagement_prospect_preps (content_fingerprint);

CREATE INDEX IF NOT EXISTS idx_engagement_prospect_preps_created_at
  ON engagement_prospect_preps (created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_engagement_prospect_preps_updated_at') THEN
    CREATE TRIGGER set_engagement_prospect_preps_updated_at
      BEFORE UPDATE ON engagement_prospect_preps
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;