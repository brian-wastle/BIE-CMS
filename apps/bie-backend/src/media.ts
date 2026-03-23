import crypto from 'crypto';
import express, { Request, Response } from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import { requireAccess } from './auth.js';

const router = express.Router();

const MEDIA_TABLE = process.env.MEDIA_TABLE || 'media';
const MEDIA_UPLOAD_DIR = process.env.MEDIA_UPLOAD_DIR
  ? path.resolve(process.env.MEDIA_UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = (() => {
  const parsed = Number(process.env.MEDIA_MAX_UPLOAD_BYTES);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return DEFAULT_MAX_UPLOAD_BYTES;
})();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

type AuthedRequest = Request & {
  user?: { id: string; email: string };
  file?: Express.Multer.File;
};

type MediaRecord = {
  handle: string;
  userId: string | null;
  directory: string | null;
  filename: string | null;
  mimetype: string | null;
  size: number | null;
  cdnUrl: string | null;
  storagePath: string;
};

function sanitizeDirname(dirPath: string) {
  if (!dirPath) throw new Error('Directory is required');
  const dirArray = dirPath.split('/').filter(Boolean);
  if (!dirArray.length) throw new Error('Directory is required');
  const sanitized = dirArray.map((dir) => {
    if (!/^[a-zA-Z0-9_-]{1,60}$/.test(dir)) {
      throw new Error(`Retry name '${dir}': contains invalid characters`);
    }
    return dir;
  });
  return sanitized.join('/');
}

async function appendMedia(record: MediaRecord) {
  const query = `
    INSERT INTO ${MEDIA_TABLE}
      (handle, owner_user_id, directory_path, filename, mime_type, size_bytes, cdn_url, storage_path)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (handle) DO UPDATE SET
      owner_user_id = EXCLUDED.owner_user_id,
      directory_path = EXCLUDED.directory_path,
      filename = EXCLUDED.filename,
      mime_type = EXCLUDED.mime_type,
      size_bytes = EXCLUDED.size_bytes,
      cdn_url = EXCLUDED.cdn_url,
      storage_path = EXCLUDED.storage_path,
      is_deleted = FALSE,
      updated_at = now();
  `;
  await pool.query(query, [
    record.handle, record.userId, record.directory, record.filename,
    record.mimetype, record.size, record.cdnUrl, record.storagePath,
  ]);
}

async function removeMedia(handle: string, userId?: string) {
  const params: string[] = [handle];
  let query = `UPDATE ${MEDIA_TABLE} SET is_deleted = TRUE, updated_at = now() WHERE handle=$1`;
  if (userId) {
    query += ' AND owner_user_id=$2';
    params.push(userId);
  }
  await pool.query(query, params);
}

// Upload: receive file, write to disk, record in DB
router.post('/upload', requireAccess, upload.single('fileUpload'), async (req: AuthedRequest, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'Missing fileUpload field' });

  const user = req.user!;
  const rawDirectory = typeof req.body?.directory === 'string' ? req.body.directory.trim() : '';

  let sanitizedDir: string;
  try {
    sanitizedDir = rawDirectory ? sanitizeDirname(rawDirectory) : 'unsorted';
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  const handle = crypto.randomUUID();
  const safeFilename = (file.originalname || 'upload').replace(/[/\\]/g, '_');
  // Always use forward slashes in stored paths/URLs, path.join for actual disk I/O
  const storagePath = [user.id, sanitizedDir, `${handle}-${safeFilename}`].join('/');
  const absPath = path.join(MEDIA_UPLOAD_DIR, user.id, sanitizedDir, `${handle}-${safeFilename}`);
  const cdnUrl = `/api/media/files/${storagePath}`;
  const normalizedDirectory = sanitizedDir === 'unsorted' ? null : sanitizedDir;

  try {
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, file.buffer);
  } catch (err) {
    console.error('Failed to write uploaded file to disk', err);
    return res.status(500).json({ error: 'Failed to save uploaded file' });
  }

  try {
    await appendMedia({
      handle,
      userId: user.id,
      directory: normalizedDirectory,
      filename: safeFilename,
      mimetype: file.mimetype || null,
      size: file.size,
      cdnUrl,
      storagePath,
    });
  } catch (err) {
    console.error('Failed to record media upload in DB', err);
    await fs.unlink(absPath).catch(() => {});
    return res.status(500).json({ error: 'Failed to record media upload' });
  }

  return res.status(201).json({
    handle,
    url: cdnUrl,
    filename: safeFilename,
    directory: normalizedDirectory,
    storagePath,
    size: file.size,
    mimetype: file.mimetype || null,
  });
});

