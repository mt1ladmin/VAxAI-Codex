-- Processed files tracking for Supabase storage based prospect imports
CREATE TABLE IF NOT EXISTS prospect_processed_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  processed_at timestamptz NOT NULL DEFAULT now(),
  batch_id uuid REFERENCES prospect_import_batches(id) ON DELETE SET NULL
);

-- Optional: add index
CREATE INDEX IF NOT EXISTS idx_prospect_processed_files_path ON prospect_processed_files(storage_path);
