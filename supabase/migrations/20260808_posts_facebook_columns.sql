-- Persist Facebook connected copy and posted tracking on posts
-- (mirrors linkedin_post / instagram_caption + *_posted_at).

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS facebook_post TEXT,
  ADD COLUMN IF NOT EXISTS facebook_posted_at TIMESTAMPTZ;
