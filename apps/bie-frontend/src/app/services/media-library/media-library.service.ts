import { Injectable, effect, signal } from '@angular/core';
import type { DirectoryMeta } from 'bie-models';

const UNSORTED_KEY = '__unsorted__';
const TEMP_DIRECTORY_STORAGE_KEY = 'media-upload:temp-directories';

export type MediaSort = 'created_desc' | 'created_asc' | 'filename';

export interface MediaItem {
  handle: string;
  directory: string | null;
  filename: string | null;
  mimetype: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  metadata: unknown;
  cdnUrl: string | null;
  storagePath: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MediaLibraryService {
  readonly tempDirectories = signal<DirectoryMeta[]>(this.restoreTempDirectories());

  constructor() {
    const storage = this.getSessionStorage();
    if (storage) {
      effect(() => {
        const snapshot = this.tempDirectories();
        try {
          if (!snapshot.length) {
            storage.removeItem(TEMP_DIRECTORY_STORAGE_KEY);
          } else {
            storage.setItem(TEMP_DIRECTORY_STORAGE_KEY, JSON.stringify(snapshot));
          }
        } catch (err) {
          console.warn('Failed to persist temporary directories to session storage.', err);
        }
      });
    }
  }

  async fetchDirectories():Promise<DirectoryMeta[]> {
      const response = await fetch('/api/media/directories', { credentials: 'include' });
      if (!response.ok) {
        const problem: unknown = await response.json().catch(() => null);
        if (problem && typeof problem === 'object' && typeof (problem as any).error === 'string') {
           throw new Error((problem as any).error);
        }
        throw new Error(response.statusText || `Unable to load directories. Status: ${response.status})`);
      }
      const payload = (await response.json()) as { directories?: DirectoryMeta[] };

      return Array.isArray(payload.directories) ? payload.directories : [];
  }

  async fetchFiles(directory: string | null, sort: MediaSort = 'created_desc'): Promise<MediaItem[]> {
    const params = new URLSearchParams({ sort });
    if (directory && directory.trim().length > 0) {
      params.set('directory', directory.trim());
    }

    const query = params.toString();
    const response = await fetch(`/api/media/files${query ? `?${query}` : ''}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const problem: unknown = await response.json().catch(() => null);
      if (problem && typeof problem === 'object' && typeof (problem as any).error === 'string') {
        throw new Error((problem as any).error);
      }
      throw new Error(response.statusText || `Unable to load media files. Status: ${response.status}`);
    }

    const payload = (await response.json()) as { items?: unknown };
    if (!payload || !Array.isArray(payload.items)) {
      return [];
    }
    return payload.items
      .map((entry) => this.toMediaItem(entry))
      .filter((entry): entry is MediaItem => entry !== null);
  }

  async deleteFile(handle: string): Promise<void> {
    const response = await fetch(`/api/media/${encodeURIComponent(handle)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const text = await response.text().catch(() => null);
      throw new Error(text || response.statusText || 'Failed to delete media file');
    }
  }

  // Trim directory names and remove special characters and spaces
  public normalizeDirectory(dirName: string | null) {
    const value = dirName?.trim();
    const normalizedValue = value?.replace(/[^a-zA-Z0-9]/g, "");
    return normalizedValue || UNSORTED_KEY;
  }

  private toMediaItem(value: unknown): MediaItem | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const entry = value as Record<string, unknown>;
    const handle = typeof entry['handle'] === 'string' ? entry['handle'] : null;
    if (!handle) {
      return null;
    }

    return {
      handle,
      directory: typeof entry['directory'] === 'string' && entry['directory'].length > 0 ? entry['directory'] : null,
      filename: typeof entry['filename'] === 'string' ? entry['filename'] : null,
      mimetype: typeof entry['mimetype'] === 'string' ? entry['mimetype'] : null,
      size: typeof entry['size'] === 'number' && Number.isFinite(entry['size']) ? entry['size'] : null,
      width: typeof entry['width'] === 'number' && Number.isFinite(entry['width']) ? entry['width'] : null,
      height: typeof entry['height'] === 'number' && Number.isFinite(entry['height']) ? entry['height'] : null,
      metadata: entry['metadata'] ?? null,
      cdnUrl: typeof entry['cdn_url'] === 'string' ? entry['cdn_url'] : null,
      storagePath: typeof entry['storage_path'] === 'string' ? entry['storage_path'] : null,
      createdAt: typeof entry['created_at'] === 'string' ? entry['created_at'] : null,
      updatedAt: typeof entry['updated_at'] === 'string' ? entry['updated_at'] : null,
    };
  }

  private restoreTempDirectories(): DirectoryMeta[] {
    const storage = this.getSessionStorage();
    if (!storage) {
      return [];
    }
    const raw = storage.getItem(TEMP_DIRECTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((entry) => this.toDirectoryMeta(entry))
        .filter((entry): entry is DirectoryMeta => entry !== null)
        .map((entry) => {
          if (!entry.directory || entry.directory.trim().length === 0) {
            return { ...entry, directory: 'Untitled' };
          }
          return entry;
        });
    } catch (err) {
      console.warn('Failed to restore temporary directories from session storage.', err);
      return [];
    }
  }

  private toDirectoryMeta(value: unknown): DirectoryMeta | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const entry = value as Record<string, unknown>;
    const directory = typeof entry['directory'] === 'string' ? entry['directory'] : null;
    const itemCount =
      typeof entry['itemCount'] === 'number' && Number.isFinite(entry['itemCount']) ? entry['itemCount'] : 0;
    const lastUploaded = typeof entry['lastUploaded'] === 'string' ? entry['lastUploaded'] : null;
    return { directory, itemCount, lastUploaded };
  }

  private getSessionStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}
