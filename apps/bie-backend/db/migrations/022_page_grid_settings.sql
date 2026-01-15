ALTER TABLE page_versions
  ADD COLUMN IF NOT EXISTS grid JSONB NOT NULL DEFAULT '{"columns":12,"gapPx":16,"rowHeight":48}'::jsonb;
