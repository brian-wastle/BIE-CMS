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

interface FilestackPolicyResponse {
  apiKey: string;
  policy: string;
  signature: string;
  expiresAt: number;
  storagePrefix: string;
  directory: string | null;
  cdnBaseUrl?: string | null;
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
  readonly policyLoading = signal(false);
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
      .map((value) => value.trim())
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

    let policy: FilestackPolicyResponse | null = null;
    try {
      policy = await this.createPolicy();
    } catch (err) {
      this.uploadError.set((err as Error).message ?? 'Failed to create upload policy');
      this.loading.set(false);
      return;
    }

    for (const item of this.queue()) {
      try {
        await this.uploadWithPolicy(item.id, policy);
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

  private async createPolicy(): Promise<FilestackPolicyResponse> {
    this.policyLoading.set(true);
    try {
      const body: Record<string, unknown> = {};
      const directory = this.directoryInput.trim();
      if (directory) {
        body['directory'] = directory;
      }
      const types = this.selectedMimetypes();
      if (types.length) {
        body['mimetypes'] = types;
      }
      const response = await fetch('/api/media/policy', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const problem = await safeJson(response);
        throw new Error(problem?.error || 'Failed to request upload policy');
      }
      return (await response.json()) as FilestackPolicyResponse;
    } finally {
      this.policyLoading.set(false);
    }
  }

  private async uploadWithPolicy(itemId: string, policy: FilestackPolicyResponse) {
    const target = this.queue().find((entry) => entry.id === itemId);
    if (!target) {
      return;
    }
    this.updateQueue(itemId, { status: 'uploading', progress: 5, error: undefined });

    const form = new FormData();
    form.append('policy', policy.policy);
    form.append('signature', policy.signature);
    form.append('fileUpload', target.file, target.file.name);
    form.append('path', `/${policy.storagePrefix}/${target.file.name}`);
    if (target.file.type) {
      form.append('mimetype', target.file.type);
    }

    const response = await fetch('https://www.filestackapi.com/api/store/S3', {
      method: 'POST',
      headers: {
        'Filestack-Api-Key': policy.apiKey
      },
      body: form
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Filestack upload failed');
    }

    const payload = (await response.json()) as { handle?: string; url?: string };
    this.updateQueue(itemId, {
      status: 'success',
      progress: 100,
      handle: payload.handle,
      cdnUrl: payload.url
    });
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
