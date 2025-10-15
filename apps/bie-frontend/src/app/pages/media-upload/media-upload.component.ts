import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {
  readonly folderIcon = 'assets/foldericon.svg';
  // Track directories
  readonly queue = signal<UploadItem[]>([]);
  readonly directories = signal<DirectoryMeta[]>([]);
  readonly directoriesLoading = signal(true);
  readonly directoryError = signal<string | null>(null);
  readonly selectedDirectory = signal<string | null>(null);
  readonly tempDirectories = signal<DirectoryMeta[]>([]); // just dirs created this session, linked to page refresh
  readonly sessionDirectories = computed(() => this.tempDirectories().concat(this.directories()));  // all dirs persistent and temporary
  
  // Manage directories
  readonly pendingDirectory = signal<DirectoryMeta | null>(null); // current directory under editing
  readonly dirNameFC = new FormControl<string>('', { nonNullable: true });

  // Page status
  readonly loading = signal(false);
  readonly dragActive = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  mimetypesInput = '';

  readonly skeletonTiles = Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => index);
  readonly hasFiles = computed(() => this.queue().length > 0);
  readonly disableButtons = computed(() => this.loading() || this.pendingDirectory() !== null);
  readonly hasDirectories = computed(() => this.sessionDirectories().length > 0);
  readonly totalSize = computed(() => this.queue().reduce((sum, item) => sum + item.file.size, 0));
  readonly selectedMimetypes = computed(() =>
    this.mimetypesInput.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  );
  readonly activeDirectoryLabel = computed(() => this.directoryLabel(this.selectedDirectory()));

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
      this.directories.set(list);

      const serverKeys = new Set(list.map((entry) => this.normalizeDirectory(entry.directory ?? null)));

      this.tempDirectories.update((dirs) =>
        dirs.filter((entry) => {
          if (entry === this.pendingDirectory()) {
            return true;
          }
          const key = this.normalizeDirectory(entry.directory ?? null);
          return !serverKeys.has(key);
        })
      );

      const selected = this.selectedDirectory();
      if (selected !== null) {
        const knownKeys = new Set([
          ...serverKeys,
          ...this.tempDirectories().map((entry) => this.normalizeDirectory(entry.directory ?? null))
        ]);
        if (!knownKeys.has(this.normalizeDirectory(selected))) {
          this.selectedDirectory.set(null);
        }
      }
    } catch (err) {
      console.error('Failed to load media directories', err);
      this.directoryError.set((err as Error).message ?? 'Failed to load directories');
    } finally {
      this.directoriesLoading.set(false);
    }
  }

  addTempDirectory() {
    if (this.pendingDirectory()) {
      return;
    }
    const newDir: DirectoryMeta = { directory: '', itemCount: 0, lastUploaded: null };
    this.tempDirectories.update((dirs) => [newDir, ...dirs]);
    this.dirNameFC.setValue('');
    this.pendingDirectory.set(newDir);
    this.directoryError.set(null);
  }

  savePendingDirectory() {
    const pending = this.pendingDirectory();
    if (!pending) {
      return;
    }
    const error = this.pendingDirectoryError();
    if (error) {
      return;
    }
    const name = this.dirNameFC.value.trim();
    this.tempDirectories.update((dirs) =>
      dirs.map((entry) => (entry === pending ? { ...entry, directory: name, lastUploaded: null } : entry))
    );
    this.pendingDirectory.set(null);
    this.dirNameFC.setValue('');
  }

  cancelPendingDirectory() {
    const pending = this.pendingDirectory();
    if (!pending) {
      return;
    }
    this.tempDirectories.update((dirs) => dirs.filter((entry) => entry !== pending));
    this.pendingDirectory.set(null);
    this.dirNameFC.setValue('');
  }

  pendingDirectoryError(): string | null {
    const pending = this.pendingDirectory();
    if (!pending) {
      return null;
    }
    const raw = this.dirNameFC.value;
    const trimmed = raw.trim();
    if (!trimmed) {
      return 'Folder name is required.';
    }
    const key = this.normalizeDirectory(trimmed);
    const duplicate = this.sessionDirectories().some((entry) => {
      if (entry === pending) {
        return false;
      }
      return this.normalizeDirectory(entry.directory ?? null) === key;
    });
    if (duplicate) {
      return 'That folder already exists.';
    }
    return null;
  }

  // Pop-up file picker on "dropzone" HTML input element
  triggerFileDialog(input: HTMLInputElement) {
    input.showPicker();
  }

  //Handle file selection
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
    if (this.pendingDirectory()) {
      return;
    }
    const selected = entry.directory?.trim();
    this.selectedDirectory.set(selected || null);
    this.uploadError.set(null);
    this.success.set(null);
  }

  directoryLabel(directory: string | null) {
    return directory?.trim() || UNSORTED_LABEL;
  }

  itemCountLabel(count: number) {
    return `${count} item${count === 1 ? '' : 's'}`;
  }

  isDirectorySelected(directory: string | null) {
    return this.normalizeDirectory(this.selectedDirectory()) === this.normalizeDirectory(directory ?? null);
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
    const selected = this.selectedDirectory();
    if (!selected) {
      return null;
    }
    const trimmed = selected.trim();
    return trimmed || null;
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

  private normalizeDirectory(directory: string | null) {
    const value = directory?.trim();
    return value || UNSORTED_KEY;
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
