-- Prospect journey restructure: team members, finder workflow fields, outreach links

CREATE TABLE IF NOT EXISTS studio_team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  display_name  text NOT NULL,
  user_email    text,
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_team_members_display_name
  ON studio_team_members (lower(trim(display_name)));

CREATE INDEX IF NOT EXISTS idx_studio_team_members_active
  ON studio_team_members (is_active, sort_order);

ALTER TABLE prospect_outreach_overrides
  ADD COLUMN IF NOT EXISTS assigned_team_member_id uuid REFERENCES studio_team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS engagement_status text NOT NULL DEFAULT 'Not assigned',
  ADD COLUMN IF NOT EXISTS opportunity_description text,
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS next_action_date timestamptz,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pipeline_contact_id uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL;

ALTER TABLE engagement_opportunities
  ADD COLUMN IF NOT EXISTS outreach_id text,
  ADD COLUMN IF NOT EXISTS assigned_team_member_id uuid REFERENCES studio_team_members(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_opportunities_outreach_id
  ON engagement_opportunities (outreach_id)
  WHERE outreach_id IS NOT NULL;

ALTER TABLE engagement_tasks
  ADD COLUMN IF NOT EXISTS outreach_id text,
  ADD COLUMN IF NOT EXISTS assigned_team_member_id uuid REFERENCES studio_team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_outreach_id
  ON engagement_tasks (outreach_id)
  WHERE outreach_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_assigned_team_member
  ON engagement_tasks (assigned_team_member_id)
  WHERE assigned_team_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prospect_outreach_overrides_assigned
  ON prospect_outreach_overrides (assigned_team_member_id)
  WHERE assigned_team_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prospect_outreach_overrides_engagement_status
  ON prospect_outreach_overrides (engagement_status);

-- Seed initial assignable team members (idempotent)
INSERT INTO studio_team_members (display_name, sort_order)
SELECT v.display_name, v.sort_order
FROM (VALUES
  ('Becky', 1),
  ('Thesia', 2),
  ('Gercia', 3)
) AS v(display_name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM studio_team_members m WHERE lower(trim(m.display_name)) = lower(trim(v.display_name))
);

ALTER TABLE studio_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS studio_team_members_read ON studio_team_members;
CREATE POLICY studio_team_members_read
  ON studio_team_members
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS studio_team_members_admin ON studio_team_members;
CREATE POLICY studio_team_members_admin
  ON studio_team_members
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Backfill engagement status for existing overrides with assignments
UPDATE prospect_outreach_overrides
SET engagement_status = 'Assigned'
WHERE assigned_team_member_id IS NOT NULL
  AND engagement_status = 'Not assigned';