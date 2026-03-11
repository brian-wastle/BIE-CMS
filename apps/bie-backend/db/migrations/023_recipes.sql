-- Recipe pages and versions

-- Base table for recipe pages
CREATE TABLE IF NOT EXISTS recipe_pages(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  latest_version_id UUID,
  published_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger on recipe_pages
DROP TRIGGER IF EXISTS trg_recipe_pages_updated_at ON recipe_pages;
CREATE TRIGGER trg_recipe_pages_updated_at
BEFORE UPDATE ON recipe_pages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Versioned content table
CREATE TABLE IF NOT EXISTS recipe_versions(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES recipe_pages(id) ON DELETE CASCADE,
  version INT NOT NULL,
  status page_version_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  recipe JSONB NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}',
  created_by TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger on recipe_versions
DROP TRIGGER IF EXISTS trg_recipe_versions_updated_at ON recipe_versions;
CREATE TRIGGER trg_recipe_versions_updated_at
BEFORE UPDATE ON recipe_versions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Pointers from recipe_pages to latest/published versions
ALTER TABLE recipe_pages
  DROP CONSTRAINT IF EXISTS fk_recipe_pages_latest_version,
  ADD CONSTRAINT fk_recipe_pages_latest_version FOREIGN KEY (latest_version_id) REFERENCES recipe_versions(id) ON DELETE SET NULL;

ALTER TABLE recipe_pages
  DROP CONSTRAINT IF EXISTS fk_recipe_pages_published_version,
  ADD CONSTRAINT fk_recipe_pages_published_version FOREIGN KEY (published_version_id) REFERENCES recipe_versions(id) ON DELETE SET NULL;

-- Indexes / uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_versions_unique ON recipe_versions(page_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_versions_published_unique ON recipe_versions(page_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_recipe_versions_page_id_created_at ON recipe_versions(page_id, created_at DESC);
