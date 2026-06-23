-- Log VAxAI Assistant chat sessions in the activity timeline
CREATE TABLE IF NOT EXISTS ai_chat_activity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('enquiry', 'client', 'prospect')),
  context_id TEXT NOT NULL,
  title TEXT,
  message_count INT NOT NULL DEFAULT 0,
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_activity_context
  ON ai_chat_activity_snapshots (context_type, context_id, ended_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_chat_activity_session
  ON ai_chat_activity_snapshots (session_id, ended_at DESC);