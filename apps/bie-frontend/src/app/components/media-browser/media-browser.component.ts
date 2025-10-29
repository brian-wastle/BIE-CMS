import { Component, EventEmitter, Input, Output, ViewChild, computed, effect, signal } from '@angular/core';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { DirectoryBrowserComponent } from '../directory-browser/directory-browser.component';
import { MediaPickerComponent } from '../media-picker/media-picker.component';

const UNSORTED_LABEL = 'Unsorted';

@Component({
  selector: 'app-media-browser',
  standalone: true,
  imports: [DirectoryBrowserComponent, MediaPickerComponent],
  templateUrl: './media-browser.component.html',
  styleUrl: './media-browser.component.scss'
})
export class MediaBrowserComponent {
  @ViewChild(MediaPickerComponent) mediaPicker?: MediaPickerComponent;
  @ViewChild(DirectoryBrowserComponent) directoryBrowser?: DirectoryBrowserComponent;

  private readonly selectedDirectorySignal = signal<string | null>(null);
  private readonly directoryControlsDisabledSignal = signal(false);



  @Input() folderIcon = 'assets/foldericon.svg';
  @Input() allowDelete = false;
  @Input() allowSelection = true;
  @Input() emptyMessage = 'No media files were found for this directory.';
  @Input() selectedHandle: string | null = null;

  @Input()
  set selectedDirectory(value: string | null) {
    const normalized = this.normalizeSelection(value);
    if (this.selectedDirectorySignal() !== normalized) {
      this.selectedDirectorySignal.set(normalized);
    }
  }
  get selectedDirectory(): string | null {
    return this.selectedDirectorySignal();
  }

  @Output() selectedDirectoryChange = new EventEmitter<string | null>();
  @Output() directoryControlsDisabledChange = new EventEmitter<boolean>();
  @Output() mediaSelected = new EventEmitter<MediaItem>();
  @Output() mediaDeleted = new EventEmitter<string>();
  @Output() filesLoaded = new EventEmitter<MediaItem[]>();

  readonly activeDirectoryLabel = computed(() => this.selectedDirectory?.trim() || UNSORTED_LABEL);

  constructor() {
    effect(() => {
      this.selectedDirectoryChange.emit(this.selectedDirectorySignal());
    });
  }

  async refresh() {
    await this.directoryBrowser?.refresh();
    await this.mediaPicker?.reload();
  }

  startCreateDirectory() {
    this.directoryBrowser?.startCreateDirectory();
  }

  onDirectorySelected(directory: string | null) {
    const normalized = this.normalizeSelection(directory);
    this.selectedDirectorySignal.set(normalized);
  }

  onDirectoryControlsDisabledChange(disabled: boolean) {
    this.directoryControlsDisabledSignal.set(disabled);
    this.directoryControlsDisabledChange.emit(disabled);
  }

  onMediaSelected(item: MediaItem) {
    this.mediaSelected.emit(item);
  }

  onMediaDeleted(handle: string) {
    this.mediaDeleted.emit(handle);
  }

  onFilesLoaded(items: MediaItem[]) {
    this.filesLoaded.emit(items);
  }

  get directoryControlsDisabled() {
    return this.directoryControlsDisabledSignal();
  }

  private normalizeSelection(value: string | null) {
    const trimmed = value?.trim() ?? '';
    return trimmed.length ? trimmed : null;
  }
  // permanently to that component
}

