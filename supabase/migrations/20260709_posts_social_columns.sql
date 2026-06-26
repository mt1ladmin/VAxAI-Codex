-- Add social content columns to posts table so sharing captions and
-- social media posts are persisted in the database rather than browser storage.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS sharing_caption  TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_post    TEXT,
  ADD COLUMN IF NOT EXISTS instagram_caption TEXT,
  ADD COLUMN IF NOT EXISTS social_hashtags  TEXT[] NOT NULL DEFAULT '{}';
