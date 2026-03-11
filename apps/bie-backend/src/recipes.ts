import express from 'express';
import type { Pool, PoolClient } from 'pg';
import {
  RecipePage,
  RecipePageSchema,
  RecipePageSummary,
  RecipePageSummarySchema,
  RecipePageUpdatePayload,
  RecipePageUpdateSchema,
  RecipePageCreatePayload,
  RecipePageCreateSchema,
} from 'bie-models';

import { requireAccess } from './auth.js';
import { pool, withTransaction } from './db.js';

const router = express.Router();

type RequestUser = { id: string; email?: string } | undefined;

function getAuthenticatedUserId(req: express.Request): string | null {
  const user = (req as any)?.user as RequestUser;
  return typeof user?.id === 'string' ? user.id : null;
}

function mapVersionToRecipePage(row: any): RecipePage {
  return RecipePageSchema.parse({
    id: row.page_id ?? row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    recipe: row.recipe,
    meta: row.meta ?? {},
    createdAt: new Date(row.version_created_at ?? row.created_at).toISOString(),
    updatedAt: new Date(row.version_updated_at ?? row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  });
}

async function resolveRecipePageId(slug: string, client: Pool | PoolClient = pool): Promise<string | null> {
  const { rows } = await client.query(
    `SELECT id FROM recipe_pages WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

async function loadRecipePageById(pageId: string, client: Pool | PoolClient = pool): Promise<RecipePage | null> {
  const { rows } = await client.query(
    `
    SELECT
      p.id AS page_id,
      p.slug,
      v.status,
      v.title,
      v.recipe,
      v.meta,
      v.created_at AS version_created_at,
      v.updated_at AS version_updated_at,
      v.published_at
    FROM recipe_pages p
    JOIN LATERAL (
      SELECT status, title, recipe, meta, created_at, updated_at, published_at
      FROM recipe_versions
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

  return mapVersionToRecipePage(rows[0]);
}

async function loadRecipePageBySlug(slug: string): Promise<RecipePage | null> {
  const pageId = await resolveRecipePageId(slug);
  if (!pageId) {
    return null;
  }
  return loadRecipePageById(pageId);
}

async function loadPublishedRecipePageBySlug(slug: string): Promise<RecipePage | null> {
  const { rows } = await pool.query(
    `
    SELECT
      p.id AS page_id,
      p.slug,
      v.status,
      v.title,
      v.recipe,
      v.meta,
      v.created_at AS version_created_at,
      v.updated_at AS version_updated_at,
      v.published_at
    FROM recipe_pages p
    JOIN recipe_versions v ON v.id = p.published_version_id
    WHERE p.slug = $1
    LIMIT 1
    `,
    [slug]
  );

  if (!rows.length) {
    return null;
  }

  return mapVersionToRecipePage(rows[0]);
}

router.get('/published', async (req, res) => {
  const limitParam = Number.parseInt(String(req.query.limit ?? ''), 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;
  const cursorUpdatedAtRaw = typeof req.query.cursorUpdatedAt === 'string' ? req.query.cursorUpdatedAt : null;
  const cursorIdRaw = typeof req.query.cursorId === 'string' ? req.query.cursorId : null;

  if ((cursorUpdatedAtRaw && !cursorIdRaw) || (!cursorUpdatedAtRaw && cursorIdRaw)) {
    return res.status(400).json({ error: 'Invalid cursor' });
  }

  const params: any[] = [];
  const publishedSortExpr = 'COALESCE(v.published_at, v.updated_at, p.updated_at)';
  let cursorClause = '';

  if (cursorUpdatedAtRaw && cursorIdRaw) {
    const parsedCursorDate = new Date(cursorUpdatedAtRaw);
    if (Number.isNaN(parsedCursorDate.getTime())) {
      return res.status(400).json({ error: 'Invalid cursor' });
    }
    const cursorUpdatedAtIdx = params.push(parsedCursorDate.toISOString());
    const cursorIdIdx = params.push(cursorIdRaw);
    cursorClause = `
      AND (
        ${publishedSortExpr} < $${cursorUpdatedAtIdx}::timestamptz
        OR (${publishedSortExpr} = $${cursorUpdatedAtIdx}::timestamptz AND p.id < $${cursorIdIdx}::uuid)
      )
    `;
  }

  const fetchLimit = limit + 1;
  const limitIdx = params.push(fetchLimit);

  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id AS page_id,
        p.slug,
        p.updated_at AS page_updated_at,
        v.status,
        v.title,
        v.recipe,
        v.meta,
        v.created_at AS version_created_at,
        v.updated_at AS version_updated_at,
        v.published_at,
        ${publishedSortExpr} AS published_sort
      FROM recipe_pages p
      JOIN recipe_versions v ON v.id = p.published_version_id
      WHERE p.published_version_id IS NOT NULL
      ${cursorClause}
      ORDER BY published_sort DESC, p.id DESC
      LIMIT $${limitIdx}
      `,
      params
    );

    const hasMore = rows.length > limit;
    const limitedRows = hasMore ? rows.slice(0, limit) : rows;

    const pages: RecipePageSummary[] = limitedRows.map((row) =>
      RecipePageSummarySchema.parse({
        page: mapVersionToRecipePage(row),
      })
    );

    let nextCursor: { cursorUpdatedAt: string; cursorId: string } | null = null;
    if (hasMore && limitedRows.length) {
      const lastRow = limitedRows[limitedRows.length - 1];
      const cursorDate =
        lastRow.published_sort ?? lastRow.published_at ?? lastRow.version_updated_at ?? lastRow.page_updated_at ?? lastRow.updated_at;
      if (cursorDate) {
        const dateValue = new Date(cursorDate);
        if (!Number.isNaN(dateValue.getTime())) {
          nextCursor = {
            cursorUpdatedAt: dateValue.toISOString(),
            cursorId: lastRow.page_id ?? lastRow.id,
          };
        }
      }
    }

    return res.json({ pages, limit, nextCursor });
  } catch (err) {
    console.error('Failed to list published recipe pages', err);
    return res.status(500).json({ error: 'Failed to list published recipes' });
  }
});

router.get('/published/:slug', async (req, res) => {
  try {
    const page = await loadPublishedRecipePageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to load published recipe page', err);
    return res.status(500).json({ error: 'Failed to load recipe' });
  }
});

router.use(requireAccess);

// Get paginated recipe pages in order of most recent updates
router.get('/', async (req, res) => {
  const limitParam = Number.parseInt(String(req.query.limit ?? ''), 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;
  const cursorUpdatedAtRaw = typeof req.query.cursorUpdatedAt === 'string' ? req.query.cursorUpdatedAt : null;
  const cursorIdRaw = typeof req.query.cursorId === 'string' ? req.query.cursorId : null;

  if ((cursorUpdatedAtRaw && !cursorIdRaw) || (!cursorUpdatedAtRaw && cursorIdRaw)) {
    return res.status(400).json({ error: 'Invalid cursor' });
  }

  let cursorClause = '';
  const params: any[] = [];

  if (cursorUpdatedAtRaw && cursorIdRaw) {
    const parsedCursorDate = new Date(cursorUpdatedAtRaw);
    if (Number.isNaN(parsedCursorDate.getTime())) {
      return res.status(400).json({ error: 'Invalid cursor' });
    }
    const cursorUpdatedAtIdx = params.push(parsedCursorDate.toISOString());
    const cursorIdIdx = params.push(cursorIdRaw);
    cursorClause = `
      WHERE (
        p.updated_at < $${cursorUpdatedAtIdx}::timestamptz
        OR (p.updated_at = $${cursorUpdatedAtIdx}::timestamptz AND p.id < $${cursorIdIdx}::uuid)
      )
    `;
  }

  const fetchLimit = limit + 1;
  const limitIdx = params.push(fetchLimit);

  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id AS page_id,
        p.slug,
        p.updated_at AS page_updated_at,
        v.status,
        v.title,
        v.recipe,
        v.meta,
        v.created_at AS version_created_at,
        v.updated_at AS version_updated_at,
        v.published_at
      FROM recipe_pages p
      JOIN LATERAL (
        SELECT status, title, recipe, meta, created_at, updated_at, published_at
        FROM recipe_versions
        WHERE page_id = p.id
        ORDER BY created_at DESC
        LIMIT 1
      ) v ON true
      ${cursorClause}
      ORDER BY p.updated_at DESC, p.id DESC
      LIMIT $${limitIdx}
      `,
      params
    );

    const hasMore = rows.length > limit;
    const limitedRows = hasMore ? rows.slice(0, limit) : rows;

    const pages: RecipePageSummary[] = limitedRows.map((row) =>
      RecipePageSummarySchema.parse({
        page: mapVersionToRecipePage(row),
      })
    );

    let nextCursor: { cursorUpdatedAt: string; cursorId: string } | null = null;
    if (hasMore && limitedRows.length) {
      const lastRow = limitedRows[limitedRows.length - 1];
      const cursorDate = lastRow.page_updated_at ?? lastRow.version_updated_at ?? lastRow.updated_at;
      if (cursorDate) {
        const dateValue = new Date(cursorDate);
        if (!Number.isNaN(dateValue.getTime())) {
          nextCursor = {
            cursorUpdatedAt: dateValue.toISOString(),
            cursorId: lastRow.page_id ?? lastRow.id,
          };
        }
      }
    }

    return res.json({ pages, limit, nextCursor });
  } catch (err) {
    console.error('Failed to list recipe pages', err);
    return res.status(500).json({ error: 'Failed to list recipes' });
  }
});

// Get recipe page by slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await loadRecipePageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to load recipe page', err);
    return res.status(500).json({ error: 'Failed to load recipe' });
  }
});

