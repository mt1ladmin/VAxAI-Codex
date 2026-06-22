-- Add AI structured data column to engagement_interactions
-- Stores the approved AI-structured summary generated after a live call
ALTER TABLE engagement_interactions
  ADD COLUMN IF NOT EXISTS ai_structured_data jsonb;
