import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridPlacement } from 'bie-models';

@Component({
  selector: 'app-layout-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layout-controls.component.html',
  styleUrls: ['./layout-controls.component.scss'],
})
export class LayoutControlsComponent {
  @Input({ required: true }) layout!: GridPlacement;
  @Input() totalColumns = 12;
  @Input() editable = true;
  @Output() editingChange = new EventEmitter<boolean>();
  @Output() layoutChange = new EventEmitter<GridPlacement>();

  private clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  get maxSpan(): number {
    const start = this.layout?.colStart ?? 1;
    return this.totalColumns - start + 1;
  }

  onStartChange(val: number) {
    const colStart = this.clamp(+val, 1, this.totalColumns);
    const colSpan = Math.min(this.layout.colSpan ?? 1, this.totalColumns - colStart + 1);
    this.layoutChange.emit({ colStart, colSpan });
  }

  onSpanChange(val: number) {
    const colStart = this.layout?.colStart ?? 1;
    const maxSpan = this.totalColumns - colStart + 1;
    const colSpan = this.clamp(+val, 1, maxSpan);
    this.layoutChange.emit({ colStart, colSpan });
  }

  onFocus() { this.editingChange.emit(true); }
  onBlur()  { this.editingChange.emit(false); }
}
