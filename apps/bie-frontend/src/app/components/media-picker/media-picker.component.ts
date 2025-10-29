import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input,OnChanges,Output,SimpleChanges,inject,signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MediaItem, MediaLibraryService, MediaSort } from '../../services/media-library/media-library.service';

const UNSORTED_LABEL = 'Unsorted';
const SKELETON_TILE_COUNT = 8;

@Component({
  selector: 'app-media-picker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './media-picker.component.html',
  styleUrl: './media-picker.component.scss',
})
export class MediaPickerComponent implements OnChanges {
  private readonly mediaLibrary = inject(MediaLibraryService);

  @Input() directory: string | null = null;
  @Input() selectedHandle: string | null = null;
  @Input() allowDelete = false;
  @Input() allowSelection = true;
  @Input() emptyMessage = 'No media files were found for this directory.';

  @Output() mediaSelected = new EventEmitter<MediaItem>();
  @Output() mediaDeleted = new EventEmitter<string>();
  @Output() filesLoaded = new EventEmitter<MediaItem[]>();

  readonly files = signal<MediaItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sort = signal<MediaSort>('created_desc');
  readonly selection = signal<string | null>(null);
  readonly deleting = signal<Set<string>>(new Set());
  readonly hasAttemptedLoad = signal(false);
  readonly skeletonTiles = Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => index);

  private requestId = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedHandle']) {
      this.selection.set(this.selectedHandle ?? null);
    }
    if (changes['directory']) {
      void this.reload();
    }
  }

  async reload() {
    const currentRequest = ++this.requestId;
    this.loading.set(true);
    this.error.set(null);
    this.hasAttemptedLoad.set(true);
    try {
      const items = await this.mediaLibrary.fetchFiles(this.directory ?? null, this.sort());
      if (this.requestId !== currentRequest) {
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
      console.error('Failed to load media files', err);
      this.error.set((err as Error).message ?? 'Failed to load media files');
      this.files.set([]);
    } finally {
      if (this.requestId === currentRequest) {
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
    void this.reload();
  }

  onSelect(item: MediaItem) {
    if (!this.allowSelection || this.loading()) {
      return;
    }
    this.selection.set(item.handle);
    this.mediaSelected.emit(item);
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
    if (!this.allowDelete || this.isDeleting(item.handle)) {
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
      this.mediaDeleted.emit(item.handle);
    } catch (err) {
      console.error('Failed to delete media item', err);
      this.error.set((err as Error).message ?? 'Failed to delete media item');
    } finally {
      const next = new Set(this.deleting());
      next.delete(item.handle);
      this.deleting.set(next);
    }
  }

  isDeleting(handle: string) {
    return this.deleting().has(handle);
  }

  directoryLabel(): string {
    const label = typeof this.directory === 'string' ? this.directory.trim() : '';
    return label.length ? label : UNSORTED_LABEL;
  }

  emptyStateMessage(): string {
    const explicit = this.emptyMessage?.trim();
    if (explicit) {
      return explicit;
    }
    return `No media files were found in "${this.directoryLabel()}" yet.`;
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
}
