import { Component, EventEmitter, Input, Output, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock, GridPlacement } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';

type BlockUpdate = { layout?: GridPlacement; text?: string; src?: string; alt?: string };

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [CommonModule, LayoutControlsComponent],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})
export class TextBoxComponent implements AfterViewInit {
  // --- Inputs ---
  private _block!: TextBlock;

  @Input({ required: true })
  set block(value: TextBlock) {
    this._block = value;
    // Keep the contenteditable DOM in sync when NOT focused
    this.syncFromModel();
  }
  get block(): TextBlock {
    return this._block;
  }

  @Input() editable = true;
  @Input() totalColumns = 12;

  // --- Outputs ---
  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  // --- Refs ---
  @ViewChild('editor', { static: false }) editorRef?: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // Seed once the view exists
    this.syncFromModel(/*force*/ true);
  }


  onInput(e: Event) {
    const next = (e.target as HTMLElement).textContent ?? '';
    this.update.emit({ text: next });
  }

  onFocus() { this.editingChange.emit(true); }

  onBlurAndCommit() {
    const next = this.editorRef?.nativeElement.textContent ?? '';
    this.update.emit({ text: next });
    this.editingChange.emit(false);
  }

  // Keep your original signature (no template cast needed)
  onEnter(event: Event) {
    const e = event as KeyboardEvent; // (keydown.enter)
    if (!e.shiftKey && this.editable) {
      e.preventDefault();
      (e.target as HTMLElement | null)?.blur();
    }
  }

  onLayoutChange(layout: GridPlacement) {
    this.update.emit({ layout });
  }


  private syncFromModel(force = false) {
    const el = this.editorRef?.nativeElement;
    if (!el) return;
    if (force || document.activeElement !== el) {
      el.textContent = this._block?.text ?? '';
    }
  }
}