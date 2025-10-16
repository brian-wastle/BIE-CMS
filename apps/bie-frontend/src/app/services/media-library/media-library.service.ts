import { Injectable, effect, signal } from '@angular/core';
import type { DirectoryMeta } from 'bie-models';

const UNSORTED_KEY = '__unsorted__';
const TEMP_DIRECTORY_STORAGE_KEY = 'media-upload:temp-directories';

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

  // Trim directory names and remove special characters and spaces
  public normalizeDirectory(dirName: string | null) {
    const value = dirName?.trim();
    const normalizedValue = value?.replace(/[^a-zA-Z0-9]/g, "");
    return normalizedValue || UNSORTED_KEY;
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
        .filter((entry): entry is DirectoryMeta => entry !== null);
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
