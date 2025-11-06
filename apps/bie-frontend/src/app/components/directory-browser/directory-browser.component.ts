import { CommonModule, DatePipe} from '@angular/common';
import { Component, computed, effect, inject, model, input, output, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import type { DirectoryMeta, ViewMode } from 'bie-models';
import { MediaLibraryService } from '../../services/media-library/media-library.service';

@Component({
  selector: 'app-directory-browser',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule],
  templateUrl: './directory-browser.component.html',
  styleUrl: './directory-browser.component.scss',
  providers: [DatePipe]
})
export class DirectoryBrowserComponent {
  @ViewChild(MatSort) sortRow?: MatSort;
  
  private readonly mediaLibrary = inject(MediaLibraryService);
  readonly folderIcon = 'assets/foldericon.svg';
  readonly today = new Date();  // For new folders without a last updated date

  readonly selectedDirectory = model<string | null>(null);
  readonly dirControlToggle = output<boolean>();

  readonly viewMode = input<ViewMode>('grid');
  readonly directories = signal<DirectoryMeta[]>([]);
  readonly directoriesLoading = signal(true);
  readonly directoryError = signal<string | null>(null);
  readonly tempDirectories = this.mediaLibrary.tempDirectories;
  readonly sessionDirectories = computed(() => this.tempDirectories().concat(this.directories()));
  readonly pendingDirectory = signal<DirectoryMeta | null>(null);
  readonly dirNameFC = new FormControl<string>('', { nonNullable: true });
  readonly skeletonTiles = Array.from({ length: 6 }, (_, index) => index);
  readonly hasDirectories = computed(() => this.sessionDirectories().length > 0);
  readonly controlsDisabled = computed(() => this.directoriesLoading() || this.pendingDirectory() !== null);
  private lastSelectedDirectory: string | null = null;
  // List View
  readonly displayedColumns: string[] = ['Folder Name', 'Item Count', 'Last Update' ];
  readonly dataSource = new MatTableDataSource(this.directories());

  constructor() {
    effect(() => {
      const current = this.selectedDirectory();
      const normalized = this.normalizeSelection(current);
      if (current !== normalized) {
        this.selectedDirectory.set(normalized);
      }
    });
    effect(() => {
      this.dirControlToggle.emit(this.controlsDisabled());
    });
    void this.refresh();
  }

  async refresh() {
    this.directoriesLoading.set(true);
    this.directoryError.set(null);
    try {
      const directories = await this.mediaLibrary.fetchDirectories();
      this.directories.set(directories);
      const serverKeys = new Set(directories.map((entry) => entry.directory ?? null));

      this.tempDirectories.update((dirs) =>
        dirs.filter((entry) => {
          if (entry === this.pendingDirectory()) {
            return true;
          }
          return !serverKeys.has(entry.directory);
        })
      );

      const selected = this.selectedDirectory();
      if (selected !== null) {
        const knownKeys = new Set([
          ...serverKeys,
          ...this.tempDirectories().map((entry) => entry.directory ?? null)
        ]);
        if (!knownKeys.has(selected)) {
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

  createNewDir() {
    if (this.pendingDirectory()) {
      return;
    }
    this.lastSelectedDirectory = this.selectedDirectory();
    const newDir: DirectoryMeta = { directory: '', itemCount: 0, lastUploaded: null };
    this.tempDirectories.update((dirs) => [newDir, ...dirs]);
    this.dirNameFC.setValue('');
    this.pendingDirectory.set(newDir);
    this.directoryError.set(null);
    this.selectedDirectory.set(null);
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
    const dirName = this.dirNameFC.value;
    const normalizedName = this.mediaLibrary.normalizeDirectory(dirName);
    this.tempDirectories.update((dirs) =>
      dirs.map((entry) => (entry === pending ? { ...entry, directory: normalizedName, lastUploaded: null } : entry))
    );
    this.pendingDirectory.set(null);
    this.selectedDirectory.set(normalizedName);
    this.lastSelectedDirectory = null;
    this.dirNameFC.setValue('');
  }

  cancelPendingDirectory() {
    const pending = this.pendingDirectory();
    if (!pending) {
      return;
    }
    this.tempDirectories.update((dirs) => dirs.filter((entry) => entry !== pending));
    this.pendingDirectory.set(null);
    this.selectedDirectory.set(this.lastSelectedDirectory ?? null);
    this.lastSelectedDirectory = null;
    this.dirNameFC.setValue('');
  }

  pendingDirectoryError(): string | null {
    const pending = this.pendingDirectory();
    if (!pending) {
      return null;
    }
    const rawName = this.dirNameFC.value;
    if (!rawName) {
      return 'Folder name is required.';
    }
    const key = this.mediaLibrary.normalizeDirectory(rawName);
    const duplicate = this.sessionDirectories().some((entry) => {
      if (entry === pending) {
        return false;
      }
      return this.mediaLibrary.normalizeDirectory(entry.directory ?? null) === key;
    });
    if (duplicate) {
      return 'That folder already exists.';
    }
    return null;
  }

  onDirectorySelect(entry: DirectoryMeta) {
    if (this.pendingDirectory()) {
      return;
    }
    const selected = entry.directory?.trim();
    this.selectedDirectory.set(selected || null);
  }

  itemCountLabel(count: number) {
    return `${count} item${count === 1 ? '' : 's'}`;
  }

  isDirectorySelected(directory: string | null) {
    return (
      this.mediaLibrary.normalizeDirectory(this.selectedDirectory()) ===
      this.mediaLibrary.normalizeDirectory(directory ?? null)
    );
  }

  private normalizeSelection(value: string | null) {
    const trimmed = value?.trim() ?? '';
    return trimmed.length ? trimmed : null;
  }
}
