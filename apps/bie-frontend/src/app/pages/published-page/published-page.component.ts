import { CommonModule } from '@angular/common';
import { Component, TrackByFunction, computed, effect, forwardRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnyBlock, BGBlock, BylineBlock, DividerBlock, ImageBlock, Page, TextBlock, TitleBlock } from 'bie-models';
import { PagesService } from '../../services/pages/pages.service';
import { BlogTitleComponent } from '../../components/blocks/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blocks/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/blocks/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/blocks/imagebox/imagebox.component';
import { BackgroundBlockComponent } from '../../components/blocks/background-block/background-block.component';
import { HorizontalRuleBlockComponent } from '../../components/blocks/horizontal-rule-block/horizontal-rule-block.component';
import { BLOCK_SHELL } from '../../components/blocks/block-shell/block-shell';

@Component({
  selector: 'app-published-page',
  imports: [
    CommonModule,
    BlogTitleComponent,
    BlogBylineComponent,
    TextBoxComponent,
    ImageBoxComponent,
    BackgroundBlockComponent,
    HorizontalRuleBlockComponent,
  ],
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => PublishedPageComponent) }],
  templateUrl: './published-page.component.html',
  styleUrl: './published-page.component.scss',
})
export class PublishedPageComponent {
  readonly pageTitle = 'Published Page';
  private readonly pagesService = inject(PagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page | null>(null);
  private loadSeq = 0;

  readonly gridColumns = 12;
  readonly gridGapPx = 16;
  readonly gridRowHeight = 48;

  readonly pageBlocks = computed(() => {
    const current = this.page();
    if (!current) {
      return [];
    }
    return [...current.blocks].sort((a, b) => this.compareByLayout(a, b));
  });

  readonly publishedDisplay = computed(() => {
    const current = this.page();
    if (!current) {
      return null;
    }
    return this.formatDate(current.publishedAt ?? current.updatedAt ?? current.createdAt);
  });

  constructor() {
    effect(() => {
      const slug = this.paramMap().get('slug')?.trim();
      if (!slug) {
        this.page.set(null);
        this.error.set('Missing slug.');
        this.loading.set(false);
        return;
      }
      void this.loadPublishedPage(slug);
    });
  }

  async loadPublishedPage(slug: string) {
    const requestId = ++this.loadSeq;
    this.loading.set(true);
    this.error.set(null);
    try {
      const page = await this.pagesService.getPublished(slug);
      if (requestId === this.loadSeq) {
        this.page.set(page);
      }
    } catch (err) {
      if (requestId === this.loadSeq) {
        console.error('Failed to load published page', err);
        const message = (err as Error)?.message ?? 'Unable to load this page.';
        this.error.set(message);
        this.page.set(null);
      }
    } finally {
      if (requestId === this.loadSeq) {
        this.loading.set(false);
      }
    }
  }

  blockStyle(block: AnyBlock) {
    const layout = block.layout ?? {
      row: 1,
      colStart: 1,
      colSpan: this.gridColumns,
      rowSpan: 1,
    };
    const colSpan = this.resolveBlockColSpan(block, layout.colSpan);
    const hAlign = block.hAlign ?? 'flex-start';
    const vAlign = block.vAlign ?? 'flex-start';
    const stretchContent =
      this.isTextBlock(block) || this.isBackgroundBlock(block) || this.isImageBlock(block);
    const alignItems = stretchContent ? 'stretch' : hAlign;
    const justifyContent = stretchContent ? 'stretch' : vAlign;
    return {
      'grid-column': `${layout.colStart} / span ${colSpan}`,
      'grid-row': `${layout.row} / span ${layout.rowSpan ?? 1}`,
      'align-items': alignItems,
      'justify-content': justifyContent,
    };
  }

  // BlockShell contract
  autoSize(_blockId: string, _contentHeight: number) { }

  formatDate(value: string | null | undefined) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  isTitleBlock(block: AnyBlock): block is TitleBlock {
    return block.type === 'title';
  }

  isBylineBlock(block: AnyBlock): block is BylineBlock {
    return block.type === 'byline';
  }

  isTextBlock(block: AnyBlock): block is TextBlock {
    return block.type === 'text';
  }

  isImageBlock(block: AnyBlock): block is ImageBlock {
    return block.type === 'image';
  }

  isBackgroundBlock(block: AnyBlock): block is BGBlock {
    return block.type === 'background';
  }

  isDividerBlock(block: AnyBlock): block is DividerBlock {
    return block.type === 'divider';
  }

  private compareByLayout(a: AnyBlock, b: AnyBlock) {
    const rowDiff = (a.layout?.row ?? 0) - (b.layout?.row ?? 0);
    if (rowDiff !== 0) {
      return rowDiff;
    }
    const colDiff = (a.layout?.colStart ?? 1) - (b.layout?.colStart ?? 1);
    if (colDiff !== 0) {
      return colDiff;
    }
    return a.id.localeCompare(b.id);
  }

  trackByBlockId: TrackByFunction<AnyBlock> = (_index, block) => block.id;

  private resolveBlockColSpan(block: AnyBlock, fallbackSpan: number) {
    if (this.isImageBlock(block)) {
      const override = this.normalizeColumns(block.imageStyle?.columns);
      if (override != null) {
        return override;
      }
    }
    return this.normalizeColumns(fallbackSpan) ?? this.gridColumns;
  }

  private normalizeColumns(value: number | null | undefined) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }
    const rounded = Math.round(value);
    return Math.max(1, Math.min(this.gridColumns, rounded));
  }
}
