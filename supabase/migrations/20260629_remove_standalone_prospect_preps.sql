-- Remove standalone prospect prep history (not linked to any account record).
-- Account-linked preps on enquiries, prospect queue, and opportunities are kept.

DELETE FROM engagement_prospect_preps
WHERE enquiry_id IS NULL
  AND queue_id IS NULL
  AND contact_id IS NULL
  AND organisation_id IS NULL;