// Metadata: basic file info from DB
router.get('/metadata/:handle', requireAccess, async (req: AuthedRequest, res: Response) => {
  const { handle } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT filename, mime_type AS mimetype, size_bytes AS size, cdn_url FROM ${MEDIA_TABLE} WHERE handle=$1 AND is_deleted=FALSE`,
      [handle]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Failed to load media metadata', err);
    return res.status(500).json({ error: 'Failed to load metadata' });
  }
});

// List files in a directory from DB
router.get('/files', requireAccess, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const rawDir = typeof req.query.directory === 'string' ? req.query.directory.trim() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'created_desc';

  let sanitizedDir: string | null = null;
  try {
    if (rawDir && rawDir !== '/') {
      sanitizedDir = sanitizeDirname(rawDir);
    } else if (rawDir === '/') {
      sanitizedDir = '';
    }
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  let orderBy = 'created_at DESC';
  if (sort === 'created_asc') orderBy = 'created_at ASC';
  else if (sort === 'filename') orderBy = 'LOWER(filename) ASC NULLS LAST';

  const sql = `
    SELECT handle,
           directory_path AS directory,
           filename,
           mime_type AS mimetype,
           size_bytes AS size,
           NULL::INTEGER AS width,
           NULL::INTEGER AS height,
           NULL::JSONB AS metadata,
           cdn_url,
           storage_path,
           created_at,
           updated_at
    FROM ${MEDIA_TABLE}
    WHERE owner_user_id=$1
      AND is_deleted = FALSE
      AND directory_path = $2
    ORDER BY ${orderBy};
  `;

  try {
    const { rows } = await pool.query(sql, [user.id, sanitizedDir ?? '']);
    return res.json({ items: rows });
  } catch (err) {
    console.error('Failed to load media list', err);
    return res.status(500).json({ error: 'Failed to load media list' });
  }
});

// List directories from DB
router.get('/directories', requireAccess, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const sql = `
    SELECT directory_path AS directory,
           COUNT(*) AS item_count,
           MAX(created_at) AS last_uploaded
    FROM ${MEDIA_TABLE}
    WHERE owner_user_id=$1
      AND is_deleted = FALSE
    GROUP BY directory_path
    ORDER BY last_uploaded DESC NULLS LAST, directory ASC;
  `;

  try {
    const { rows } = await pool.query(sql, [user.id]);
    const directories = rows.map((row: any) => ({
      directory: row.directory === '' ? null : row.directory,
      itemCount: Number(row.item_count) || 0,
      lastUploaded: row.last_uploaded,
    }));
    return res.json({ directories });
  } catch (err) {
    console.error('Failed to load directories', err);
    return res.status(500).json({ error: 'Failed to load directories' });
  }
});

// Delete: remove file from disk and soft-delete DB record
router.delete('/:handle', requireAccess, async (req: AuthedRequest, res: Response) => {
  const { handle } = req.params;
  const user = req.user!;

  let storagePath: string | null = null;
  try {
    const { rowCount, rows } = await pool.query(
      `SELECT owner_user_id, storage_path FROM ${MEDIA_TABLE} WHERE handle=$1 AND is_deleted=FALSE`,
      [handle]
    );
    if (!rowCount) return res.status(404).json({ error: 'Media handle not found' });
    if (rows[0].owner_user_id !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this media item' });
    }
    storagePath = typeof rows[0].storage_path === 'string' ? rows[0].storage_path : null;
  } catch (err) {
    console.error('Failed to authorize media deletion', err);
    return res.status(500).json({ error: 'Failed to authorize delete' });
  }

  if (storagePath) {
    const absPath = path.join(MEDIA_UPLOAD_DIR, storagePath);
    try {
      await fs.unlink(absPath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('Failed to delete file from disk', err);
        return res.status(500).json({ error: 'Failed to delete file from disk' });
      }
    }
  }

  try {
    await removeMedia(handle, user.id);
  } catch (err) {
    console.error('Failed to update media record after delete', err);
    return res.status(500).json({ error: 'Failed to update media record' });
  }

  return res.status(204).end();
});

// Serve uploaded files publicly — no auth needed, images appear on public pages.
// Registered last so named routes above take priority for exact path matches.
router.use('/files', express.static(MEDIA_UPLOAD_DIR, { dotfiles: 'deny' }));

export default router;