// Post recipe page to db
router.post('/', async (req, res) => {
  const parseResult = RecipePageCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
  }

  const payload: RecipePageCreatePayload = parseResult.data;
  const createdBy = getAuthenticatedUserId(req);
  if (!createdBy) {
    console.error('Authenticated user missing on recipe create request');
    return res.status(500).json({ error: 'Missing authenticated user' });
  }
  const status = payload.status ?? 'draft';
  const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
  const recipeJson = JSON.stringify(payload.recipe);
  const metaJson = JSON.stringify(payload.meta ?? {});

  try {
    const pageId = await withTransaction(async (client) => {
      const pageInsert = await client.query(
        `
        INSERT INTO recipe_pages (slug)
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
        INSERT INTO recipe_versions (page_id, version, status, title, recipe, meta, created_by, published_at)
        VALUES ($1, 1, $2::page_version_status, $3, $4::jsonb, $5::jsonb, $6, $7::timestamptz)
        RETURNING id, page_id, version, status, title, recipe, meta, created_by, created_at, updated_at, published_at
        `,
        [pageId, status, payload.title, recipeJson, metaJson, createdBy, publishedAt]
      );

      const version = versionInsert.rows[0];

      if (status === 'published') {
        await client.query(
          `UPDATE recipe_versions SET status = 'draft' WHERE page_id = $1 AND id <> $2 AND status = 'published'`,
          [pageId, version.id]
        );
      }

      await client.query(
        `
        UPDATE recipe_pages SET
          latest_version_id = $1,
          published_version_id = CASE WHEN $2 = 'published' THEN $1 ELSE published_version_id END,
          updated_at = now()
        WHERE id = $3
        `,
        [version.id, status, pageId]
      );

      return pageId;
    });

    const page = await loadRecipePageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to upsert recipe page', err);
    const pgErr = err as { code?: string; message?: string };
    const isUniqueViolation = pgErr?.code === '23505' || pgErr?.message === 'SLUG_CONFLICT';
    return res.status(isUniqueViolation ? 409 : 500).json({ error: 'Failed to save recipe' });
  }
});

