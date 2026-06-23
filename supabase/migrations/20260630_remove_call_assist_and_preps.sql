-- Remove Live Call Assist history and Prospect Prep data model

ALTER TABLE engagement_knowledge_drafts
  DROP COLUMN IF EXISTS source_call_id;

DROP TABLE IF EXISTS engagement_prospect_preps CASCADE;
DROP TABLE IF EXISTS engagement_interactions CASCADE;

ALTER TABLE enquiries
  DROP COLUMN IF EXISTS sector_snapshot,
  DROP COLUMN IF EXISTS persona_snapshot;