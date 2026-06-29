-- Provide a SECURITY DEFINER function for inserting into prospect_outreach_catalog.
-- This runs as the table owner (postgres) regardless of the calling role, so it
-- bypasses RLS entirely and works even if the service_role key is misconfigured.
--
-- Call via: supabase.rpc('insert_prospect_catalog_entry', { ... })

CREATE OR REPLACE FUNCTION public.insert_prospect_catalog_entry(
  p_id                  text,
  p_organisation_name   text,
  p_organisation_type   text DEFAULT 'Other',
  p_location            text DEFAULT '',
  p_region              text DEFAULT '',
  p_need_score          integer DEFAULT 3,
  p_decision_maker_name text DEFAULT '',
  p_decision_maker_role text DEFAULT '',
  p_email               text DEFAULT '',
  p_phone               text DEFAULT '',
  p_research_date       text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_row prospect_outreach_catalog%ROWTYPE;
BEGIN
  INSERT INTO prospect_outreach_catalog (
    id,
    organisation_name,
    organisation_type,
    location,
    region,
    website,
    employees,
    annual_revenue_gbp,
    revenue_basis,
    need_score,
    need_rationale,
    data_confidence,
    research_date,
    priority_region,
    decision_maker_name,
    decision_maker_role,
    email,
    phone,
    financial_source_url,
    contact_source_url,
    sector_tags,
    pain_point_tags,
    engagement_approach
  ) VALUES (
    p_id,
    p_organisation_name,
    p_organisation_type,
    p_location,
    p_region,
    '',
    NULL,
    NULL,
    '',
    p_need_score,
    '',
    'Medium',
    COALESCE(NULLIF(p_research_date, ''), to_char(now(), 'YYYY-MM-DD')),
    'secondary',
    p_decision_maker_name,
    p_decision_maker_role,
    p_email,
    p_phone,
    '',
    '',
    '{}',
    '{}',
    ''
  )
  RETURNING * INTO inserted_row;

  RETURN row_to_json(inserted_row);
END;
$$;

-- Allow authenticated users (platform admins) and service_role to call this function
GRANT EXECUTE ON FUNCTION public.insert_prospect_catalog_entry TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_prospect_catalog_entry TO service_role;
