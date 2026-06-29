-- Remove recommendation rules — no longer used in the platform.
-- VAT prompts remain in the Knowledge Hub (vat_prompts tab).
DROP TABLE IF EXISTS engagement_recommendation_rules CASCADE;
