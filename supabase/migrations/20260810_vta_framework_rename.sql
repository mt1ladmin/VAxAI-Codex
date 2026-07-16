-- ================================================================
-- Rename framework branding: VAT Framework → VTA Framework
-- Order: Value, Trust, Alignment (not Value, Alignment, Trust)
-- Updates published/draft posts, social copy, and Knowledge Hub text.
-- Does not change UK tax "VAT" or column/table names (e.g. vat_prompts).
-- ================================================================

-- Helper: apply framework renames to a text value (ordered longest first)
CREATE OR REPLACE FUNCTION public.vaxai_rename_vta_framework(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
      coalesce(t, ''),
      'Value, Alignment and Trust (VAT) Framework', 'Value, Trust and Alignment (VTA) Framework'),
      'Value, Alignment and Trust (VAT)', 'Value, Trust and Alignment (VTA)'),
      'Value, Alignment, Trust (VAT)', 'Value, Trust, Alignment (VTA)'),
      'Value / Alignment / Trust', 'Value / Trust / Alignment'),
      'Value, Alignment and Trust', 'Value, Trust and Alignment'),
      'Value, Alignment, Trust', 'Value, Trust, Alignment'),
      'value, alignment and trust', 'value, trust and alignment'),
      'value, alignment, trust', 'value, trust, alignment'),
      'VAT Framework', 'VTA Framework'),
      'VAT framework', 'VTA Framework'),
      'VAT-informed', 'VTA-informed'),
      'VAT thinking', 'VTA thinking'),
      'VAT review', 'VTA review'),
      'VAT prompts', 'VTA prompts')
$$;

-- ----------------------------------------------------------------
-- Posts (blog + connected social copy)
-- ----------------------------------------------------------------
UPDATE posts SET
  title = public.vaxai_rename_vta_framework(title),
  description = public.vaxai_rename_vta_framework(description),
  body_html = public.vaxai_rename_vta_framework(body_html),
  linkedin_post = public.vaxai_rename_vta_framework(linkedin_post),
  instagram_caption = public.vaxai_rename_vta_framework(instagram_caption),
  sharing_caption = public.vaxai_rename_vta_framework(sharing_caption),
  facebook_post = public.vaxai_rename_vta_framework(facebook_post)
WHERE
  coalesce(title, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(description, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(body_html, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(linkedin_post, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(instagram_caption, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(sharing_caption, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(facebook_post, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

-- Social posts calendar (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'social_posts'
  ) THEN
    UPDATE social_posts SET
      title = public.vaxai_rename_vta_framework(title),
      description = public.vaxai_rename_vta_framework(description),
      content = public.vaxai_rename_vta_framework(content)
    WHERE
      coalesce(title, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
      OR coalesce(description, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
      OR coalesce(content, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';
  END IF;
END $$;

-- ----------------------------------------------------------------
-- Knowledge Hub / engagement libraries
-- ----------------------------------------------------------------
UPDATE engagement_vat_prompts SET
  prompt = public.vaxai_rename_vta_framework(prompt)
WHERE coalesce(prompt, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

UPDATE engagement_scripts SET
  content = public.vaxai_rename_vta_framework(content)
WHERE coalesce(content, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

UPDATE engagement_objections SET
  objection = public.vaxai_rename_vta_framework(objection),
  response = public.vaxai_rename_vta_framework(response)
WHERE
  coalesce(objection, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(response, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

UPDATE engagement_pain_points SET
  plain_english_definition = public.vaxai_rename_vta_framework(plain_english_definition),
  explanation_to_prospect = public.vaxai_rename_vta_framework(explanation_to_prospect)
WHERE
  coalesce(plain_english_definition, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(explanation_to_prospect, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

UPDATE engagement_sector_profiles SET
  description = public.vaxai_rename_vta_framework(description),
  starting_language = public.vaxai_rename_vta_framework(starting_language)
WHERE
  coalesce(description, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  OR coalesce(starting_language, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

UPDATE engagement_pricing_rules SET
  description = public.vaxai_rename_vta_framework(description)
WHERE coalesce(description, '') ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)';

-- Array fields on pricing (inclusions)
UPDATE engagement_pricing_rules SET
  inclusions = (
    SELECT array_agg(public.vaxai_rename_vta_framework(x) ORDER BY ord)
    FROM unnest(inclusions) WITH ORDINALITY AS u(x, ord)
  )
WHERE inclusions IS NOT NULL
  AND exists (
    SELECT 1 FROM unnest(inclusions) AS i
    WHERE i ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  );

-- Array fields on pain points pathways if present
UPDATE engagement_pain_points SET
  recommendation_pathways = (
    SELECT array_agg(public.vaxai_rename_vta_framework(x) ORDER BY ord)
    FROM unnest(recommendation_pathways) WITH ORDINALITY AS u(x, ord)
  )
WHERE recommendation_pathways IS NOT NULL
  AND exists (
    SELECT 1 FROM unnest(recommendation_pathways) AS i
    WHERE i ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  );

UPDATE engagement_pain_points SET
  possible_ai = (
    SELECT array_agg(public.vaxai_rename_vta_framework(x) ORDER BY ord)
    FROM unnest(possible_ai) WITH ORDINALITY AS u(x, ord)
  )
WHERE possible_ai IS NOT NULL
  AND exists (
    SELECT 1 FROM unnest(possible_ai) AS i
    WHERE i ~* 'VAT Framework|Value, Alignment|VAT-informed|VAT thinking|VAT review|\(VAT\)'
  );

-- Optional: keep helper for future renames; safe to leave
-- DROP FUNCTION IF EXISTS public.vaxai_rename_vta_framework(text);
