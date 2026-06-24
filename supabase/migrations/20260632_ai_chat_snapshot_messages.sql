-- Archive chat message bodies when a session is snapshotted (new chat / reset).
CREATE TABLE IF NOT EXISTS ai_chat_snapshot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES ai_chat_activity_snapshots(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_snapshot_messages_snapshot
  ON ai_chat_snapshot_messages (snapshot_id, sort_order);