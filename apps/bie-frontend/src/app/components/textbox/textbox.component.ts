import { Component, ElementRef, EventEmitter, Output, effect, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock, GridPlacement, BlockUpdate } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { CanvasEditStateService } from '../../services/canvas-edit-state/canvas-edit-state.service';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [CommonModule, LayoutControlsComponent, AuthorScopeDirective],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})
export class TextBoxComponent {
  readonly block = input.required<TextBlock>();
  readonly editable = input(true);
  readonly totalColumns = input(12);

  readonly editorRef = viewChild<ElementRef<HTMLElement>>('editor');

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  constructor(
    private host: ElementRef<HTMLElement>,
    public editState: CanvasEditStateService
  ) {
    effect(() => {
      if (!this.editable()) return;
      const elRef = this.editorRef();
      const text = this.block().text ?? '';
      if (!elRef) return;
      const el = elRef.nativeElement;
      if (document.activeElement !== el) el.textContent = text;
    });
  }

  onInput(e: Event) {
    const next = (e.target as HTMLElement).textContent ?? '';
    this.update.emit({ text: next });
  }
  onEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey && this.editable()) {
      e.preventDefault();
      (e.target as HTMLElement | null)?.blur();
    }
  }
}
