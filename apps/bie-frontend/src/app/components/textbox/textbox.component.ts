// textbox.component.ts
import { Component, ElementRef, viewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
import { BlockShellTemplateComponent } from '../block-shell/block-shell-template.component';
import { BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-textbox',
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => TextBoxComponent) }],
  imports: [CommonModule, BlockShellTemplateComponent],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextBoxComponent extends BlockShell<TextBlock> {
  // Access teh component's content template in the DOM
  readonly editorRef = viewChild<ElementRef<HTMLElement>>('textContent');

  // Effect syncs blocks' signal data and canvas
  // this.editable() - Whether block is in author mode
  // this.editorRef() - The ElementRef for the content-editable DOM node
  // this.block().text - The current text value for the block
  protected override initEffects(): void {
    this.runEffect(() => {
      if (!this.editable()) return;
      const elRef = this.editorRef();
      const text = this.block().text ?? '';
      if (!elRef) return;
      const el = elRef.nativeElement;
      if (document.activeElement !== el) el.textContent = text;
    });
  }

  // Handle text input
  onInput(e: Event) {
    const keyPress = (e.target as HTMLElement).textContent ?? '';
    this.emitUpdate({ text: keyPress });
  }
  onEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey && this.editable()) {
      e.preventDefault();
      (e.target as HTMLElement | null)?.blur();
    }
  }
}
