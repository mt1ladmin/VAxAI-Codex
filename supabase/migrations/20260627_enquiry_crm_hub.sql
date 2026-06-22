-- ================================================================
-- Enquiry CRM hub: link calls, opportunities, and activity to enquiries
-- ================================================================

ALTER TABLE engagement_interactions
  ADD COLUMN IF NOT EXISTS enquiry_id uuid;

ALTER TABLE engagement_opportunities
  ADD COLUMN IF NOT EXISTS enquiry_id uuid;

CREATE INDEX IF NOT EXISTS idx_engagement_interactions_enquiry_id
  ON engagement_interactions (enquiry_id);

CREATE INDEX IF NOT EXISTS idx_engagement_opportunities_enquiry_id
  ON engagement_opportunities (enquiry_id);