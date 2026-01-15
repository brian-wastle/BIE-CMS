-- Ensure updated_at helper exists
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Version status enum
DO $$ BEGIN
  CREATE TYPE page_version_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Pages base table: identifiers and pointers only
CREATE TABLE IF NOT EXISTS pages(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  latest_version_id UUID,
  published_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger on pages
DROP TRIGGER IF EXISTS trg_pages_updated_at ON pages;
CREATE TRIGGER trg_pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Versioned content table
CREATE TABLE IF NOT EXISTS page_versions(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version INT NOT NULL,
  status page_version_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  blocks JSONB NOT NULL,
  grid JSONB NOT NULL DEFAULT '{"columns":12,"gapPx":16,"rowHeight":48}'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}',
  created_by TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger on page_versions
DROP TRIGGER IF EXISTS trg_page_versions_updated_at ON page_versions;
CREATE TRIGGER trg_page_versions_updated_at
BEFORE UPDATE ON page_versions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Pointers from pages to latest/published versions
ALTER TABLE pages
  DROP CONSTRAINT IF EXISTS fk_pages_latest_version,
  ADD CONSTRAINT fk_pages_latest_version FOREIGN KEY (latest_version_id) REFERENCES page_versions(id) ON DELETE SET NULL;

ALTER TABLE pages
  DROP CONSTRAINT IF EXISTS fk_pages_published_version,
  ADD CONSTRAINT fk_pages_published_version FOREIGN KEY (published_version_id) REFERENCES page_versions(id) ON DELETE SET NULL;

-- Indexes / uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_versions_unique ON page_versions(page_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_versions_published_unique ON page_versions(page_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id_created_at ON page_versions(page_id, created_at DESC);
