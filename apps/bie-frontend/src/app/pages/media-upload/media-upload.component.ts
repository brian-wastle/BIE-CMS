import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserControlsComponent } from '../../components/browser-controls/browser-controls.component';
import { DirectoryBrowserComponent } from '../../components/directory-browser/directory-browser.component';
import { MediaPickerComponent } from '../../components/media-picker/media-picker.component';

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

const UNSORTED_LABEL = 'Unsorted';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, BrowserControlsComponent, DirectoryBrowserComponent, MediaPickerComponent],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {
  @ViewChild(MediaPickerComponent) mediaPicker?: MediaPickerComponent;
  @ViewChild(DirectoryBrowserComponent) directoryBrowser?: DirectoryBrowserComponent;

  readonly folderIcon = 'assets/foldericon.svg';
  readonly queue = signal<UploadItem[]>([]);
  readonly selectedDirectory = signal<string | null>(null);
  readonly activeDirectoryLabel = computed(() => this.selectedDirectory()?.trim() || UNSORTED_LABEL);
  readonly pageView = signal<ViewMode>('grid');
  readonly viewScope = signal<ViewMode>('grid');
  readonly loading = signal(false);
  readonly dragActive = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly directoryControlsDisabled = signal(false);
  readonly browserControlsDisabled = computed(() => this.loading() || this.directoryControlsDisabled());
  readonly hasFiles = computed(() => this.queue().length > 0);
  readonly totalSize = computed(() => this.queue().reduce((sum, item) => sum + item.file.size, 0));
  readonly selectedMimetypes = computed(() =>
    this.mimetypesInput.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  );

  mimetypesInput = '';

  async refreshDirectories() {
    await this.directoryBrowser?.refresh();
    await this.mediaPicker?.reload();
  }

  onDirectorySelected(directory: string | null) {
    this.selectedDirectory.set(directory);
    this.uploadError.set(null);
    this.success.set(null);
  }

  onDirectoryControlsDisabledChange(disabled: boolean) {
    this.directoryControlsDisabled.set(disabled);
  }

  onBrowserViewModeChange(mode: ViewMode) {
    this.pageView.set(mode);
  }

  onCreateFolderRequested() {
    this.directoryBrowser?.startCreateDirectory();
  }

  onRefreshFoldersRequested() {
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

  onMediaDeleted() {
    void this.refreshDirectories();
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
      void this.mediaPicker?.reload();
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

  
}
