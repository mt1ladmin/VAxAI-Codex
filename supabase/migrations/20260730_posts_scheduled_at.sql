-- Ensure posts table supports scheduled status and scheduled_at timestamp.
-- Safe to run: all statements use IF NOT EXISTS / IF EXISTS / DO NOTHING guards.

-- 1. Add scheduled_at column if it doesn't exist
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 2. Drop any CHECK constraint that restricts status to only 'draft'/'published'
--    (list common constraint names; all DROP IF EXISTS so safe if they don't exist)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_status;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_posts_status;

-- 3. Ensure status column exists and can hold 'scheduled'
--    (status is plain text — no enum, no constraint needed beyond application logic)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- 4. Index to make calendar queries fast
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
