import { Injectable, PLATFORM_ID, REQUEST, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Request } from 'express';
import type {
  RecipePage,
  RecipePageSummary,
  RecipePageUpdatePayload,
  RecipePageCreatePayload,
} from 'bie-models';
import { AuthSessionService } from '../auth-session/auth-session.service';

export interface RecipeListCursor {
  cursorUpdatedAt: string;
  cursorId: string;
}

export interface RecipeListParams {
  limit?: number;
  cursorUpdatedAt?: string;
  cursorId?: string;
}

export interface RecipeListResult {
  pages: RecipePageSummary[];
  limit: number;
  nextCursor: RecipeListCursor | null;
}

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly serverRequest = inject<Request | null>(REQUEST, { optional: true }) ?? null;
  private readonly authSession = inject(AuthSessionService);

  private unwrapPage(payload: any): RecipePage {
    if (payload?.page?.page) {
      return payload.page.page;
    }
    if (payload?.page) {
      return payload.page;
    }
    return payload;
  }

  // Get all recipes paginated
  async list(params: RecipeListParams = {}): Promise<RecipeListResult> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursorUpdatedAt && params.cursorId) {
      search.set('cursorUpdatedAt', params.cursorUpdatedAt);
      search.set('cursorId', params.cursorId);
    }
    const query = search.toString();
    const url = query ? `/api/recipes?${query}` : '/api/recipes';
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(url), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load recipes.');
    const payload = await res.json();
    return {
      pages: payload.pages ?? [],
      limit: Number(payload.limit) || params.limit || 10,
      nextCursor: payload.nextCursor ?? null,
    };
  }

  // Get published recipes paginated 
  async listPublished(params: RecipeListParams = {}): Promise<RecipeListResult> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursorUpdatedAt && params.cursorId) {
      search.set('cursorUpdatedAt', params.cursorUpdatedAt);
      search.set('cursorId', params.cursorId);
    }
    const query = search.toString();
    const url = query ? `/api/recipes/published?${query}` : '/api/recipes/published';
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(url), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load published recipes.');
    const payload = await res.json();
    return {
      pages: payload.pages ?? [],
      limit: Number(payload.limit) || params.limit || 10,
      nextCursor: payload.nextCursor ?? null,
    };
  }

  // Get recipe by slug
  async get(slug: string): Promise<RecipePage> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/recipes/${encodeURIComponent(slug)}`), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load recipe.');
    return this.unwrapPage(await res.json());
  }

  // Get published recipe by slug
  async getPublished(slug: string): Promise<RecipePage> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/recipes/published/${encodeURIComponent(slug)}`), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error(res.status === 404 ? 'Published recipe not found.' : 'Failed to load recipe.');
    return this.unwrapPage(await res.json());
  }

  // Create new recipe page
  async post(payload: RecipePageCreatePayload): Promise<RecipePage> {
    const body = JSON.stringify(payload);
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl('/api/recipes'), this.withServerCookies({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      }))
    );
    if (!res.ok) throw new Error('Failed to save recipe.');
    return this.unwrapPage(await res.json());
  }

  // Update an existing recipe page by slug
  async update(slug: string, payload: RecipePageUpdatePayload): Promise<RecipePage> {
    const body = JSON.stringify(payload);
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/recipes/${encodeURIComponent(slug)}`), this.withServerCookies({
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      }))
    );
    if (!res.ok) throw new Error('Failed to update recipe.');
    return this.unwrapPage(await res.json());
  }

  // Delete recipe by slug
  async delete(slug: string): Promise<void> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/recipes/${encodeURIComponent(slug)}`), this.withServerCookies({
        method: 'DELETE',
        credentials: 'include',
      }))
    );
    if (!res.ok) throw new Error('Failed to delete recipe.');
  }

  private buildApiUrl(path: string) {
    if (isPlatformBrowser(this.platformId)) {
      return path;
    }
    const envBase = process.env['PUBLIC_API_BASE_URL'] ?? process.env['API_TARGET'];
    if (envBase) {
      return new URL(path, envBase).toString();
    }
    const req = this.serverRequest;
    const protoHeader = req?.headers?.['x-forwarded-proto'] ?? (req as any)?.protocol ?? 'http';
    const hostHeader = req?.headers?.['x-forwarded-host'] ?? req?.headers?.host;
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : String(protoHeader ?? 'http').split(',')[0]?.trim() || 'http';
    const host = Array.isArray(hostHeader) ? hostHeader[0] : String(hostHeader ?? '').split(',')[0]?.trim();
    if (host) {
      return `${proto}://${host}${path}`;
    }
    return `http://127.0.0.1:4000${path}`;
  }

  private withServerCookies(init?: RequestInit): RequestInit | undefined {
    if (isPlatformBrowser(this.platformId)) {
      return init;
    }
    const cookie = this.serverRequest?.headers?.cookie;
    if (!cookie) {
      return init;
    }
    const headers = new Headers(init?.headers ?? {});
    headers.set('cookie', cookie);
    return { ...init, headers };
  }
}
