-- Structured CRM activity timeline for enquiries, prospect queue, and clients

CREATE TABLE IF NOT EXISTS engagement_activity_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  event_type      text NOT NULL,
  title           text NOT NULL,
  detail          text,
  metadata        jsonb NOT NULL DEFAULT '{}',
  enquiry_id      uuid REFERENCES enquiries(id) ON DELETE CASCADE,
  queue_id        uuid REFERENCES prospect_queue(id) ON DELETE CASCADE,
  contact_id      uuid REFERENCES engagement_contacts(id) ON DELETE CASCADE,
  opportunity_id  uuid REFERENCES engagement_opportunities(id) ON DELETE SET NULL,
  outreach_id     text,
  actor_email     text
);

CREATE INDEX IF NOT EXISTS idx_activity_log_enquiry
  ON engagement_activity_log (enquiry_id, created_at DESC)
  WHERE enquiry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_queue
  ON engagement_activity_log (queue_id, created_at DESC)
  WHERE queue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_contact
  ON engagement_activity_log (contact_id, created_at DESC)
  WHERE contact_id IS NOT NULL;

ALTER TABLE engagement_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS engagement_activity_log_studio ON engagement_activity_log;
CREATE POLICY engagement_activity_log_studio
  ON engagement_activity_log
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());