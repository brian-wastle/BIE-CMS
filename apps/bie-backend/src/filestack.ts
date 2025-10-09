import crypto from 'crypto';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { Pool } from 'pg';
import { z } from 'zod';

import { requireAccess } from './auth.js';

const router = express.Router();

// Env Config
const API_KEY = process.env.FILESTACK_API_KEY!;
const APP_SECRET = process.env.FILESTACK_APP_SECRET!;
const WEBHOOK_SEC = process.env.FILESTACK_WEBHOOK_SECRET || APP_SECRET;
const EXPIRY_SEC = Number(process.env.FILESTACK_POLICY_EXPIRY_SEC || 900);
const MEDIA_TABLE = process.env.MEDIA_TABLE || 'media';
const CDN_BASE = process.env.FILESTACK_CDN_BASE || 'https://cdn.filestackcontent.com';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Combine cookie and login
type AuthedRequest = Request & {
  user?: { id: string; email: string };
};

// Filestack POST req to webhook
type StoredEvent = {
  text?: string;
  data?: {
    handle?: string;
    url?: string;
    filename?: string;
    mimetype?: string;
    size?: number;
    key?: string;
    path?: string;
    width?: number;
    height?: number;
    metadata?: Record<string, unknown>;
  };
};

// Normalized record to store in DB
type MediaRecord = {
  handle: string;
  userId: string | null;
  directory: string | null;
  filename: string | null;
  mimetype: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  cdnUrl: string | null;
  storagePath: string | null;
  metadata: Record<string, unknown> | null;
};

// Encodes an object as base64 for Filestack policy payloads.
function b64(json: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(json)).toString('base64');
}

// HMAC-SHA256
// Produce an HMAC-SHA256 signature over the encoded policy using the provided secret
function sign(policyB64: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(policyB64).digest('hex');
}

