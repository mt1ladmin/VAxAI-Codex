-- Compact working account state + AI usage telemetry

CREATE TABLE IF NOT EXISTS engagement_account_state (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type  text NOT NULL CHECK (context_type IN ('enquiry', 'client', 'prospect', 'outreach')),
  context_id    text NOT NULL,
  state         jsonb NOT NULL DEFAULT '{}',
  last_updated  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (context_type, context_id)
);

CREATE INDEX IF NOT EXISTS idx_account_state_stale
  ON engagement_account_state (last_updated ASC);

CREATE TABLE IF NOT EXISTS ai_chat_usage_log (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                  uuid REFERENCES ai_chat_sessions(id) ON DELETE SET NULL,
  context_type                text NOT NULL,
  context_id                  text NOT NULL,
  intent                      text NOT NULL DEFAULT 'general',
  model                       text NOT NULL,
  input_tokens                int NOT NULL DEFAULT 0,
  output_tokens               int NOT NULL DEFAULT 0,
  cache_read_input_tokens     int NOT NULL DEFAULT 0,
  cache_creation_input_tokens int NOT NULL DEFAULT 0,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_session
  ON ai_chat_usage_log (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_context
  ON ai_chat_usage_log (context_type, context_id, created_at DESC);

ALTER TABLE engagement_account_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS engagement_account_state_studio ON engagement_account_state;
CREATE POLICY engagement_account_state_studio
  ON engagement_account_state
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS ai_chat_usage_log_studio ON ai_chat_usage_log;
CREATE POLICY ai_chat_usage_log_studio
  ON ai_chat_usage_log
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());