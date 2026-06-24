-- Retire legacy prospect_queue table (unified Prospect Queue uses engagement_opportunities + contacts)

ALTER TABLE IF EXISTS engagement_opportunities
  DROP CONSTRAINT IF EXISTS engagement_opportunities_queue_id_fkey;

ALTER TABLE IF EXISTS engagement_tasks
  DROP CONSTRAINT IF EXISTS engagement_tasks_queue_id_fkey;

ALTER TABLE IF EXISTS engagement_activity_log
  DROP CONSTRAINT IF EXISTS engagement_activity_log_queue_id_fkey;

ALTER TABLE IF EXISTS engagement_knowledge_attachments
  DROP CONSTRAINT IF EXISTS engagement_knowledge_attachments_queue_id_fkey;

ALTER TABLE IF EXISTS engagement_opportunities DROP COLUMN IF EXISTS queue_id;
ALTER TABLE IF EXISTS engagement_tasks DROP COLUMN IF EXISTS queue_id;
ALTER TABLE IF EXISTS engagement_activity_log DROP COLUMN IF EXISTS queue_id;
ALTER TABLE IF EXISTS engagement_knowledge_attachments DROP COLUMN IF EXISTS queue_id;

DROP TABLE IF EXISTS prospect_queue CASCADE;