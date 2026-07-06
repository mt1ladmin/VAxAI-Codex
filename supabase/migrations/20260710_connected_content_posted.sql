-- Track when connected / social content has been manually posted.

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS linkedin_posted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sharing_posted_at   TIMESTAMPTZ;