import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MediaBrowserComponent } from '../../components/media-browser/media-browser.component';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';
type ViewMode = 'list' | 'grid' | 'details';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  handle?: string;
  cdnUrl?: string;
}

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MediaBrowserComponent],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {
  @ViewChild(MediaBrowserComponent) mediaBrowser?: MediaBrowserComponent;

  readonly queue = signal<UploadItem[]>([]);
  readonly viewMode = signal<ViewMode>('grid');
  readonly loading = signal(false);
  readonly dragActive = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly hasFiles = computed(() => this.queue().length > 0);
  readonly totalSize = computed(() => this.queue().reduce((sum, item) => sum + item.file.size, 0));
  
  async refreshDirectories() {
    await this.mediaBrowser?.refresh();
  }

  onDirectoryChanged(_directory: string | null) {
    this.uploadError.set(null);
    this.success.set(null);
  }

  onBrowserViewModeChange(mode: ViewMode) {
    if (this.viewMode() === mode) {
      return;
    }
    this.viewMode.set(mode);
  }

  onCreateFolderRequested() {
    this.mediaBrowser?.createNewDir();
  }

  refreshFolders() {
    void this.refreshDirectories();
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

    const directory = this.mediaBrowser?.selectedDirectory() ?? null;

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
        // Let error throw
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

  private updateQueue(id: string, patch: Partial<UploadItem>) {
    this.queue.update((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }
}
