import { CommonModule } from '@angular/common';
import { Component, TrackByFunction, computed, effect, forwardRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnyBlock, BGBlock, BylineBlock, DividerBlock, GridSettings, GridSettingsDefaults, ImageBlock, InlineTextBlock, Page, TextBlock, TitleBlock, VideoBlock } from 'bie-models';
import { BlogTitleComponent } from '../../components/blocks/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blocks/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/blocks/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/blocks/imagebox/imagebox.component';
import { BackgroundBlockComponent } from '../../components/blocks/background-block/background-block.component';
import { HorizontalRuleBlockComponent } from '../../components/blocks/horizontal-rule-block/horizontal-rule-block.component';
import { InlineTextComponent } from '../../components/blocks/inline-media-text/inline-media-text.component';
import { BLOCK_SHELL } from '../../components/blocks/block-shell/block-shell';
import { PublishedPageResolverResult } from '../../resolvers/published-page.resolver';
import { rowsForContentHeight } from '../../shared/grid-layout';

@Component({
  selector: 'app-published-page',
  imports: [
    CommonModule,
    BlogTitleComponent,
    BlogBylineComponent,
    TextBoxComponent,
    ImageBoxComponent,
    InlineTextComponent,
    BackgroundBlockComponent,
    HorizontalRuleBlockComponent,
  ],
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => PublishedPageComponent) }],
  templateUrl: './published-page.component.html',
  styleUrl: './published-page.component.scss',
})
export class PublishedPageComponent {
  readonly pageTitle = 'Published Page';
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page | null>(null);

  gridColumns: number = GridSettingsDefaults.columns;
  gridGapPx: number = GridSettingsDefaults.gapPx;
  gridRowHeight: number = GridSettingsDefaults.rowHeight;
  gridMaxWidthPx: number = GridSettingsDefaults.maxWidthPx;
  private readonly maxGridWidthPx = 4096;

  readonly pageBlocks = computed(() => {
    const current = this.page();
    if (!current) {
      return [];
    }
    return [...current.blocks].sort((a, b) => this.compareByLayout(a, b));
  });
  private readonly dynamicRowSpans = signal<Map<string, number>>(new Map());

  readonly publishedDisplay = computed(() => {
    const current = this.page();
    if (!current) {
      return null;
    }
    return this.formatDate(current.publishedAt ?? current.updatedAt ?? current.createdAt);
  });

  constructor() {
    effect(() => {
      const resolved = this.routeData()?.['publishedPage'] as PublishedPageResolverResult | undefined;
      if (!resolved) {
        this.loading.set(true);
        this.page.set(null);
        this.error.set(null);
        this.applyGridSettings(GridSettingsDefaults);
        this.dynamicRowSpans.set(new Map());
        return;
      }
      this.page.set(resolved.page);
      this.applyGridSettings(resolved.page?.grid);
      this.error.set(resolved.error);
      this.loading.set(false);
      this.dynamicRowSpans.set(new Map());
    });
  }

  blockStyle(block: AnyBlock) {
    const layout = block.layout ?? {
      row: 1,
      colStart: 1,
      colSpan: this.gridColumns,
      rowSpan: 1,
    };
    const overrideRowSpan = this.dynamicRowSpans().get(block.id);
    const colSpan = this.resolveBlockColSpan(block, layout.colSpan);
    const hAlign = block.hAlign ?? 'flex-start';
    const vAlign = block.vAlign ?? 'flex-start';
    const stretchContent =
      this.isTextBlock(block) || this.isInlineTextBlock(block) || this.isBackgroundBlock(block) || this.isImageBlock(block);
    const alignItems = stretchContent ? 'stretch' : hAlign;
    const justifyContent = stretchContent ? 'stretch' : vAlign;
    const zIndex = this.getBlockZIndex(block);
    const rowSpan = Math.max(1, overrideRowSpan ?? layout.rowSpan ?? 1);
    return {
      'grid-column': `${layout.colStart} / span ${colSpan}`,
      'grid-row': `${layout.row} / span ${rowSpan}`,
      'align-items': alignItems,
      'justify-content': justifyContent,
      'z-index': zIndex,
    };
  }

  // BlockShell contract
  autoSize(blockId: string, contentHeight: number) {
    if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
      this.dynamicRowSpans.update(current => {
        if (!current.has(blockId)) {
          return current;
        }
        const next = new Map(current);
        next.delete(blockId);
        return next;
      });
      return;
    }
    const targetRows = rowsForContentHeight(contentHeight, this.gridRowHeight, this.gridGapPx);
    this.dynamicRowSpans.update(current => {
      if (current.get(blockId) === targetRows) {
        return current;
      }
      const next = new Map(current);
      next.set(blockId, targetRows);
      return next;
    });
  }

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

  isInlineTextBlock(block: AnyBlock): block is InlineTextBlock {
    return block.type === 'InlineText';
  }

  isImageBlock(block: AnyBlock): block is ImageBlock {
    return block.type === 'image';
  }

  isVideoBlock(block: AnyBlock): block is VideoBlock {
    return block.type === 'video';
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

  private applyGridSettings(grid?: GridSettings | null) {
    const next = this.normalizeGridSettings(grid);
    this.gridColumns = next.columns;
    this.gridGapPx = next.gapPx;
    this.gridRowHeight = next.rowHeight;
    this.gridMaxWidthPx = next.maxWidthPx;
  }

  private normalizeGridSettings(grid?: GridSettings | null): GridSettings {
    const columns = Math.max(1, Math.min(24, Math.floor(grid?.columns ?? GridSettingsDefaults.columns)));
    const gapPx = Math.max(0, Math.min(64, Math.floor(grid?.gapPx ?? GridSettingsDefaults.gapPx)));
    const rowHeight = Math.max(8, Math.min(256, Math.floor(grid?.rowHeight ?? GridSettingsDefaults.rowHeight)));
    const maxWidthPx = Math.max(
      0,
      Math.min(this.maxGridWidthPx, Math.floor(grid?.maxWidthPx ?? GridSettingsDefaults.maxWidthPx))
    );
    return { columns, gapPx, rowHeight, maxWidthPx };
  }

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

  private getBlockZIndex(block: AnyBlock): number {
    if (this.isBackgroundBlock(block)) {
      return 1;
    }
    if (this.isImageBlock(block) || this.isVideoBlock(block)) {
      return 2;
    }
    return 3;
  }
}
