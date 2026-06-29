-- Align website enquiries with prospect finder:
-- 1. Add assignee, is_client, client_note columns
-- 2. Reset old statuses to new finder status set
-- 3. Update DB default status

ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS assigned_team_member_id uuid REFERENCES studio_team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_client boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_note text;

CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_team_member ON enquiries(assigned_team_member_id);

-- Migrate old status values to the new unified set
UPDATE enquiries SET status = '' WHERE status IN (
  'Needs review', 'Ready to contact', 'Contact planned', 'Do not contact', 'Closed'
) OR status IS NULL OR btrim(status) = '';

UPDATE enquiries SET status = 'Follow up required' WHERE status = 'Follow-up required';
UPDATE enquiries SET status = 'Opportunity identified' WHERE status = 'Opportunity';

-- Update the DB column default
ALTER TABLE enquiries ALTER COLUMN status SET DEFAULT '';
