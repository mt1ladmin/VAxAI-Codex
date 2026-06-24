-- Task source provenance for Tasks Tracker
ALTER TABLE engagement_tasks
  ADD COLUMN IF NOT EXISTS enquiry_id uuid REFERENCES enquiries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS queue_id uuid REFERENCES prospect_queue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_tasks_enquiry_id ON engagement_tasks(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_engagement_tasks_queue_id ON engagement_tasks(queue_id);

-- Backfill from linked opportunities
UPDATE engagement_tasks t
SET enquiry_id = o.enquiry_id
FROM engagement_opportunities o
WHERE t.opportunity_id = o.id AND t.enquiry_id IS NULL AND o.enquiry_id IS NOT NULL;

UPDATE engagement_tasks t
SET queue_id = o.queue_id
FROM engagement_opportunities o
WHERE t.opportunity_id = o.id AND t.queue_id IS NULL AND o.queue_id IS NOT NULL;

-- Knowledge attachments (one row per record; copied on journey handoff)
CREATE TABLE IF NOT EXISTS engagement_knowledge_attachments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  outreach_id         text,
  queue_id            uuid REFERENCES prospect_queue(id) ON DELETE CASCADE,
  enquiry_id          uuid REFERENCES enquiries(id) ON DELETE CASCADE,
  contact_id          uuid REFERENCES engagement_contacts(id) ON DELETE CASCADE,
  sector_ids          uuid[] NOT NULL DEFAULT '{}',
  persona_ids         uuid[] NOT NULL DEFAULT '{}',
  pain_point_ids      uuid[] NOT NULL DEFAULT '{}',
  CONSTRAINT engagement_knowledge_attachments_one_parent CHECK (
    num_nonnulls(outreach_id, queue_id, enquiry_id, contact_id) = 1
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eka_outreach ON engagement_knowledge_attachments(outreach_id) WHERE outreach_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_eka_queue ON engagement_knowledge_attachments(queue_id) WHERE queue_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_eka_enquiry ON engagement_knowledge_attachments(enquiry_id) WHERE enquiry_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_eka_contact ON engagement_knowledge_attachments(contact_id) WHERE contact_id IS NOT NULL;