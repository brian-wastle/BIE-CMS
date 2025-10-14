import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  handle?: string;
  cdnUrl?: string;
}

interface DirectoryMeta {
  directory: string | null;
  itemCount: number;
  lastUploaded: string | null;
}

const UNSORTED_LABEL = 'Unsorted';
const SKELETON_TILE_COUNT = 6;
const UNSORTED_KEY = '__unsorted__';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {
  readonly folderIcon = 'assets/foldericon.svg';

  readonly queue = signal<UploadItem[]>([]);
  readonly directories = signal<DirectoryMeta[]>([]);
  readonly directoriesLoading = signal(true);
  readonly directoryError = signal<string | null>(null);
  readonly selectedDirectory = signal<string | null>(null);
  readonly customDirectoryActive = signal(false);

  readonly loading = signal(false);
  readonly dragActive = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  directoryInput = '';
  mimetypesInput = '';

  readonly skeletonTiles = Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => index);
  readonly hasFiles = computed(() => this.queue().length > 0);
  readonly hasDirectories = computed(() => this.directories().length > 0);
  readonly totalSize = computed(() => this.queue().reduce((sum, item) => sum + item.file.size, 0));
  readonly selectedMimetypes = computed(() =>
    this.mimetypesInput
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  readonly activeDirectoryLabel = computed(() => this.computeActiveDirectoryLabel());

  constructor() {
    void this.refreshDirectories();
  }

  async refreshDirectories() {
    this.directoriesLoading.set(true);
    this.directoryError.set(null);
    try {
      const response = await fetch('/api/media/directories', {
        credentials: 'include'
      });
      if (!response.ok) {
        const problem = await safeJson(response);
        throw new Error(problem?.error || 'Unable to load directories');
      }
      const payload = (await response.json()) as { directories?: DirectoryMeta[] };
      const list = Array.isArray(payload.directories) ? payload.directories : [];
      const usingCustom = this.customDirectoryActive();
      const selected = this.selectedDirectory();

      this.directories.set(list);

      if (!usingCustom) {
        const existingKeys = new Set(list.map((entry) => this.directoryKey(entry.directory ?? null)));
        if (!existingKeys.has(this.directoryKey(selected))) {
          this.selectedDirectory.set(null);
          if (!this.directoryInput.trim()) {
            this.directoryInput = '';
          }
        }
      }
    } catch (err) {
      console.error('Failed to load media directories', err);
      this.directoryError.set((err as Error).message ?? 'Failed to load directories');
    } finally {
      this.directoriesLoading.set(false);
    }
  }

  triggerFileDialog(input: HTMLInputElement) {
    input.click();
  }

  onFileInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const files = target?.files;
    if (files?.length) {
      this.onSelectFiles(files);
    }
    if (target) {
      target.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.onSelectFiles(files);
    }
    this.dragActive.set(false);
  }

  onSelectFiles(list: FileList | File[]) {
    const incoming: File[] = Array.from(list);
    let added = 0;
    this.queue.update((current) => {
      const existingKeys = new Set(current.map((item) => `${item.file.name}:${item.file.size}`));
      const merged = [...current];
      for (const file of incoming) {
        const key = `${file.name}:${file.size}`;
        if (existingKeys.has(key)) {
          continue;
        }
        merged.push({
          id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: 'pending'
        });
        existingKeys.add(key);
        added += 1;
      }
      return merged;
    });
    if (!added) {
      this.success.set(null);
      this.uploadError.set('These files are already queued.');
    } else {
      this.uploadError.set(null);
      this.success.set(null);
    }
  }

  removeFromQueue(id: string) {
    this.queue.update((items) => items.filter((item) => item.id !== id));
  }

  clearQueue() {
    this.queue.set([]);
    this.uploadError.set(null);
    this.success.set(null);
  }

  onDirectorySelect(entry: DirectoryMeta) {
    const directory = entry.directory ?? null;
    this.selectedDirectory.set(directory);
    this.customDirectoryActive.set(false);
    this.directoryInput = directory ?? '';
    this.uploadError.set(null);
    this.success.set(null);
  }

  onDirectoryInputChange(value: string) {
    this.directoryInput = value;
    const trimmed = value.trim();
    if (!trimmed) {
      this.customDirectoryActive.set(false);
      this.selectedDirectory.set(null);
      return;
    }
    const match = this.directories().find((entry) => entry.directory === trimmed);
    if (match) {
      this.customDirectoryActive.set(false);
      this.selectedDirectory.set(match.directory ?? null);
    } else {
      this.customDirectoryActive.set(true);
      this.selectedDirectory.set(trimmed);
    }
  }

  directoryLabel(directory: string | null) {
    return directory ?? UNSORTED_LABEL;
  }

  itemCountLabel(count: number) {
    return `${count} item${count === 1 ? '' : 's'}`;
  }

  isDirectorySelected(directory: string | null) {
    if (this.customDirectoryActive()) {
      return false;
    }
    return this.directoryKey(this.selectedDirectory()) === this.directoryKey(directory ?? null);
  }

  formatSize(bytes: number) {
    if (!bytes) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value < 10 && exponent > 0 ? 1 : 0)} ${units[exponent]}`;
  }

  async uploadAll() {
    if (!this.queue().length || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.uploadError.set(null);
    this.success.set(null);

    const allowedTypes = this.selectedMimetypes();
    if (allowedTypes.length) {
      const disallowed = this.queue().filter((entry) => !this.matchesMimetype(entry.file.type, allowedTypes));
      if (disallowed.length) {
        for (const item of disallowed) {
          this.updateQueue(item.id, {
            status: 'error',
            error: 'File type not permitted by the current filter.',
            progress: 0
          });
        }
        this.uploadError.set('Remove files that do not match the allowed MIME types.');
        this.loading.set(false);
        return;
      }
    }

    const directory = this.resolveActiveDirectory();

    for (const item of this.queue()) {
      try {
        await this.uploadToServer(item.id, directory);
      } catch (err) {
        this.updateQueue(item.id, {
          status: 'error',
          error: (err as Error).message ?? 'Upload failed',
          progress: 0
        });
      }
    }

    this.loading.set(false);
    const allUploaded = this.queue().length && this.queue().every((entry) => entry.status === 'success');
    if (allUploaded) {
      this.success.set('Upload complete!');
      this.uploadError.set(null);
      void this.refreshDirectories();
    }
  }

  private async uploadToServer(itemId: string, directory: string | null) {
    const target = this.queue().find((entry) => entry.id === itemId);
    if (!target) {
      return;
    }
    this.updateQueue(itemId, { status: 'uploading', progress: 10, error: undefined });

    const form = new FormData();
    form.append('fileUpload', target.file, target.file.name);
    if (target.file.type) {
      form.append('mimetype', target.file.type);
    }
    if (directory) {
      form.append('directory', directory);
    }

    let response: Response;
    try {
      response = await fetch('/api/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: form
      });
    } catch (err) {
      console.error('Failed to upload media (network)', err);
      throw new Error('Network error while uploading file.');
    }

    if (!response.ok) {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.error === 'string') {
          throw new Error(parsed.error);
        }
      } catch {
        // Ignore JSON parse errors, fall back to raw text.
      }
      throw new Error(text || 'Upload failed');
    }

    const payload = (await response.json()) as { handle?: string; url?: string | null };
    this.updateQueue(itemId, {
      status: 'success',
      progress: 100,
      handle: payload.handle ?? undefined,
      cdnUrl: payload.url ?? undefined
    });
  }

  private resolveActiveDirectory(): string | null {
    const input = this.directoryInput.trim();
    if (this.customDirectoryActive()) {
      return input || null;
    }
    const selected = this.selectedDirectory();
    if (selected) {
      const trimmed = selected.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    if (input) {
      return input;
    }
    return null;
  }

  private matchesMimetype(fileType: string | undefined, allowed: string[]) {
    if (!allowed.length) {
      return true;
    }
    const type = (fileType || '').toLowerCase();
    if (!type.includes('/')) {
      return allowed.includes(type);
    }
    const [major = '', minor = ''] = type.split('/');
    for (const pattern of allowed) {
      if (!pattern.includes('/')) {
        if (type === pattern) {
          return true;
        }
        continue;
      }
      const [allowedMajor = '', allowedMinor = ''] = pattern.split('/');
      const majorMatches = allowedMajor === '*' || allowedMajor === major;
      const minorMatches = allowedMinor === '*' || allowedMinor === minor;
      if (majorMatches && minorMatches) {
        return true;
      }
    }
    return false;
  }

  private updateQueue(id: string, patch: Partial<UploadItem>) {
    this.queue.update((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  private computeActiveDirectoryLabel() {
    const selected = this.selectedDirectory();
    if (this.customDirectoryActive()) {
      const trimmed = selected?.trim() ?? '';
      return trimmed || UNSORTED_LABEL;
    }
    if (selected === null) {
      return UNSORTED_LABEL;
    }
    const trimmed = selected.trim();
    return trimmed || UNSORTED_LABEL;
  }

  private directoryKey(directory: string | null) {
    if (directory === null) {
      return UNSORTED_KEY;
    }
    return directory;
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
