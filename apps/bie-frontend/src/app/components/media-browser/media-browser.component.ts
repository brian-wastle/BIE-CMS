import { Component, EventEmitter, Input, Output, ViewChild, computed, effect, signal } from '@angular/core';
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

  readonly selectedDirSignal = signal<string | null>(null);
  readonly dirControlPrivilege = signal(false);

  @Input() allowDelete = false;
  @Input() selectedHandle: string | null = null;
  @Input()
  set selectedDirectory(value: string | null) {
    const normalized = value?.trim() ?? null;
    if (this.selectedDirSignal() !== normalized) {
      this.selectedDirSignal.set(normalized);
    }
  }

  @Output() selectedDirectoryChange = new EventEmitter<string | null>();
  @Output() mediaDeleted = new EventEmitter<string>();

  readonly activeDirectoryLabel = computed(() => this.selectedDirSignal()?.trim() || UNSORTED_LABEL);

  constructor() {
    effect(() => {
      const browser = this.directoryBrowser;
      if (!browser) {
        return;
      }
      const directory = browser.selectedDirSignal();
      if (this.selectedDirSignal() !== directory) {
        this.selectedDirSignal.set(directory);
        this.selectedDirectoryChange.emit(directory);
      }
    });
    effect(() => {
      const browser = this.directoryBrowser;
      if (!browser) {
        return;
      }
      const disabled = browser.controlsDisabled();
      if (this.dirControlPrivilege() !== disabled) {
        this.dirControlPrivilege.set(disabled);
      }
    });
  }

  async refresh() {
    await this.directoryBrowser?.refresh();
    await this.mediaPicker?.reload();
  }

  createNewDir() {
    this.directoryBrowser?.createNewDir();
  }

  clearDirSelect() {
    this.selectedDirSignal.set(null);
  }
}
