-- Journey workflow: outreach AI context, review notes, linked chat sessions

ALTER TABLE prospect_outreach_overrides
  ADD COLUMN IF NOT EXISTS review_notes text;

-- Extend AI chat context types to include outreach
ALTER TABLE ai_chat_sessions DROP CONSTRAINT IF EXISTS ai_chat_sessions_context_type_check;
ALTER TABLE ai_chat_sessions ADD CONSTRAINT ai_chat_sessions_context_type_check
  CHECK (context_type IN ('enquiry', 'client', 'prospect', 'outreach'));

ALTER TABLE ai_chat_activity_snapshots DROP CONSTRAINT IF EXISTS ai_chat_activity_snapshots_context_type_check;
ALTER TABLE ai_chat_activity_snapshots ADD CONSTRAINT ai_chat_activity_snapshots_context_type_check
  CHECK (context_type IN ('enquiry', 'client', 'prospect', 'outreach'));