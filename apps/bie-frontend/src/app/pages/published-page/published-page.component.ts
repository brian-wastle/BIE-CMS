import { CommonModule } from '@angular/common';
import { Component, computed, effect, forwardRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlignType, AnyBlock, BGBlock, BylineBlock, DividerBlock, GridSettings, GridSettingsDefaults, ImageBlock, InlineTextBlock, Page, TextBlock, TitleBlock, VideoBlock } from 'bie-models';
import { BlogTitleComponent } from '../../components/blocks/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blocks/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/blocks/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/blocks/imagebox/imagebox.component';
import { BackgroundBlockComponent } from '../../components/blocks/background-block/background-block.component';
import { HorizontalRuleBlockComponent } from '../../components/blocks/horizontal-rule-block/horizontal-rule-block.component';
import { InlineTextComponent } from '../../components/blocks/inline-media-text/inline-media-text.component';
import { BLOCK_SHELL } from '../../components/blocks/block-shell/block-shell';
import { PublishedPageResolverResult } from '../../resolvers/published-page.resolver';

type FlowItem =
  | { kind: 'block'; block: AnyBlock }
  | { kind: 'spacer'; id: string; rows: number; heightPx: number };

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

  readonly contentGapPx = signal<number>(GridSettingsDefaults.gapPx);
  readonly contentMaxWidthPx = signal<number>(GridSettingsDefaults.maxWidthPx);
  readonly contentRowHeightPx = signal<number>(GridSettingsDefaults.rowHeight);
  readonly contentColumns = signal<number>(GridSettingsDefaults.columns);
  private readonly maxContentWidthPx = 4096;

  readonly pageBlocks = computed(() => {
    const current = this.page();
    if (!current) {
      return [];
    }
    return [...current.blocks].sort((a, b) => this.compareByLayout(a, b));
  });
  readonly flowItems = computed<FlowItem[]>(() => {
    const blocks = this.pageBlocks();
    if (!blocks.length) {
      return [];
    }
    let cursor = 1;
    const items: FlowItem[] = [];
    for (const block of blocks) {
      const layout = block.layout;
      const rowGap = this.resolveRowGap(layout, cursor);
      if (rowGap > 0) {
        items.push({
          kind: 'spacer',
          id: `spacer-${block.id}-${cursor}`,
          rows: rowGap,
          heightPx: this.calculateSpacerHeight(rowGap),
        });
      }
      items.push({ kind: 'block', block });
      const rowSpan = Math.max(1, layout?.rowSpan ?? 1);
      const rowStart = Math.max(1, cursor + rowGap);
      cursor = rowStart + rowSpan;
    }
    return items;
  });
  readonly blockStyle = (block: AnyBlock) => {
    const columns = Math.max(1, this.contentColumns());
    const layout = block.layout;
    if (!layout || columns <= 1) {
      return { width: '100%', 'margin-left': '0', 'align-self': this.resolveAlignSelf(block.hAlign) };
    }
    const colSpan = Math.max(1, Math.min(layout.colSpan ?? columns, columns));
    const maxStart = columns - colSpan + 1;
    const colStart = Math.max(1, Math.min(layout.colStart ?? 1, maxStart));
    const widthPercent = (colSpan / columns) * 100;
    const offsetPercent = ((colStart - 1) / columns) * 100;
    const styles: Record<string, string> = {
      width: `${widthPercent}%`,
      'max-width': '100%',
      'align-self': this.resolveAlignSelf(block.hAlign),
    };
    if (offsetPercent > 0) {
      styles['margin-left'] = `${offsetPercent}%`;
    } else {
      styles['margin-left'] = '0';
    }
    return styles;
  };
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
        this.applyFlowSettings(GridSettingsDefaults);
        return;
      }
      this.applyFlowSettings(resolved.page?.grid);
      this.page.set(resolved.page);
      this.error.set(resolved.error);
      this.loading.set(false);
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

  trackFlowItem(_index: number, item: FlowItem): string {
    return item.kind === 'spacer' ? item.id : item.block.id;
  }

  private resolveAlignSelf(align: AlignType | undefined): string {
    switch (align) {
      case 'center':
        return 'center';
      case 'flex-end':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }

  private resolveRowGap(layout: AnyBlock['layout'], cursor: number): number {
    if (!layout) {
      return 0;
    }
    if (typeof layout.rowGap === 'number' && Number.isFinite(layout.rowGap)) {
      return Math.max(0, Math.floor(layout.rowGap));
    }
    if (typeof layout.row === 'number' && Number.isFinite(layout.row)) {
      return Math.max(0, Math.floor(layout.row) - cursor);
    }
    return 0;
  }

  private calculateSpacerHeight(rows: number): number {
    if (!rows || rows <= 0) {
      return 0;
    }
    const rowHeight = Math.max(1, this.contentRowHeightPx());
    const gap = Math.max(0, this.contentGapPx());
    return rows * rowHeight + Math.max(0, rows - 1) * gap;
  }

  private applyFlowSettings(grid?: GridSettings | null) {
    const next = this.normalizeFlowSettings(grid);
    this.contentGapPx.set(next.gapPx);
    this.contentMaxWidthPx.set(next.maxWidthPx);
    this.contentRowHeightPx.set(next.rowHeight);
    this.contentColumns.set(next.columns);
  }

  private normalizeFlowSettings(grid?: GridSettings | null): { gapPx: number; maxWidthPx: number; rowHeight: number; columns: number } {
    const gapPx = Math.max(0, Math.min(64, Math.floor(grid?.gapPx ?? GridSettingsDefaults.gapPx)));
    const maxWidthPx = Math.max(
      0,
      Math.min(this.maxContentWidthPx, Math.floor(grid?.maxWidthPx ?? GridSettingsDefaults.maxWidthPx))
    );
    const rowHeight = Math.max(8, Math.min(256, Math.floor(grid?.rowHeight ?? GridSettingsDefaults.rowHeight)));
    const columns = Math.max(1, Math.min(24, Math.floor(grid?.columns ?? GridSettingsDefaults.columns)));
    return { gapPx, maxWidthPx, rowHeight, columns };
  }
}
