import express from 'express';
import {
  PageDetail,
  PageDetailSchema,
  PageIdentitySchema,
  PageSummary,
  PageSummarySchema,
  PageUpdate,
  PageUpdateSchema,
  PageVersion,
  PageVersionSchema,
  PageVersionSummary,
  PageVersionSummarySchema,
  PageWrite,
  PageWriteSchema,
} from 'bie-models';

import { requireAccess } from './auth.js';
import { pool, withTransaction } from './db.js';

const router = express.Router();

function mapPageRow(row: any) {
  const createdAt = row.page_created_at ?? row.created_at;
  const updatedAt = row.page_updated_at ?? row.updated_at ?? createdAt;

  return PageIdentitySchema.parse({
    id: row.page_id ?? row.id,
    slug: row.slug,
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    latestVersionId: row.latest_version_id ?? null,
    publishedVersionId: row.published_version_id ?? null,
  });
}

function mapVersionRow(row: any): PageVersion {
  const shaped = {
    id: row.id,
    pageId: row.page_id,
    version: Number(row.version),
    status: row.status,
    title: row.title,
    blocks: row.blocks,
    meta: row.meta ?? {},
    createdBy: row.created_by ?? null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
  return PageVersionSchema.parse(shaped);
}

function mapVersionSummary(prefix: 'latest' | 'published', row: any): PageVersionSummary | null {
  const id = row[`${prefix}_version_id`];
  if (!id) return null;

  const shaped = {
    id,
    pageId: row.page_id,
    version: Number(row[`${prefix}_version_number`]),
    status: row[`${prefix}_status`],
    title: row[`${prefix}_title`],
    createdBy: row[`${prefix}_created_by`] ?? null,
    createdAt: new Date(row[`${prefix}_created_at`]).toISOString(),
    updatedAt: new Date(row[`${prefix}_updated_at`]).toISOString(),
    publishedAt: row[`${prefix}_published_at`]
      ? new Date(row[`${prefix}_published_at`]).toISOString()
      : null,
  };

  return PageVersionSummarySchema.parse(shaped);
}

function toSummary(version: PageVersion): PageVersionSummary {
  const { blocks: _blocks, meta: _meta, ...summary } = version;
  return PageVersionSummarySchema.parse(summary);
}

async function resolvePageId(ref: string, client = pool): Promise<string | null> {
  const { rows } = await client.query(
    `SELECT id FROM pages WHERE id = $1 OR slug = $1 LIMIT 1`,
    [ref]
  );
  return rows[0]?.id ?? null;
}

async function loadPageDetail(pageId: string): Promise<PageDetail> {
  const { rows: pageRows } = await pool.query(
    `SELECT id, slug, created_at, updated_at, latest_version_id, published_version_id
     FROM pages
     WHERE id = $1
     LIMIT 1`,
    [pageId]
  );

  if (!pageRows.length) {
    throw new Error('PAGE_NOT_FOUND');
  }

  const page = mapPageRow(pageRows[0]);

  const { rows: versionRows } = await pool.query(
    `SELECT id, page_id, version, status, title, blocks, meta, created_by, created_at, updated_at, published_at
     FROM page_versions
     WHERE page_id = $1
     ORDER BY created_at DESC`,
    [pageId]
  );

  const versions = versionRows.map(mapVersionRow);
  const draftVersion = versions.find((v) => v.status === 'draft') ?? null;
  const publishedVersion = versions.find((v) => v.status === 'published') ?? null;
  const latestVersion = versions[0] ?? null;

  return PageDetailSchema.parse({
    page,
    draftVersion,
    publishedVersion,
    latestVersion,
    history: versions.map(toSummary),
  });
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
        p.created_at AS page_created_at,
        p.updated_at AS page_updated_at,
        lv.id AS latest_version_id,
        lv.version AS latest_version_number,
        lv.status AS latest_status,
        lv.title AS latest_title,
        lv.created_by AS latest_created_by,
        lv.created_at AS latest_created_at,
        lv.updated_at AS latest_updated_at,
        lv.published_at AS latest_published_at,
        pv.id AS published_version_id,
        pv.version AS published_version_number,
        pv.status AS published_status,
        pv.title AS published_title,
        pv.created_by AS published_created_by,
        pv.created_at AS published_created_at,
        pv.updated_at AS published_updated_at,
        pv.published_at AS published_published_at
      FROM pages p
      LEFT JOIN LATERAL (
        SELECT v.id, v.version, v.status, v.title, v.created_by, v.created_at, v.updated_at, v.published_at
        FROM page_versions v
        WHERE v.page_id = p.id
        ORDER BY v.created_at DESC
        LIMIT 1
      ) lv ON true
      LEFT JOIN LATERAL (
        SELECT v.id, v.version, v.status, v.title, v.created_by, v.created_at, v.updated_at, v.published_at
        FROM page_versions v
        WHERE v.page_id = p.id AND v.status = 'published'
        ORDER BY v.created_at DESC
        LIMIT 1
      ) pv ON true
      ORDER BY p.updated_at DESC
      `
    );

    const pages: PageSummary[] = rows.map((row) =>
      PageSummarySchema.parse({
        page: mapPageRow(row),
        latestVersion: mapVersionSummary('latest', row),
        publishedVersion: mapVersionSummary('published', row),
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
  const ref = req.params.idOrSlug;
  try {
    const pageId = await resolvePageId(ref);
    if (!pageId) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = await loadPageDetail(pageId);
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
        [pageId, status, payload.title, payload.blocks, payload.meta ?? {}, payload.createdBy ?? null, publishedAt]
      );

      const version = mapVersionRow(versionInsert.rows[0]);

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

    const page = await loadPageDetail(pageId);
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
          payload.blocks,
          payload.meta ?? {},
          payload.createdBy ?? null,
          publishedAt,
        ]
      );

      const version = mapVersionRow(versionInsert.rows[0]);

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

    const page = await loadPageDetail(pageId);
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

    const page = await loadPageDetail(pageId);
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
