-- Store pain point snapshots on website enquiries (alongside sector/persona)
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS pain_points_snapshot jsonb DEFAULT '[]'::jsonb;