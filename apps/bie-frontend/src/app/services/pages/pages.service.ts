import { Injectable } from '@angular/core';
import type { PageDetail, PageSummary, PageUpdate, PageWrite } from 'bie-models';

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  // Get all pages
  async list(): Promise<PageSummary[]> {
    const res = await fetch('/api/pages', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load pages.');
    return (await res.json()).pages ?? [];
  }

  // Get page by slug or id
  async get(idOrSlug: string): Promise<PageDetail> {
    const res = await fetch(`/api/pages/${encodeURIComponent(idOrSlug)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load page.');
    return (await res.json()).page;
  }

  // Create new page
  async post(payload: PageWrite): Promise<PageDetail> {
    const res = await fetch('/api/pages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save page.');
    return (await res.json()).page;
  }

  // Create a new version for an existing page (optionally publish it)
  async update(idOrSlug: string, payload: PageUpdate): Promise<PageDetail> {
    const res = await fetch(`/api/pages/${encodeURIComponent(idOrSlug)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update page.');
    return (await res.json()).page;
  }

  // Publish a specific version of a page
  async publishVersion(idOrSlug: string, versionId: string, publishedAt?: string | null): Promise<PageDetail> {
    const res = await fetch(
      `/api/pages/${encodeURIComponent(idOrSlug)}/versions/${encodeURIComponent(versionId)}/publish`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: publishedAt ?? null }),
      }
    );
    if (!res.ok) throw new Error('Failed to publish page version.');
    return (await res.json()).page;
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
