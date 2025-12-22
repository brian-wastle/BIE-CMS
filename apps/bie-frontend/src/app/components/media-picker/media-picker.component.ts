
import { Component, OnDestroy, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MediaItem, MediaLibraryService, MediaSort } from '../../services/media-library/media-library.service';

const UNSORTED_LABEL = 'Unsorted';
const SKELETON_TILE_COUNT = 8;

@Component({
  selector: 'app-media-picker',
  imports: [MatIconModule],
  templateUrl: './media-picker.component.html',
  styleUrl: './media-picker.component.scss',
})
export class MediaPickerComponent implements OnDestroy {
  private readonly mediaLibrary = inject(MediaLibraryService);

  readonly directory = input<string | null>(null);
  readonly selectedHandle = input<string | null>(null);
  readonly allowDelete = input(false);
  readonly allowSelection = input(true);

  readonly mediaSelected = output<MediaItem>();
  readonly mediaDeleted = output<string>();
  readonly filesLoaded = output<MediaItem[]>();
  
  readonly files = signal<MediaItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sort = signal<MediaSort>('created_desc');
  readonly selection = signal<string | null>(null);
  readonly deleting = signal<Set<string>>(new Set());
  readonly hasAttemptedLoad = signal(false);
  readonly emptyMessage = 'No media files were found for this directory.';
  readonly skeletonTiles = Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => index);

  private requestId = 0;
  private destroyed = false;

  constructor() {
    effect(() => {
      this.selection.set(this.selectedHandle() ?? null);
    });
    effect(() => {
      // Track both directory and sort; reloading will occur when either changes.
      this.directory();
      this.sort();
      void this.reload();
    });
  }

  async reload() {
    const currentRequest = ++this.requestId;
    this.loading.set(true);
    this.error.set(null);
    this.hasAttemptedLoad.set(true);
    try {
      const items = await this.mediaLibrary.fetchFiles(this.directory() ?? null, this.sort());
      if (this.requestId !== currentRequest) {
        return;
      }
      if (this.destroyed) {
        return;
      }
      this.files.set(items);
      this.filesLoaded.emit(items);
      const selected = this.selection();
      if (selected && !items.some((item) => item.handle === selected)) {
        this.selection.set(null);
      }
    } catch (err) {
      if (this.requestId !== currentRequest) {
        return;
      }
      if (this.destroyed) {
        return;
      }
      console.error('Failed to load media files', err);
      this.error.set((err as Error).message ?? 'Failed to load media files');
      this.files.set([]);
    } finally {
      if (this.requestId === currentRequest && !this.destroyed) {
        this.loading.set(false);
      }
    }
  }

  onSortChange(value: string) {
    const next = (value as MediaSort) ?? 'created_desc';
    if (this.sort() === next) {
      return;
    }
    this.sort.set(next);
    // Reload will run via the effect that tracks sort changes.
  }

  onSelect(item: MediaItem) {
    if (!this.allowSelection() || this.loading()) {
      return;
    }
    this.selection.set(item.handle);
    if (!this.destroyed) {
      this.mediaSelected.emit(item);
    }
  }

  onTileKeydown(event: KeyboardEvent, item: MediaItem) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.onSelect(item);
  }

  async onDelete(item: MediaItem, event: Event) {
    event.stopPropagation();
    if (!this.allowDelete() || this.deleting().has(item.handle)) {
      return;
    }
    this.error.set(null);
    const snapshot = new Set(this.deleting());
    snapshot.add(item.handle);
    this.deleting.set(snapshot);
    try {
      await this.mediaLibrary.deleteFile(item.handle);
      this.files.update((entries) => entries.filter((entry) => entry.handle !== item.handle));
      if (this.selection() === item.handle) {
        this.selection.set(null);
      }
      if (!this.destroyed) {
        this.mediaDeleted.emit(item.handle);
      }
    } catch (err) {
      console.error('Failed to delete media item', err);
      this.error.set((err as Error).message ?? 'Failed to delete media item');
    } finally {
      const next = new Set(this.deleting());
      next.delete(item.handle);
      this.deleting.set(next);
    }
  }

  get directoryLabel(): string {
    const source = this.directory();
    const label = typeof source === 'string' ? source.trim() : '';
    return label.length ? label : UNSORTED_LABEL;
  }

  displayName(item: MediaItem) {
    return item.filename?.trim() || item.handle;
  }

  formatSize(bytes: number | null) {
    if (!bytes) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value < 10 && exponent > 0 ? 1 : 0)} ${units[exponent]}`;
  }

  isImage(item: MediaItem) {
    const type = item.mimetype?.toLowerCase() ?? '';
    return type.startsWith('image/');
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