// Update recipe page
router.put('/:slug', async (req, res) => {
  const parseResult = RecipePageUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
  }

  const payload: RecipePageUpdatePayload = parseResult.data;
  const createdBy = getAuthenticatedUserId(req);
  if (!createdBy) {
    console.error('Authenticated user missing on recipe update request');
    return res.status(500).json({ error: 'Missing authenticated user' });
  }
  const status = payload.status ?? 'draft';
  const publishedAt = payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null;
  const slugParam = req.params.slug;
  const recipeJson = JSON.stringify(payload.recipe);
  const metaJson = JSON.stringify(payload.meta ?? {});

  try {
    const pageId = await withTransaction(async (client) => {
      const resolvedPageId = await resolveRecipePageId(slugParam, client);
      if (!resolvedPageId) {
        throw new Error('PAGE_NOT_FOUND');
      }

      if (payload.slug) {
        await client.query(`UPDATE recipe_pages SET slug = $1 WHERE id = $2`, [payload.slug, resolvedPageId]);
      }

      const { rows: nextVersionRows } = await client.query(
        `SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM recipe_versions WHERE page_id = $1`,
        [resolvedPageId]
      );
      const nextVersion = Number(nextVersionRows[0]?.next_version ?? 1);

      if (status === 'published') {
        await client.query(
          `UPDATE recipe_versions SET status = 'draft' WHERE page_id = $1 AND status = 'published'`,
          [resolvedPageId]
        );
      }

      const versionInsert = await client.query(
        `
        INSERT INTO recipe_versions (page_id, version, status, title, recipe, meta, created_by, published_at)
        VALUES ($1, $2, $3::page_version_status, $4, $5::jsonb, $6::jsonb, $7, $8::timestamptz)
        RETURNING id, page_id, version, status, title, recipe, meta, created_by, created_at, updated_at, published_at
        `,
        [
          resolvedPageId,
          nextVersion,
          status,
          payload.title,
          recipeJson,
          metaJson,
          createdBy,
          publishedAt,
        ]
      );

      const version = versionInsert.rows[0];

      await client.query(
        `
        UPDATE recipe_pages SET
          latest_version_id = $1,
          published_version_id = CASE WHEN $2 = 'published' THEN $1 ELSE published_version_id END,
          updated_at = now()
        WHERE id = $3
        `,
        [version.id, status, resolvedPageId]
      );

      return resolvedPageId;
    });

    const page = await loadRecipePageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to update recipe page', err);
    const pgErr = err as { code?: string; message?: string };
    if (pgErr?.message === 'PAGE_NOT_FOUND') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.status(pgErr?.code === '23505' ? 409 : 500).json({ error: 'Failed to update recipe' });
  }
});

