import express from 'express';
import type { Pool, PoolClient } from 'pg';
import {
  Page,
  PageSchema,
  PageSummary,
  PageSummarySchema,
  PageUpdate,
  PageUpdateSchema,
  PageWrite,
  PageWriteSchema,
} from 'bie-models';

import { requireAccess } from './auth.js';
import { pool, withTransaction } from './db.js';

const router = express.Router();

function mapVersionRowToPage(row: any): Page {
  return PageSchema.parse({
    id: row.page_id ?? row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    blocks: row.blocks,
    meta: row.meta ?? {},
    createdBy: row.created_by ?? null,
    createdAt: new Date(row.version_created_at ?? row.created_at).toISOString(),
    updatedAt: new Date(row.version_updated_at ?? row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  });
}

async function resolvePageId(ref: string, client: Pool | PoolClient = pool): Promise<string | null> {
  const { rows } = await client.query(
    `SELECT id FROM pages WHERE id = $1 OR slug = $1 LIMIT 1`,
    [ref]
  );
  return rows[0]?.id ?? null;
}

async function loadPageById(pageId: string, client: Pool | PoolClient = pool): Promise<Page | null> {
  const { rows } = await client.query(
    `
    SELECT
      p.id AS page_id,
      p.slug,
      v.status,
      v.title,
      v.blocks,
      v.meta,
      v.created_by,
      v.created_at AS version_created_at,
      v.updated_at AS version_updated_at,
      v.published_at
    FROM pages p
    JOIN LATERAL (
      SELECT status, title, blocks, meta, created_by, created_at, updated_at, published_at
      FROM page_versions
      WHERE page_id = p.id
      ORDER BY created_at DESC
      LIMIT 1
    ) v ON true
    WHERE p.id = $1
    LIMIT 1
    `,
    [pageId]
  );

  if (!rows.length) {
    return null;
  }

  return mapVersionRowToPage(rows[0]);
}

async function loadPageByRef(ref: string): Promise<Page | null> {
  const pageId = await resolvePageId(ref);
  if (!pageId) {
    return null;
  }
  return loadPageById(pageId);
}

router.use(requireAccess);

// Get all pages in order of most recent updates
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id AS page_id,
        p.slug,
        v.status,
        v.title,
        v.blocks,
        v.meta,
        v.created_by,
        v.created_at AS version_created_at,
        v.updated_at AS version_updated_at,
        v.published_at
      FROM pages p
      JOIN LATERAL (
        SELECT status, title, blocks, meta, created_by, created_at, updated_at, published_at
        FROM page_versions
        WHERE page_id = p.id
        ORDER BY created_at DESC
        LIMIT 1
      ) v ON true
      ORDER BY p.updated_at DESC
      `
    );

    const pages: PageSummary[] = rows.map((row) =>
      PageSummarySchema.parse({
        page: mapVersionRowToPage(row),
      })
    );

    return res.json({ pages });
  } catch (err) {
    console.error('Failed to list pages', err);
    return res.status(500).json({ error: 'Failed to list pages' });
  }
});

// Get page by slug ID
router.get('/:idOrSlug', async (req, res) => {
  try {
    const page = await loadPageByRef(req.params.idOrSlug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    return res.json({ page });
  } catch (err) {
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

  const payload: PageWrite = parseResult.data;
  const status = payload.status ?? 'draft';
  const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
  const blocksJson = JSON.stringify(payload.blocks);
  const metaJson = JSON.stringify(payload.meta ?? {});

  try {
    const pageId = await withTransaction(async (client) => {
      const pageInsert = await client.query(
        `
        INSERT INTO pages (slug)
        VALUES ($1)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
        `,
        [payload.slug]
      );

      if (!pageInsert.rows.length) {
        throw new Error('SLUG_CONFLICT');
      }

      const pageId = pageInsert.rows[0].id as string;

      const versionInsert = await client.query(
        `
        INSERT INTO page_versions (page_id, version, status, title, blocks, meta, created_by, published_at)
        VALUES ($1, 1, $2::page_version_status, $3, $4::jsonb, $5::jsonb, $6, $7::timestamptz)
        RETURNING id, page_id, version, status, title, blocks, meta, created_by, created_at, updated_at, published_at
        `,
        [pageId, status, payload.title, blocksJson, metaJson, payload.createdBy ?? null, publishedAt]
      );

      const version = versionInsert.rows[0];

      if (status === 'published') {
        await client.query(
          `UPDATE page_versions SET status = 'draft' WHERE page_id = $1 AND id <> $2 AND status = 'published'`,
          [pageId, version.id]
        );
      }

      await client.query(
        `
        UPDATE pages SET
          latest_version_id = $1,
          published_version_id = CASE WHEN $2 = 'published' THEN $1 ELSE published_version_id END,
          updated_at = now()
        WHERE id = $3
        `,
        [version.id, status, pageId]
      );

      return pageId;
    });

    const page = await loadPageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to upsert page', err);
    const pgErr = err as { code?: string; message?: string };
    const isUniqueViolation = pgErr?.code === '23505' || pgErr?.message === 'SLUG_CONFLICT';
    return res.status(isUniqueViolation ? 409 : 500).json({ error: 'Failed to save page' });
  }
});

// Update page
router.put('/:id', async (req, res) => {
  const parseResult = PageUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
  }

  const payload: PageUpdate = parseResult.data;
  const status = payload.status ?? 'draft';
  const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
  const ref = req.params.id;
  const blocksJson = JSON.stringify(payload.blocks);
  const metaJson = JSON.stringify(payload.meta ?? {});

  try {
    const pageId = await withTransaction(async (client) => {
      const resolvedPageId = await resolvePageId(ref, client);
      if (!resolvedPageId) {
        throw new Error('PAGE_NOT_FOUND');
      }

      if (payload.slug) {
        await client.query(`UPDATE pages SET slug = $1 WHERE id = $2`, [payload.slug, resolvedPageId]);
      }

      const { rows: nextVersionRows } = await client.query(
        `SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM page_versions WHERE page_id = $1`,
        [resolvedPageId]
      );
      const nextVersion = Number(nextVersionRows[0]?.next_version ?? 1);

      const versionInsert = await client.query(
        `
        INSERT INTO page_versions (page_id, version, status, title, blocks, meta, created_by, published_at)
        VALUES ($1, $2, $3::page_version_status, $4, $5::jsonb, $6::jsonb, $7, $8::timestamptz)
        RETURNING id, page_id, version, status, title, blocks, meta, created_by, created_at, updated_at, published_at
        `,
        [
          resolvedPageId,
          nextVersion,
          status,
          payload.title,
          blocksJson,
          metaJson,
          payload.createdBy ?? null,
          publishedAt,
        ]
      );

      const version = versionInsert.rows[0];

      if (status === 'published') {
        await client.query(
          `UPDATE page_versions SET status = 'draft' WHERE page_id = $1 AND id <> $2 AND status = 'published'`,
          [resolvedPageId, version.id]
        );
      }

      await client.query(
        `
        UPDATE pages SET
          latest_version_id = $1,
          published_version_id = CASE WHEN $2 = 'published' THEN $1 ELSE published_version_id END,
          updated_at = now()
        WHERE id = $3
        `,
        [version.id, status, resolvedPageId]
      );

      return resolvedPageId;
    });

    const page = await loadPageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to update page', err);
    const pgErr = err as { code?: string; message?: string };
    if (pgErr?.message === 'PAGE_NOT_FOUND') {
      return res.status(404).json({ error: 'Page not found' });
    }
    return res.status(pgErr?.code === '23505' ? 409 : 500).json({ error: 'Failed to update page' });
  }
});

// Publish an existing version
router.post('/:idOrSlug/versions/:versionId/publish', async (req, res) => {
  const publishedAt =
    req.body?.publishedAt !== undefined && req.body?.publishedAt !== null
      ? new Date(req.body.publishedAt).toISOString()
      : null;

  try {
    const pageId = await withTransaction(async (client) => {
      const resolvedPageId = await resolvePageId(req.params.idOrSlug, client);
      if (!resolvedPageId) {
        throw new Error('PAGE_NOT_FOUND');
      }

      const { rows: versionRows } = await client.query(
        `SELECT id FROM page_versions WHERE id = $1 AND page_id = $2 LIMIT 1`,
        [req.params.versionId, resolvedPageId]
      );

      if (!versionRows.length) {
        throw new Error('VERSION_NOT_FOUND');
      }

      await client.query(
        `UPDATE page_versions SET status = 'draft' WHERE page_id = $1 AND id <> $2 AND status = 'published'`,
        [resolvedPageId, req.params.versionId]
      );

      await client.query(
        `
        UPDATE page_versions
        SET status = 'published', published_at = COALESCE($3::timestamptz, published_at, now())
        WHERE id = $2 AND page_id = $1
        `,
        [resolvedPageId, req.params.versionId, publishedAt]
      );

      await client.query(
        `UPDATE pages SET published_version_id = $1, updated_at = now() WHERE id = $2`,
        [req.params.versionId, resolvedPageId]
      );

      return resolvedPageId;
    });

    const page = await loadPageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to publish page version', err);
    const code = (err as { message?: string }).message;
    if (code === 'PAGE_NOT_FOUND' || code === 'VERSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Page or version not found' });
    }
    return res.status(500).json({ error: 'Failed to publish version' });
  }
});

// Delete page
router.delete('/:id', async (req, res) => {
  try {
    const pageId = await resolvePageId(req.params.id);
    if (!pageId) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const { rowCount } = await pool.query(`DELETE FROM pages WHERE id = $1`, [pageId]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Page not found' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete page', err);
    return res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;
