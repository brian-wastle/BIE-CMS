import express from 'express';
import { PageWithMetaSchema, PageWriteSchema, } from 'bie-models';
import { requireAccess } from './auth.js';
import { pool } from './db.js';
const router = express.Router();
const ISO_FMT = `YYYY-MM-DD"T"HH24:MI:SS.MS"Z"`;
function mapRowToPage(row) {
    return PageWithMetaSchema.parse(row);
}
router.use(requireAccess);
// Get all pages in order of most recent updates
router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(`SELECT
         id,
         slug,
         title,
         status,
         blocks,
         COALESCE(meta, '{}'::jsonb) AS meta,
         to_char(published_at AT TIME ZONE 'UTC', '${ISO_FMT}') AS "publishedAt",
         to_char(updated_at   AT TIME ZONE 'UTC', '${ISO_FMT}') AS "updatedAt"
       FROM pages
       ORDER BY updated_at DESC`);
        const pages = rows.map(mapRowToPage);
        return res.json({ pages });
    }
    catch (err) {
        console.error('Failed to list pages', err);
        return res.status(500).json({ error: 'Failed to list pages' });
    }
});
// Get page by slug ID
router.get('/:idOrSlug', async (req, res) => {
    const ref = req.params.idOrSlug;
    try {
        const { rows } = await pool.query(`SELECT
         id,
         slug,
         title,
         status,
         blocks,
         COALESCE(meta, '{}'::jsonb) AS meta,
         to_char(published_at AT TIME ZONE 'UTC', '${ISO_FMT}') AS "publishedAt",
         to_char(updated_at   AT TIME ZONE 'UTC', '${ISO_FMT}') AS "updatedAt"
       FROM pages
       WHERE id = $1 OR slug = $1
       LIMIT 1`, [ref]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const page = mapRowToPage(rows[0]);
        return res.json({ page });
    }
    catch (err) {
        console.error('Failed to load page', err);
        return res.status(500).json({ error: 'Failed to load page' });
    }
});
// Post page to db
router.post('/', async (req, res) => {
    const parseResult = PageWriteSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
    }
    const payload = parseResult.data;
    const status = payload.status ?? 'draft';
    const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
    try {
        const { rows } = await pool.query(`
      INSERT INTO pages (slug, title, status, blocks, meta, published_at)
      VALUES ($1, $2, $3::page_status, $4::jsonb, $5::jsonb, $6::timestamptz)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        blocks = EXCLUDED.blocks,
        meta = EXCLUDED.meta,
        published_at = EXCLUDED.published_at,
        updated_at = now()
      RETURNING
        id,
        slug,
        title,
        status,
        blocks,
        COALESCE(meta, '{}'::jsonb) AS meta,
        to_char(published_at AT TIME ZONE 'UTC', '${ISO_FMT}') AS "publishedAt",
        to_char(updated_at   AT TIME ZONE 'UTC', '${ISO_FMT}') AS "updatedAt"
      `, [payload.slug, payload.title, status, payload.blocks, payload.meta ?? {}, publishedAt]);
        const page = mapRowToPage(rows[0]);
        return res.json({ page });
    }
    catch (err) {
        console.error('Failed to upsert page', err);
        const isUnique = err instanceof Error && /unique/i.test(err.message);
        return res.status(isUnique ? 409 : 500).json({ error: 'Failed to save page' });
    }
});
// Update page
router.put('/:id', async (req, res) => {
    const parseResult = PageWriteSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
    }
    const payload = parseResult.data;
    const status = payload.status ?? 'draft';
    const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
    try {
        const { rows } = await pool.query(`
      UPDATE pages SET
        slug = $1,
        title = $2,
        status = $3::page_status,
        blocks = $4::jsonb,
        meta = $5::jsonb,
        published_at = $6::timestamptz,
        updated_at = now()
      WHERE id = $7
      RETURNING
        id,
        slug,
        title,
        status,
        blocks,
        COALESCE(meta, '{}'::jsonb) AS meta,
        to_char(published_at AT TIME ZONE 'UTC', '${ISO_FMT}') AS "publishedAt",
        to_char(updated_at   AT TIME ZONE 'UTC', '${ISO_FMT}') AS "updatedAt"
      `, [payload.slug, payload.title, status, payload.blocks, payload.meta ?? {}, publishedAt, req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const page = mapRowToPage(rows[0]);
        return res.json({ page });
    }
    catch (err) {
        console.error('Failed to update page', err);
        return res.status(500).json({ error: 'Failed to update page' });
    }
});
// Delete page
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query(`DELETE FROM pages WHERE id = $1`, [req.params.id]);
        if (!rowCount) {
            return res.status(404).json({ error: 'Page not found' });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        console.error('Failed to delete page', err);
        return res.status(500).json({ error: 'Failed to delete page' });
    }
});
export default router;
