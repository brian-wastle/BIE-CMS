import crypto from 'crypto';
import express from 'express';
import fetch, { File, FormData } from 'node-fetch';
import multer from 'multer';
import { Pool } from 'pg';
import { z } from 'zod';
import { requireAccess } from './auth.js';
const router = express.Router();
// Env Config
const API_KEY = process.env.FILESTACK_API_KEY;
const APP_SECRET = process.env.FILESTACK_APP_SECRET;
const EXPIRY_SEC = Number(process.env.FILESTACK_POLICY_EXPIRY_SEC || 900);
const MEDIA_TABLE = process.env.MEDIA_TABLE || 'media';
const CDN_BASE = process.env.FILESTACK_CDN_BASE || 'https://cdn.filestackcontent.com';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = (() => {
    const parsed = Number(process.env.MEDIA_MAX_UPLOAD_BYTES);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return DEFAULT_MAX_UPLOAD_BYTES;
})();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
});
const FilestackStoreResponseSchema = z.object({
    url: z.url(),
    handle: z.string().min(1).optional(),
    key: z.string().min(1).optional(),
}).loose();
// Encodes an object as base64 for Filestack policy payloads.
function b64(json) {
    return Buffer.from(JSON.stringify(json)).toString('base64');
}
// HMAC-SHA256
// Produce an HMAC-SHA256 signature over the encoded policy using the provided secret
function sign(policyB64, secret) {
    return crypto.createHmac('sha256', secret).update(policyB64).digest('hex');
}
// Normalize directory supplied by user
function sanitizeDirname(dirPath) {
    if (!dirPath) {
        throw new Error(`Directory is required`);
    }
    const dirArray = dirPath.split('/').filter(Boolean);
    dirArray.forEach(dir => dir.toLowerCase());
    if (!dirArray.length)
        throw new Error(`Directory is required`);
    const sanitized = dirArray.map((dir) => {
        if (!/^[a-zA-Z0-9_-]{1,60}$/.test(dir)) {
            throw new Error(`Retry name '${dir}': contains invalid characters`);
        }
        return dir;
    });
    return sanitized.join('/');
}
// Upsert Filestack metadata into Postgres so media can be referenced later.
async function appendMedia(record) {
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
    const values = [
        record.handle,
        record.userId,
        record.directory,
        record.filename,
        record.mimetype,
        record.size,
        record.cdnUrl,
        record.storagePath,
    ];
    await pool.query(query, values);
}
// Soft-delete or update an existing media row when the asset is removed.
async function removeMedia(handle, userId) {
    const params = [handle];
    let query = `UPDATE ${MEDIA_TABLE} SET is_deleted = TRUE, updated_at = now() WHERE handle=$1`;
    if (userId) {
        query += ' AND owner_user_id=$2';
        params.push(userId);
    }
    await pool.query(query, params);
}
// Basic Filestack security policy allowing pick/store/read.
// TODO: Break out policies between operations in front end
function buildPolicyPayload(expiryEpoch, pathPrefix, mimetypes) {
    const payload = {
        expiry: expiryEpoch,
        call: ['pick', 'store', 'read', 'remove'],
        path: `/${pathPrefix}`,
    };
    if (mimetypes?.length)
        payload.mimetypes = mimetypes;
    return payload;
}
function buildRemovePolicy(handle, storagePath) {
    const payload = {
        expiry: Math.floor(Date.now() / 1000) + 60,
        call: ['read', 'write', 'remove'],
        handle,
    };
    if (storagePath && storagePath.trim().length) {
        const normalized = storagePath.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
        payload.path = `/${normalized}`;
    }
    return payload;
}
// Receive a browser upload, forward to Filestack, and respond with the resulting handle.
router.post('/upload', requireAccess, upload.single('fileUpload'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'Missing fileUpload field' });
    }
    const user = req.user;
    const rawDirectory = typeof req.body?.directory === 'string' ? req.body.directory.trim() : '';
    let sanitizedDir;
    try {
        sanitizedDir = rawDirectory ? sanitizeDirname(rawDirectory) : 'unsorted';
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
    const safeFilename = (file.originalname || 'upload').replace(/[/\\]/g, '_');
    const storagePrefix = [user.id, sanitizedDir].join('/');
    const expiryEpoch = Math.floor(Date.now() / 1000) + EXPIRY_SEC;
    const policyPayload = buildPolicyPayload(expiryEpoch, storagePrefix);
    const policyB64 = b64(policyPayload);
    const signature = sign(policyB64, APP_SECRET);
    const body = new FormData();
    body.append('policy', policyB64);
    body.append('signature', signature);
    body.append('path', `/${storagePrefix}/${safeFilename}`);
    if (file.mimetype) {
        body.append('mimetype', file.mimetype);
    }
    const bytes = Uint8Array.from(file.buffer);
    const fileBlob = new File([bytes], safeFilename, {
        type: file.mimetype || 'application/octet-stream',
        lastModified: Date.now(),
    });
    body.append('fileUpload', fileBlob);
    let resp;
    try {
        const uploadUrl = new URL('https://www.filestackapi.com/api/store/S3');
        uploadUrl.searchParams.set('key', API_KEY);
        resp = await fetch(uploadUrl, {
            method: 'POST',
            body,
        });
    }
    catch (err) {
        console.error('Filestack upload network failure', err);
        return res.status(502).json({ error: 'Failed to reach Filestack upload service' });
    }
    if (!resp.ok) {
        const text = await resp.text();
        console.error('Filestack upload rejected', resp.status, text);
        return res.status(resp.status).send(text || 'Filestack upload failed');
    }
    const raw = await resp.text();
    let payload = null;
    try {
        payload = JSON.parse(raw);
    }
    catch (err) {
        console.error('Unexpected Filestack upload response', raw);
        return res.status(502).json({ error: 'Unexpected response from Filestack upload service' });
    }
    const parsedPayload = FilestackStoreResponseSchema.safeParse(payload);
    if (!parsedPayload.success) {
        console.error('Filestack upload response validation failed', parsedPayload.error);
        return res.status(502).json({ error: 'Filestack upload response missing CDN URL' });
    }
    const filestackResponse = parsedPayload.data;
    const { url: payloadUrl, handle: payloadHandle, key: payloadKey } = filestackResponse;
    let filestackUrl;
    try {
        filestackUrl = new URL(payloadUrl);
    }
    catch (err) {
        console.error('Filestack upload response contained invalid URL', payloadUrl, err);
        return res.status(502).json({ error: 'Filestack upload response contained invalid URL' });
    }
    let handle = payloadHandle ?? payloadKey ?? null;
    if (!handle) {
        const pathParts = filestackUrl.pathname.split('/').filter(Boolean);
        handle = pathParts.pop() ?? null;
    }
    if (!handle) {
        console.error('Filestack upload response missing handle', filestackResponse);
        return res.status(502).json({ error: 'Filestack upload response missing file handle' });
    }
    const normalizedDirectory = sanitizedDir === 'unsorted' ? null : sanitizedDir;
    try {
        await appendMedia({
            handle,
            userId: user.id,
            directory: normalizedDirectory,
            filename: safeFilename,
            mimetype: file.mimetype || null,
            size: file.size,
            cdnUrl: filestackUrl.toString(),
            storagePath: `${storagePrefix}/${safeFilename}`,
        });
    }
    catch (err) {
        console.error('Failed to save media record after upload', err);
    }
    return res.status(201).json({
        handle,
        url: filestackUrl.toString(),
        filename: safeFilename,
        directory: normalizedDirectory,
        storagePath: `${storagePrefix}/${safeFilename}`,
        size: file.size,
        mimetype: file.mimetype || null,
    });
});
// Retrieve Filestack asset metadata (auth-gated)
// Show dimensions, sort images, helpful info for inspector (height/width)
router.get('/metadata/:handle', requireAccess, async (req, res) => {
    const { handle } = req.params;
    const url = `${CDN_BASE}/metadata/${encodeURIComponent(handle)}`;
    const r = await fetch(url);
    if (!r.ok)
        return res.status(r.status).send(await r.text());
    const json = await r.json();
    res.json(json);
});
// Return the files within a specific directory of the current user from DB
// Expects 2 params: directory and sort (created_desc, created_asc, or filename)
router.get('/files', requireAccess, async (req, res) => {
    const user = req.user;
    const rawDir = typeof req.query.directory === 'string' ? req.query.directory.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'created_desc';
    let sanitizedDir = null;
    try {
        if (rawDir && rawDir !== '/') {
            sanitizedDir = sanitizeDirname(rawDir);
        }
        else if (rawDir === '/') {
            sanitizedDir = '';
        }
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
    let orderBy = 'created_at DESC';
    if (sort === 'created_asc')
        orderBy = 'created_at ASC';
    else if (sort === 'filename')
        orderBy = 'LOWER(filename) ASC NULLS LAST';
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
    }
    catch (err) {
        console.error('Failed to load media list', err);
        return res.status(500).json({ error: 'Failed to load media list' });
    }
});
// Return the directories for current user from DB
router.get('/directories', requireAccess, async (req, res) => {
    const user = req.user;
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
        const directories = rows.map((row) => ({
            directory: row.directory === '' ? null : row.directory,
            itemCount: Number(row.item_count) || 0,
            lastUploaded: row.last_uploaded,
        }));
        return res.json({ directories });
    }
    catch (err) {
        console.error('Failed to load directories', err);
        return res.status(500).json({ error: 'Failed to load directories' });
    }
});
// Delete by handle (server-side, auth-gated), requires "remove" call in policy
router.delete('/:handle', requireAccess, async (req, res) => {
    const { handle } = req.params;
    const user = req.user;
    let storagePath = null;
    try {
        const { rowCount, rows } = await pool.query(`SELECT owner_user_id, storage_path FROM ${MEDIA_TABLE} WHERE handle=$1 AND is_deleted = FALSE`, [handle]);
        if (!rowCount) {
            return res.status(404).json({ error: 'Media handle not found' });
        }
        if (rows[0].owner_user_id !== user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this media item' });
        }
        storagePath = typeof rows[0].storage_path === 'string' ? rows[0].storage_path : null;
    }
    catch (err) {
        console.error('Failed to authorize media deletion', err);
        return res.status(500).json({ error: 'Failed to authorize delete' });
    }
    const policy = buildRemovePolicy(handle, storagePath);
    const policyB64 = b64(policy);
    const signature = sign(policyB64, APP_SECRET);
    const deleteUrl = new URL(`https://www.filestackapi.com/api/file/${handle}`);
    deleteUrl.searchParams.set('key', API_KEY);
    deleteUrl.searchParams.set('policy', policyB64);
    deleteUrl.searchParams.set('signature', signature);
    const resp = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!resp.ok) {
        const text = await resp.text();
        return res.status(resp.status).send(text);
    }
    try {
        await removeMedia(handle, user.id);
    }
    catch (err) {
        console.error('Failed to delete media record', err);
    }
    return res.status(204).end();
});
export default router;
