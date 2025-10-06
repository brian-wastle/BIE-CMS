import { Component, computed, forwardRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BylineBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
import { BlockShellTemplateComponent } from '../block-shell/block-shell-template.component';
import { BLOCK_SHELL } from '../block-shell/block-shell';
const DISPLAY_FORMAT = 'MMMM d, y';

@Component({
  selector: 'app-byline-block',
  standalone: true,
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => BlogBylineComponent) }],
  imports: [CommonModule, DatePipe, BlockShellTemplateComponent],
  templateUrl: './blog-byline.component.html',
  styleUrls: ['./blog-byline.component.scss'],
})
export class BlogBylineComponent extends BlockShell<BylineBlock> {
  readonly displayFormat = DISPLAY_FORMAT;
  readonly authorName = computed(() => this.block().author ?? '');
  readonly displayDate = computed(() => {
    const publishedAt = this.block().publishedAt;
    return publishedAt ? new Date(publishedAt) : new Date();
  });
  readonly displayIso = computed(() => {
    const date = this.displayDate();
    return isNaN(date.getTime()) ? '' : date.toISOString();
  });
}

export const BYLINE_DATE_FORMAT = DISPLAY_FORMAT;
