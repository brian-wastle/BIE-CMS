import { Component, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBlock } from 'bie-models';
import { BlockShell, BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-title-block',
  standalone: true,
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => BlogTitleComponent) }],
  imports: [CommonModule],
  templateUrl: './blog-title.component.html',
  styleUrls: ['./blog-title.component.scss']
})
export class BlogTitleComponent extends BlockShell<TitleBlock> {
  readonly titleContent = computed(() => this.block().text ?? '');
}
