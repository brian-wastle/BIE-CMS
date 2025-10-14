CREATE TABLE IF NOT EXISTS media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle          TEXT UNIQUE NOT NULL,              -- Filestack handle
  filename        TEXT,
  mime_type       TEXT,
  size_bytes      INTEGER,
  directory_path  TEXT,
  storage_path    TEXT NOT NULL,                     -- e.g. userId/gallery/photo.jpg
  cdn_url         TEXT NOT NULL,
  alt_text        TEXT,
  owner_user_id   UUID REFERENCES users(id)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS media_handle_uidx ON media(handle);
CREATE INDEX IF NOT EXISTS media_owner_idx ON media(owner_user_id);
CREATE INDEX IF NOT EXISTS media_directory_idx ON media(owner_user_id, directory_path);
CREATE INDEX IF NOT EXISTS media_created_idx ON media(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_media_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_tupd ON media;
CREATE TRIGGER media_tupd
BEFORE UPDATE ON media
FOR EACH ROW
EXECUTE FUNCTION set_media_updated_at();

CREATE TABLE IF NOT EXISTS media_usage (
  media_id     UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  content_id   UUID NOT NULL,         -- your post/page id
  content_type TEXT NOT NULL,         -- 'post' | 'page' | ...
  role         TEXT NOT NULL,         -- 'thumb' | 'card' | 'hero' | 'inline'
  PRIMARY KEY (media_id, content_id, role)
);

CREATE INDEX IF NOT EXISTS media_usage_content_idx
  ON media_usage(content_id, content_type);
