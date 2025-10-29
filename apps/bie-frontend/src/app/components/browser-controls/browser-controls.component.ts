import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type BrowserViewMode = 'list' | 'grid' | 'details';

@Component({
  selector: 'app-browser-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './browser-controls.component.html',
  styleUrl: './browser-controls.component.scss'
})
export class BrowserControlsComponent {
  @Input() disabled = false;
  @Input() viewMode: BrowserViewMode = 'grid';

  @Output() viewModeChange = new EventEmitter<BrowserViewMode>();
  @Output() createFolder = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();

  onViewModeSelect(mode: BrowserViewMode) {
    if (this.viewMode === mode) {
      return;
    }
    this.viewMode = mode;
    this.viewModeChange.emit(mode);
  }

  onCreateFolder() {
    this.createFolder.emit();
  }

  onRefresh() {
    this.refreshRequested.emit();
  }
}
