-- Link opportunities back to prospect queue entries when created from the queue
ALTER TABLE engagement_opportunities
  ADD COLUMN IF NOT EXISTS queue_id uuid REFERENCES prospect_queue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_opportunities_queue_id
  ON engagement_opportunities (queue_id);