-- Studio content topic library: active ideas, archived after use, AI can add more.

CREATE TABLE IF NOT EXISTS studio_content_topics (
  id            text PRIMARY KEY,
  category      text NOT NULL,
  title         text NOT NULL,
  angle         text NOT NULL,
  formats       text[] NOT NULL DEFAULT '{}',
  source        text NOT NULL DEFAULT 'seed'
                CHECK (source IN ('seed', 'ai')),
  status        text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'used', 'archived')),
  research_note text,
  used_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_content_topics_status
  ON studio_content_topics (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_content_topics_category
  ON studio_content_topics (category);

ALTER TABLE studio_content_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_studio_content_topics" ON studio_content_topics;
CREATE POLICY "service_role_all_studio_content_topics"
  ON studio_content_topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_studio_content_topics" ON studio_content_topics;
CREATE POLICY "authenticated_studio_content_topics"
  ON studio_content_topics
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());