// Compare two hex strings by size (Buffer.length) and HMAC digest (crypto.timingSafeEqual)
function secureFSPayload(a: string, b: string) {
  try {
    const bufferA = Buffer.from(a, 'hex');
    const bufferB = Buffer.from(b, 'hex');
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

// Normalize directory supplied by user
function sanitizeSegment(segment: string, label: string) {
  if (!segment) {
    throw new Error(`${label} is required`);
  }
  const parts = segment.split('/').filter(Boolean);
  if (!parts.length) throw new Error(`${label} is required`);
  const sanitized = parts.map((part) => {
    if (!/^[a-zA-Z0-9_-]{1,60}$/.test(part)) {
      throw new Error(`${label} contains invalid characters`);
    }
    return part;
  });
  return sanitized.join('/');
}

// Upsert Filestack metadata into Postgres so media can be referenced later.
async function appendMedia(record: MediaRecord) {
  const query = `
    INSERT INTO ${MEDIA_TABLE}
      (handle, owner_user_id, directory_path, filename, mime_type, size_bytes, width, height, cdn_url, storage_path, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (handle) DO UPDATE SET
      owner_user_id = EXCLUDED.owner_user_id,
      directory_path = EXCLUDED.directory_path,
      filename = EXCLUDED.filename,
      mime_type = EXCLUDED.mime_type,
      size_bytes = EXCLUDED.size_bytes,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      cdn_url = EXCLUDED.cdn_url,
      storage_path = EXCLUDED.storage_path,
      metadata = EXCLUDED.metadata,
      is_deleted = FALSE,
      updated_at = now();
  `;
  const values = [
    record.handle,
    record.userId,
    record.directory,
    record.filename,
    record.mimetype,
    record.size,
    record.width,
    record.height,
    record.cdnUrl,
    record.storagePath,
    record.metadata,
  ];
  await pool.query(query, values);
}

// Soft-delete or update an existing media row when the asset is removed.
async function removeMedia(handle: string, userId?: string) {
  const params: string[] = [handle];
  let query = `UPDATE ${MEDIA_TABLE} SET is_deleted = TRUE, updated_at = now() WHERE handle=$1`;
  if (userId) {
    query += ' AND owner_user_id=$2';
    params.push(userId);
  }
  await pool.query(query, params);
}

// Parse the Filestack storage key into its owner, directory, and filename parts.
// Drop leading slashes, split into user/directory/filename
function parseStorageKey(key?: string | null) {
  if (!key) return null;
  const trimmed = key.replace(/^\/+/, '');
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [userId, ...rest] = parts;
  if (!rest.length) return null;
  const filename = rest.pop() || null;
  const directory = rest.length ? rest.join('/') : null;
  return { userId, directory, filename, storagePath: trimmed };
}

// Basic Filestack security policy allowing pick/store/read.
function buildPolicyPayload(expiryEpoch: number, pathPrefix: string, mimetypes?: string[]) {
  const payload: Record<string, unknown> = {
    expiry: expiryEpoch,
    call: ['pick', 'store', 'read'],
    path: `/${pathPrefix}`,
  };
  if (mimetypes?.length) payload.mimetypes = mimetypes;
  return payload;
}

// Issues a signed Filestack policy for emdia upload
// Stores to user's optional directory
// Blank directories default to "Unsorted"
router.post('/policy', requireAccess, async (req: AuthedRequest, res: Response) => {
  const schema = z.object({
    directory: z.string().optional(),
    mimetypes: z.array(z.string()).optional(),
  });

  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const { directory, mimetypes } = parseResult.data;
  const user = req.user!;
  // Take user, create path from user's dir input, calc expiry
  // Build payload, b64 expectedd by FS, signed
  let sanitizedDir: string | undefined;
  try {
    sanitizedDir = directory ? sanitizeSegment(directory, 'directory') : 'Unsorted';
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
  const segments = [user.id];
  segments.push(sanitizedDir);
  const storagePrefix = segments.join('/');
  const expiryEpoch = Math.floor(Date.now() / 1000) + EXPIRY_SEC;
  const policyPayload = buildPolicyPayload(expiryEpoch, storagePrefix, mimetypes);
  const policyB64 = b64(policyPayload);
  const signature = sign(policyB64, APP_SECRET);

  return res.json({
    apiKey: API_KEY,
    policy: policyB64,
    signature,
    expiresAt: expiryEpoch,
    storagePrefix,
    directory: sanitizedDir ?? null,
    cdnBaseUrl: CDN_BASE,
  });
});

// Webhook receiver
// Verify Filestack event payload and store new media record in DB
router.post('/webhook', async (req: Request, res: Response) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? '');
  const sigHeader = req.get('Filestack-Signature') || '';
  const parts = sigHeader.split('sha256=');
  const hexFromHeader = parts[1] || undefined;

  const computed = crypto.createHmac('sha256', WEBHOOK_SEC).update(rawBody).digest('hex');

  if (!hexFromHeader || !secureFSPayload(hexFromHeader, computed)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  let evt: StoredEvent;
  try {
    evt = JSON.parse(rawBody.toString('utf-8'));
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (evt.text === 'file.store' && evt.data?.handle) {
    const data = evt.data;
    const keyInfo = parseStorageKey(data.key || data.path || null);
    const metadata = data.metadata;

    if (!keyInfo) {
      console.warn('Skipping media webhook without structured storage key', {
        handle: data.handle ?? '',
        key: data.key,
        path: data.path,
      });
      return res.status(204).end();
    }

    const sizeFromMetadata =
      metadata && typeof metadata['size'] === 'number' ? (metadata['size'] as number) : null;
    const widthFromMetadata =
      metadata && typeof metadata['width'] === 'number' ? (metadata['width'] as number) : null;
    const heightFromMetadata =
      metadata && typeof metadata['height'] === 'number' ? (metadata['height'] as number) : null;
    const metadataMimetype =
      metadata && typeof metadata['mimetype'] === 'string' ? (metadata['mimetype'] as string) : null;

    const record: MediaRecord = {
      handle: data.handle ?? 'untitled',
      userId: keyInfo.userId || null,
      directory: keyInfo.directory || null,
      filename: data.filename || keyInfo.filename || null,
      mimetype: data.mimetype || metadataMimetype || null,
      size: typeof data.size === 'number' ? data.size : sizeFromMetadata,
      width: typeof data.width === 'number' ? data.width : widthFromMetadata,
      height: typeof data.height === 'number' ? data.height : heightFromMetadata,
      cdnUrl: data.url || `${CDN_BASE}/${data.handle}`,
      storagePath: keyInfo.storagePath || null,
      metadata: metadata ?? null,
    };
    try {
      await appendMedia(record);
    } catch (dbErr) {
      console.error('Failed to persist media record', dbErr);
      return res.status(500).json({ error: 'Failed to store media metadata' });
    }
  }

  return res.status(204).end();
});

// Retrieve Filestack asset metadata (auth-gated)
// Show dimensions, sort images, helpful info for inspector (height/width)
router.get('/metadata/:handle', requireAccess, async (req: AuthedRequest, res: Response) => {
  const { handle } = req.params;
  const url = `${CDN_BASE}/metadata/${encodeURIComponent(handle)}`;
  const r = await fetch(url);
  if (!r.ok) return res.status(r.status).send(await r.text());
  const json = await r.json();
  res.json(json);
});

// Return the files within a specific directory of the current user from DB
router.get('/files', requireAccess, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const rawDir = typeof req.query.directory === 'string' ? req.query.directory.trim() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'created_desc';

  let sanitizedDir: string | null = null;
  try {
    if (rawDir && rawDir !== '/') {
      sanitizedDir = sanitizeSegment(rawDir, 'directory');
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
           width,
           height,
           metadata,
           cdn_url,
           storage_path,
           created_at,
           updated_at
    FROM ${MEDIA_TABLE}
    WHERE owner_user_id=$1
      AND is_deleted = FALSE
      AND COALESCE(directory_path, '') = $2
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

// Return the directories for current user from DB
router.get('/directories', requireAccess, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const sql = `
    SELECT COALESCE(directory_path, '') AS directory,
           COUNT(*) AS item_count,
           MAX(created_at) AS last_uploaded
    FROM ${MEDIA_TABLE}
    WHERE owner_user_id=$1
      AND is_deleted = FALSE
    GROUP BY COALESCE(directory_path, '')
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

// Delete by handle (server-side, auth-gated), requires "remove" call in policy
router.delete('/:handle', requireAccess, async (req: AuthedRequest, res: Response) => {
  const { handle } = req.params;
  const user = req.user!;

  try {
    const { rowCount, rows } = await pool.query(
      `SELECT owner_user_id FROM ${MEDIA_TABLE} WHERE handle=$1 AND is_deleted = FALSE`,
      [handle]
    );
    if (!rowCount) {
      return res.status(404).json({ error: 'Media handle not found' });
    }
    if (rows[0].owner_user_id !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this media item' });
    }
  } catch (err) {
    console.error('Failed to authorize media deletion', err);
    return res.status(500).json({ error: 'Failed to authorize delete' });
  }

  const policy = {
    expiry: Math.floor(Date.now() / 1000) + 60,
    call: ['remove'],
    handle,
  };
  const policyB64 = b64(policy);
  const signature = sign(policyB64, APP_SECRET);

  const resp = await fetch(`https://www.filestackapi.com/api/file/${handle}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Filestack-Api-Key': API_KEY,
      'Filestack-Security': JSON.stringify({ policy: policyB64, signature }),
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(resp.status).send(text);
  }

  try {
    await removeMedia(handle, user.id);
  } catch (err) {
    console.error('Failed to delete media record', err);
  }

  return res.status(204).end();
});

export default router;
