-- Add service-fit summary fields to enquiries table
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS service_fit_summary text,
  ADD COLUMN IF NOT EXISTS likely_need         text,
  ADD COLUMN IF NOT EXISTS complexity_level    text,
  ADD COLUMN IF NOT EXISTS engagement_basis    text;
