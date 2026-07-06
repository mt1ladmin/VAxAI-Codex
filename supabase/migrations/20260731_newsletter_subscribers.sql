-- Newsletter sign-ups from the VAxAI public site (footer form and popup).

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email         text PRIMARY KEY,
  name          text,
  source        text NOT NULL DEFAULT 'footer',
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter_subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_select_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "authenticated_select_newsletter_subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS "service_role_all_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "service_role_all_newsletter_subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);