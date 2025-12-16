import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-title-block',
  imports: [CommonModule],
  templateUrl: './blog-title.component.html',
  styleUrls: ['./blog-title.component.scss']
})
export class BlogTitleComponent extends BlockShell<TitleBlock> {
  readonly titleContent = computed(() => this.block().text ?? '');

  readonly fontSizes = computed(() => {
    const base = this.block().fontSize ?? 48;
    const clamp = (value: number) => Math.max(12, Math.round(value));
    return {
      desktop: clamp(base),
      tablet: clamp(base * 0.8),
      mobile: clamp(base * 0.65),
    };
  });
}
