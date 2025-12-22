import { Injectable, PLATFORM_ID, REQUEST, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Request } from 'express';
import type { Page, PageSummary, PageUpdate, PageWrite } from 'bie-models';
import { AuthSessionService } from '../auth-session/auth-session.service';

export interface PageListCursor {
  cursorUpdatedAt: string;
  cursorId: string;
}

export interface PageListParams {
  limit?: number;
  cursorUpdatedAt?: string;
  cursorId?: string;
}

export interface PageListResult {
  pages: PageSummary[];
  limit: number;
  nextCursor: PageListCursor | null;
}

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly serverRequest = inject<Request | null>(REQUEST, { optional: true }) ?? null;
  private readonly authSession = inject(AuthSessionService);

  private unwrapPage(payload: any): Page {
    if (payload?.page?.page) {
      return payload.page.page;
    }
    if (payload?.page) {
      return payload.page;
    }
    return payload;
  }

  // Get all blogs paginated
  async list(params: PageListParams = {}): Promise<PageListResult> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursorUpdatedAt && params.cursorId) {
      search.set('cursorUpdatedAt', params.cursorUpdatedAt);
      search.set('cursorId', params.cursorId);
    }
    const query = search.toString();
    const url = query ? `/api/pages?${query}` : '/api/pages';
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(url), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load pages.');
    const payload = await res.json();
    return {
      pages: payload.pages ?? [],
      limit: Number(payload.limit) || params.limit || 10,
      nextCursor: payload.nextCursor ?? null,
    };
  }
  // Get published blogs paginated 
  async listPublished(params: PageListParams = {}): Promise<PageListResult> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursorUpdatedAt && params.cursorId) {
      search.set('cursorUpdatedAt', params.cursorUpdatedAt);
      search.set('cursorId', params.cursorId);
    }
    const query = search.toString();
    const url = query ? `/api/pages/published?${query}` : '/api/pages/published';
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(url), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load published pages.');
    const payload = await res.json();
    return {
      pages: payload.pages ?? [],
      limit: Number(payload.limit) || params.limit || 10,
      nextCursor: payload.nextCursor ?? null,
    };
  }

  // Get blog by slug
  async get(slug: string): Promise<Page> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/pages/${encodeURIComponent(slug)}`), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error('Failed to load page.');
    return this.unwrapPage(await res.json());
  }

  // Get published blog by slug
  async getPublished(slug: string): Promise<Page> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/pages/published/${encodeURIComponent(slug)}`), this.withServerCookies({ credentials: 'include' }))
    );
    if (!res.ok) throw new Error(res.status === 404 ? 'Published page not found.' : 'Failed to load page.');
    return this.unwrapPage(await res.json());
  }

  // Create new blog
  async post(payload: PageWrite): Promise<Page> {
    const body = JSON.stringify(payload);
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl('/api/pages'), this.withServerCookies({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      }))
    );
    if (!res.ok) throw new Error('Failed to save page.');
    return this.unwrapPage(await res.json());
  }

  // Update an existing blog by slug
  async update(slug: string, payload: PageUpdate): Promise<Page> {
    const body = JSON.stringify(payload);
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/pages/${encodeURIComponent(slug)}`), this.withServerCookies({
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
      }))
    );
    if (!res.ok) throw new Error('Failed to update page.');
    return this.unwrapPage(await res.json());
  }

  // Delete blog by slug
  async delete(slug: string): Promise<void> {
    const res = await this.authSession.withAuthRetry(() =>
      fetch(this.buildApiUrl(`/api/pages/${encodeURIComponent(slug)}`), this.withServerCookies({
        method: 'DELETE',
        credentials: 'include',
      }))
    );
    if (!res.ok) throw new Error('Failed to delete page.');
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