// Publish an existing version
router.post('/:slug/versions/:versionId/publish', async (req, res) => {
  const publishedAt =
    req.body?.publishedAt !== undefined && req.body?.publishedAt !== null
      ? new Date(req.body.publishedAt).toISOString()
      : null;

  try {
    const pageId = await withTransaction(async (client) => {
      const resolvedPageId = await resolveRecipePageId(req.params.slug, client);
      if (!resolvedPageId) {
        throw new Error('PAGE_NOT_FOUND');
      }

      const { rows: versionRows } = await client.query(
        `SELECT id FROM recipe_versions WHERE id = $1 AND page_id = $2 LIMIT 1`,
        [req.params.versionId, resolvedPageId]
      );

      if (!versionRows.length) {
        throw new Error('VERSION_NOT_FOUND');
      }

      await client.query(
        `UPDATE recipe_versions SET status = 'draft' WHERE page_id = $1 AND id <> $2 AND status = 'published'`,
        [resolvedPageId, req.params.versionId]
      );

      await client.query(
        `
        UPDATE recipe_versions
        SET status = 'published', published_at = COALESCE($3::timestamptz, published_at, now())
        WHERE id = $2 AND page_id = $1
        `,
        [resolvedPageId, req.params.versionId, publishedAt]
      );

      await client.query(
        `UPDATE recipe_pages SET published_version_id = $1, updated_at = now() WHERE id = $2`,
        [req.params.versionId, resolvedPageId]
      );

      return resolvedPageId;
    });

    const page = await loadRecipePageById(pageId);
    if (!page) {
      throw new Error('PAGE_NOT_FOUND');
    }
    return res.json({ page });
  } catch (err) {
    console.error('Failed to publish recipe version', err);
    const code = (err as { message?: string }).message;
    if (code === 'PAGE_NOT_FOUND' || code === 'VERSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Recipe or version not found' });
    }
    return res.status(500).json({ error: 'Failed to publish recipe version' });
  }
});

// Delete recipe page
router.delete('/:slug', async (req, res) => {
  try {
    const pageId = await resolveRecipePageId(req.params.slug);
    if (!pageId) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const { rowCount } = await pool.query(`DELETE FROM recipe_pages WHERE id = $1`, [pageId]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete recipe page', err);
    return res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
