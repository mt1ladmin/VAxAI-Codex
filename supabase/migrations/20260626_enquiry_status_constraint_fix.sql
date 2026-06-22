-- ================================================================
-- Fix website enquiry status updates
-- Drops legacy status constraints, ensures workflow columns exist,
-- and migrates old status values to prospect-queue equivalents.
-- Safe to run multiple times.
-- ================================================================

-- Workflow columns (from 20260622)
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS next_action_date date,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS last_action text,
  ADD COLUMN IF NOT EXISTS last_action_date timestamptz;

-- CRM link columns (from 20260625) — engagement tables must exist first
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS contact_id uuid,
  ADD COLUMN IF NOT EXISTS organisation_id uuid,
  ADD COLUMN IF NOT EXISTS sector_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS persona_snapshot jsonb;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'engagement_contacts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'enquiries_contact_id_fkey'
    ) THEN
      ALTER TABLE enquiries
        ADD CONSTRAINT enquiries_contact_id_fkey
        FOREIGN KEY (contact_id) REFERENCES engagement_contacts(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'engagement_organisations') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'enquiries_organisation_id_fkey'
    ) THEN
      ALTER TABLE enquiries
        ADD CONSTRAINT enquiries_organisation_id_fkey
        FOREIGN KEY (organisation_id) REFERENCES engagement_organisations(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Drop legacy CHECK constraints that only allowed old status values
-- (new, contacted, no_reply, following_up, met, completed, etc.)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'enquiries'
      AND c.contype = 'c'
      AND (
        pg_get_constraintdef(c.oid) ILIKE '%status%'
        OR c.conname ILIKE '%status%'
      )
  LOOP
    EXECUTE format('ALTER TABLE enquiries DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- If status was created as an enum, convert to plain text
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT c.udt_name INTO col_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'enquiries'
    AND c.column_name = 'status';

  IF col_type IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_type t
    WHERE t.typname = col_type AND t.typtype = 'e'
  ) THEN
    ALTER TABLE enquiries ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE enquiries ALTER COLUMN status TYPE text USING status::text;
  END IF;
END $$;

-- Migrate legacy values to prospect-queue statuses
UPDATE enquiries SET status = 'Needs review' WHERE status IN ('new', 'open') OR status IS NULL OR btrim(status) = '';
UPDATE enquiries SET status = 'Contact attempted' WHERE status = 'contacted';
UPDATE enquiries SET status = 'No response' WHERE status = 'no_reply';
UPDATE enquiries SET status = 'Follow-up required' WHERE status = 'following_up';
UPDATE enquiries SET status = 'Conversation held' WHERE status = 'met';
UPDATE enquiries SET status = 'Closed' WHERE status = 'completed';

ALTER TABLE enquiries ALTER COLUMN status SET DEFAULT 'Needs review';