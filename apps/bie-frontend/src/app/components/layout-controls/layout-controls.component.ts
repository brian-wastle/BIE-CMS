import { Component, input, output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GridPlacement, AlignType } from 'bie-models';

@Component({
  selector: 'app-layout-controls',
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './layout-controls.component.html',
  styleUrls: ['./layout-controls.component.scss'],
})
export class LayoutControlsComponent {
  readonly layoutSignal = input.required<GridPlacement>();
  readonly hAlign = input<AlignType>();
  readonly vAlign = input<AlignType>();
  readonly totalColumnsSignal = input(12);
  readonly editableSignal = input(true);
  readonly maxRowsSignal = input(24);
  readonly editingChange = output<boolean>();
  readonly layoutChange = output<GridPlacement>();
  readonly hAlignChange = output<AlignType>();
  readonly vAlignChange = output<AlignType>();

  get layout(): GridPlacement { return this.layoutSignal(); }
  get totalColumns(): number { return this.totalColumnsSignal(); }
  get editable(): boolean { return this.editableSignal(); }
  get maxRows(): number { return this.maxRowsSignal(); }
  get currentHAlign(): AlignType { return this.hAlign() ?? 'flex-start'; }
  get currentVAlign(): AlignType { return this.vAlign() ?? 'flex-start'; }

  private clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  get maxSpan(): number {
    const start = this.layout?.colStart ?? 1;
    return Math.max(1, this.totalColumns - start + 1);
  }

  get resolvedRowSpan(): number {
    return this.layout?.rowSpan ?? 1;
  }

  onRowChange(val: number) {
    const raw = Math.floor(+val || 1);
    const row = this.clamp(raw, 1, Number.MAX_SAFE_INTEGER);
    const colStart = this.layout?.colStart ?? 1;
    const colSpan = this.layout?.colSpan ?? 12;
    const rowSpan = this.layout?.rowSpan ?? 1;
    this.layoutChange.emit({ row, colStart, colSpan, rowSpan });
  }

  onStartChange(val: number) {
    const row = this.layout?.row ?? 1;
    const colStart = this.clamp(+val, 1, this.totalColumns);
    const colSpan = Math.min(this.layout.colSpan ?? 1, this.totalColumns - colStart + 1);
    const rowSpan = this.layout?.rowSpan ?? 1;
    this.layoutChange.emit({ row, colStart, colSpan, rowSpan });
  }

  onSpanChange(val: number) {
    const row = this.layout?.row ?? 1;
    const colStart = this.layout?.colStart ?? 1;
    const maxSpan = this.totalColumns - colStart + 1;
    const colSpan = this.clamp(+val, 1, maxSpan);
    const rowSpan = this.layout?.rowSpan ?? 1;
    this.layoutChange.emit({ row, colStart, colSpan, rowSpan });
  }

  onRowSpanChange(val: number) {
    const row = this.layout?.row ?? 1;
    const colStart = this.layout?.colStart ?? 1;
    const colSpan = this.layout?.colSpan ?? 1;
    const rowSpan = this.clamp(Math.floor(+val || 1), 1, this.maxRows);
    this.layoutChange.emit({ row, colStart, colSpan, rowSpan });
  }

  onFocus() { this.editingChange.emit(true); }
  onBlur()  { this.editingChange.emit(false); }

  onHAlignSelect(align: AlignType) {
    if (!this.editable || this.hAlign() === align) {
      return;
    }
    this.hAlignChange.emit(align);
  }

  onVAlignSelect(align: AlignType) {
    if (!this.editable || this.vAlign() === align) {
      return;
    }
    this.vAlignChange.emit(align);
  }
}
