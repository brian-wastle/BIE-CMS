import { Component, computed, effect, input, model, output, signal } from '@angular/core';
import { DirectoryBrowserComponent } from '../directory-browser/directory-browser.component';
import { MediaPickerComponent } from '../media-picker/media-picker.component';
import type { ViewMode } from 'bie-models';
import type { MediaItem } from '../../services/media-library/media-library.service';

@Component({
  selector: 'app-media-browser-carousel',
  imports: [DirectoryBrowserComponent, MediaPickerComponent],
  templateUrl: './media-browser-carousel.component.html',
  styleUrl: './media-browser-carousel.component.scss'
})
export class MediaBrowserCarouselComponent {
  readonly viewMode = input<ViewMode>('grid');
  readonly allowDelete = input(false);
  readonly selectedHandle = input<string | null>(null);
  readonly selectedDirectory = model<string | null>(null);

  readonly mediaSelected = output<MediaItem>();
  readonly mediaDeleted = output<string>();
  readonly dirControlToggle = output<boolean>();

  readonly viewState = signal<'directories' | 'picker'>('directories');
  readonly activeDirectoryLabel = computed(() => this.selectedDirectory()?.trim() || 'Unsorted');

  constructor() {
    effect(() => {
      if (!this.selectedDirectory() && this.viewState() === 'picker') {
        this.viewState.set('directories');
      }
    });
  }

  onDirectoryChange(value: string | null) {
    const normalized = this.normalizeSelection(value);
    this.selectedDirectory.set(normalized);
    this.viewState.set(normalized ? 'picker' : 'directories');
  }

  onDirControlToggle(disabled: boolean) {
    this.dirControlToggle.emit(disabled);
  }

  showDirectories() {
    this.viewState.set('directories');
    this.selectedDirectory.set(null);
  }

  showPicker() {
    if (this.selectedDirectory()) {
      this.viewState.set('picker');
    }
  }

  onMediaSelected(item: MediaItem) {
    this.mediaSelected.emit(item);
  }

  onMediaDeleted(handle: string) {
    this.mediaDeleted.emit(handle);
  }

  private normalizeSelection(value: string | null) {
    const trimmed = value?.trim() ?? '';
    return trimmed.length ? trimmed : null;
  }
}
