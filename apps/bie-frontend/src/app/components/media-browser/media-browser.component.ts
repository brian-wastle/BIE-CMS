import { Component, ViewChild, computed, effect, input, model, output, signal } from '@angular/core';
import { DirectoryBrowserComponent } from '../directory-browser/directory-browser.component';
import { MediaPickerComponent } from '../media-picker/media-picker.component';
import type { ViewMode } from 'bie-models';

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

  readonly dirControlPrivilege = signal(false);

  readonly viewMode = input<ViewMode>('grid');
  readonly allowDelete = input(false);
  readonly selectedHandle = input<string | null>(null);
  readonly selectedDirectory = model<string | null>(null);
  readonly mediaDeleted = output<string>();

  // Lets page component know which folder is selected
  readonly activeDirectoryLabel = computed(() => this.selectedDirectory()?.trim() || 'Unsorted');

  constructor() {
    effect(() => {
      const current = this.selectedDirectory();
      const normalized = this.normalizeSelection(current);
      if (current !== normalized) {
        this.selectedDirectory.set(normalized);
      }
    });
  }

  onBrowserDirectoryChange(directory: string | null) {
    this.setSelectedDirectory(directory);
  }

  onDirControlToggle(disabled: boolean) {
    if (this.dirControlPrivilege() !== disabled) {
      this.dirControlPrivilege.set(disabled);
    }
  }

  async refresh() {
    await this.directoryBrowser?.refresh();
    await this.mediaPicker?.reload();
  }

  createNewDir() {
    this.directoryBrowser?.createNewDir();
  }

  clearDirSelect() {
    this.setSelectedDirectory(null);
  }

  private setSelectedDirectory(value: string | null) {
    const normalized = this.normalizeSelection(value);
    if (this.selectedDirectory() !== normalized) {
      this.selectedDirectory.set(normalized);
    }
  }

  private normalizeSelection(value: string | null) {
    const trimmed = value?.trim() ?? '';
    return trimmed.length ? trimmed : null;
  }
}

