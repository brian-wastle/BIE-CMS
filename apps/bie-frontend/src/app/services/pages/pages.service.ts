import { Injectable } from '@angular/core';
import type { Page, PageSummary, PageUpdate, PageWrite } from 'bie-models';

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
  private unwrapPage(payload: any): Page {
    if (payload?.page?.page) {
      return payload.page.page;
    }
    if (payload?.page) {
      return payload.page;
    }
    return payload;
  }

  // Get paged paginated
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
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load pages.');
    const payload = await res.json();
    return {
      pages: payload.pages ?? [],
      limit: Number(payload.limit) || params.limit || 10,
      nextCursor: payload.nextCursor ?? null,
    };
  }

  // Get page by slug or id
  async get(idOrSlug: string): Promise<Page> {
    const res = await fetch(`/api/pages/${encodeURIComponent(idOrSlug)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load page.');
    return this.unwrapPage(await res.json());
  }

  // Create new page
  async post(payload: PageWrite): Promise<Page> {
    const res = await fetch('/api/pages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save page.');
    return this.unwrapPage(await res.json());
  }

  // Update an existing page
  async update(idOrSlug: string, payload: PageUpdate): Promise<Page> {
    const res = await fetch(`/api/pages/${encodeURIComponent(idOrSlug)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update page.');
    return this.unwrapPage(await res.json());
  }

  // Delete page
  async delete(idOrSlug: string): Promise<void> {
    const res = await fetch(`/api/pages/${encodeURIComponent(idOrSlug)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete page.');
  }
}
