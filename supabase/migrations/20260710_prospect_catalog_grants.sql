-- Ensure service_role and authenticated role have the correct table-level
-- privileges on prospect_outreach_catalog and prospect_outreach_overrides.
--
-- createServiceClient() uses the service_role key which bypasses RLS, but some
-- Supabase project configurations still require an explicit GRANT at the object
-- level before the role can perform writes. This migration is idempotent.

GRANT ALL ON TABLE prospect_outreach_catalog TO service_role;
GRANT ALL ON TABLE prospect_outreach_catalog TO authenticated;

GRANT ALL ON TABLE prospect_outreach_overrides TO service_role;
GRANT ALL ON TABLE prospect_outreach_overrides TO authenticated;

-- Ensure the policy covers INSERT specifically (belt-and-braces alongside the
-- existing FOR ALL policy, which some engines evaluate differently for writes).
DROP POLICY IF EXISTS prospect_outreach_catalog_insert ON prospect_outreach_catalog;
CREATE POLICY prospect_outreach_catalog_insert ON prospect_outreach_catalog
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS prospect_outreach_overrides_insert ON prospect_outreach_overrides;
CREATE POLICY prospect_outreach_overrides_insert ON prospect_outreach_overrides
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());
