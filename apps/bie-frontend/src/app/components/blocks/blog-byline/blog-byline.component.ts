import { Component, computed, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BylineBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
const DISPLAY_FORMAT = 'MMMM d, y';

@Component({
  selector: 'app-byline-block',
  imports: [CommonModule, DatePipe],
  templateUrl: './blog-byline.component.html',
  styleUrls: ['./blog-byline.component.scss'],
})
export class BlogBylineComponent extends BlockShell<BylineBlock> {
  readonly displayFormat = DISPLAY_FORMAT;
  readonly authorName = computed(() => this.block().author ?? '');
  readonly publishedAt = input<string | null | undefined>(null);
  readonly displayDate = computed(() => {
    const publishedAt = this.publishedAt();
    if (publishedAt) {
      const parsed = new Date(publishedAt);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });
  readonly displayIso = computed(() => {
    const date = this.displayDate();
    return isNaN(date.getTime()) ? '' : date.toISOString();
  });
  readonly fontSizes = computed(() => {
    const base = this.block().fontSize ?? 16;
    const clamp = (value: number) => Math.max(12, Math.round(value));
    return {
      desktop: clamp(base),
      tablet: clamp(base * 0.95),
      mobile: clamp(base * 0.9),
    };
  });
}

export const BYLINE_DATE_FORMAT = DISPLAY_FORMAT;
