-- Add source field to enquiries to distinguish website form submissions from manually added records
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS source text;

-- Website enquiries already in the system won't have a source (null = unknown)
-- New ones will have source set by the API

COMMENT ON COLUMN enquiries.source IS 'How the enquiry was received: Website enquiry, Email, Direct approach, Phone, Event, Other, or free text';
