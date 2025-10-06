import { Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
import { BlockShellTemplateComponent } from '../block-shell/block-shell-template.component';
import { BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-title-block',
  standalone: true,
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => BlogTitleComponent) }],
  imports: [CommonModule, BlockShellTemplateComponent],
  templateUrl: './blog-title.component.html',
  styleUrls: ['./blog-title.component.scss']
})
export class BlogTitleComponent extends BlockShell<TitleBlock> {
  readonly titleContent = computed(() => this.block().text ?? '');

  onInput(value: string) {
    if (value !== this.block().text) {
      this.update.emit({ text: value });
    }
  }
}
