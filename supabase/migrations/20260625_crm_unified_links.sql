-- ================================================================
-- VAxAI Studio – Unified CRM links (enquiries ↔ contacts ↔ preps)
-- ================================================================

ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organisation_id uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sector_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS persona_snapshot jsonb;

CREATE INDEX IF NOT EXISTS idx_enquiries_contact_id ON enquiries (contact_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_organisation_id ON enquiries (organisation_id);

ALTER TABLE engagement_prospect_preps
  ADD COLUMN IF NOT EXISTS enquiry_id uuid,
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES engagement_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organisation_id uuid REFERENCES engagement_organisations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS queue_id uuid,
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_label text;

CREATE INDEX IF NOT EXISTS idx_engagement_prospect_preps_enquiry_id
  ON engagement_prospect_preps (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_engagement_prospect_preps_contact_id
  ON engagement_prospect_preps (contact_id);