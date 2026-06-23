-- Prospect outreach workflow: editable overrides, structured queue snapshots, member access

CREATE TABLE IF NOT EXISTS prospect_outreach_overrides (
  outreach_id text PRIMARY KEY,
  overrides jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prospect_queue
  ADD COLUMN IF NOT EXISTS outreach_id text,
  ADD COLUMN IF NOT EXISTS outreach_snapshot jsonb;

CREATE INDEX IF NOT EXISTS idx_prospect_queue_outreach_id
  ON prospect_queue (outreach_id)
  WHERE outreach_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_queue_outreach_id_unique
  ON prospect_queue (outreach_id)
  WHERE outreach_id IS NOT NULL;

-- Studio members may use prospect queue and AI assistant (prospect context)
DROP POLICY IF EXISTS prospect_queue_admin ON prospect_queue;
CREATE POLICY prospect_queue_admin
  ON prospect_queue
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS ai_chat_sessions_admin ON ai_chat_sessions;
CREATE POLICY ai_chat_sessions_studio
  ON ai_chat_sessions
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS ai_chat_messages_admin ON ai_chat_messages;
CREATE POLICY ai_chat_messages_studio
  ON ai_chat_messages
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS ai_chat_activity_snapshots_admin ON ai_chat_activity_snapshots;
CREATE POLICY ai_chat_activity_snapshots_studio
  ON ai_chat_activity_snapshots
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

ALTER TABLE prospect_outreach_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prospect_outreach_overrides_admin ON prospect_outreach_overrides;
CREATE POLICY prospect_outreach_overrides_admin
  ON prospect_outreach_overrides
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());