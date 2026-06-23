-- Studio roles: platform_admin (full Studio) vs member (limited sections).
-- Add members manually, e.g.:
--   INSERT INTO studio_members (user_id, role)
--   SELECT id, 'platform_admin' FROM auth.users WHERE email = 'you@example.com';

CREATE TABLE IF NOT EXISTS studio_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('platform_admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_members_role_idx ON studio_members (role);

ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM studio_members
    WHERE user_id = auth.uid()
      AND role = 'platform_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_studio_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM studio_members
    WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_studio_member() TO authenticated;

-- Members can read their own row (for middleware / layout role lookup)
CREATE POLICY studio_members_select_own
  ON studio_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Platform admins can manage membership
CREATE POLICY studio_members_admin_all
  ON studio_members
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ── AI chat tables: platform admins only ─────────────────────────────────────

ALTER TABLE IF EXISTS ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_chat_activity_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_chat_sessions_admin ON ai_chat_sessions;
CREATE POLICY ai_chat_sessions_admin
  ON ai_chat_sessions
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS ai_chat_messages_admin ON ai_chat_messages;
CREATE POLICY ai_chat_messages_admin
  ON ai_chat_messages
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS ai_chat_activity_snapshots_admin ON ai_chat_activity_snapshots;
CREATE POLICY ai_chat_activity_snapshots_admin
  ON ai_chat_activity_snapshots
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ── Enquiries: any studio member ───────────────────────────────────────────

ALTER TABLE IF EXISTS enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enquiries_studio_select ON enquiries;
CREATE POLICY enquiries_studio_select
  ON enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS enquiries_studio_write ON enquiries;
CREATE POLICY enquiries_studio_write
  ON enquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS enquiries_studio_update ON enquiries;
CREATE POLICY enquiries_studio_update
  ON enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS enquiries_studio_delete ON enquiries;
CREATE POLICY enquiries_studio_delete
  ON enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_platform_admin());

-- ── Content hub tables: any studio member ────────────────────────────────────

ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_studio ON posts;
CREATE POLICY posts_studio
  ON posts
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS authors_studio ON authors;
CREATE POLICY authors_studio
  ON authors
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS social_posts_studio ON social_posts;
CREATE POLICY social_posts_studio
  ON social_posts
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

-- ── Knowledge hub (read): studio members; writes: platform admins ────────────

ALTER TABLE IF EXISTS engagement_sector_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS engagement_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS engagement_pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS engagement_vat_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS engagement_sectors_read ON engagement_sector_profiles;
CREATE POLICY engagement_sectors_read
  ON engagement_sector_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS engagement_sectors_admin_write ON engagement_sector_profiles;
CREATE POLICY engagement_sectors_admin_write
  ON engagement_sector_profiles
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_personas_read ON engagement_personas;
CREATE POLICY engagement_personas_read
  ON engagement_personas
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS engagement_personas_admin_write ON engagement_personas;
CREATE POLICY engagement_personas_admin_write
  ON engagement_personas
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_pain_points_read ON engagement_pain_points;
CREATE POLICY engagement_pain_points_read
  ON engagement_pain_points
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS engagement_pain_points_admin_write ON engagement_pain_points;
CREATE POLICY engagement_pain_points_admin_write
  ON engagement_pain_points
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_vat_prompts_read ON engagement_vat_prompts;
CREATE POLICY engagement_vat_prompts_read
  ON engagement_vat_prompts
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS engagement_vat_prompts_admin_write ON engagement_vat_prompts;
CREATE POLICY engagement_vat_prompts_admin_write
  ON engagement_vat_prompts
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ── CRM / engagement ops: platform admins only ───────────────────────────────

ALTER TABLE IF EXISTS engagement_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS engagement_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS engagement_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prospect_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS engagement_contacts_admin ON engagement_contacts;
CREATE POLICY engagement_contacts_admin
  ON engagement_contacts
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_contacts_member_read ON engagement_contacts;
CREATE POLICY engagement_contacts_member_read
  ON engagement_contacts
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS engagement_opportunities_admin ON engagement_opportunities;
CREATE POLICY engagement_opportunities_admin
  ON engagement_opportunities
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_opportunities_member ON engagement_opportunities;
CREATE POLICY engagement_opportunities_member
  ON engagement_opportunities
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS engagement_tasks_admin ON engagement_tasks;
CREATE POLICY engagement_tasks_admin
  ON engagement_tasks
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS engagement_tasks_member ON engagement_tasks;
CREATE POLICY engagement_tasks_member
  ON engagement_tasks
  FOR ALL
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS prospect_queue_admin ON prospect_queue;
CREATE POLICY prospect_queue_admin
  ON prospect_queue
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());