import { Component, TrackByFunction, computed, signal, HostListener, effect, inject, AfterViewInit, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CurrentUserService } from '../../services/current-user/current-user.service';
import { AnyBlock, TextBlock, ImageBlock, BylineBlock, TitleBlock, BlockUpdate, GridPlacement, AlignType, BlockUpdateSchema, AlignTypeSchema } from 'bie-models';
import { BlogTitleComponent } from '../../components/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/imagebox/imagebox.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import { LayoutControlsComponent } from '../../components/layout-controls/layout-controls.component';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { BLOCK_SHELL } from '../../components/block-shell/block-shell';

type PreviewModeId = 'responsive' | 'mobile' | 'tablet' | 'desktop' | 'hd';

interface PreviewPreset {
  id: PreviewModeId;
  label: string;
  widthPx: number | null;
  description: string;
}

const BLOCK_VERTICAL_PADDING = 16; // matches .block padding (8px top + 8px bottom)
const FontSizePatchSchema = BlockUpdateSchema.pick({ fontSize: true });

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TextBoxComponent,
    ImageBoxComponent,
    BlogTitleComponent,
    BlogBylineComponent,
    MediaBrowserCarouselComponent,
    LayoutControlsComponent,
    MatExpansionModule,
    RichTextEditorComponent
  ],
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => CanvasComponent) }],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  // Grid settings
  columns = 12;
  gapPx = 16;
  readonly maxColumns = 24;
  tileRowHeight = 48;
  readonly rowHeightPresets = [24, 32, 40, 48, 56, 64];

  // View settings
  readonly previewPresets: PreviewPreset[] = [
    { id: 'responsive', label: 'Fit to Window', widthPx: null, description: 'Responsive (fluid)' },
    { id: 'mobile', label: 'Mobile (375px)', widthPx: 375, description: 'Mobile phone' },
    { id: 'tablet', label: 'Tablet (768px)', widthPx: 768, description: 'Tablet' },
    { id: 'desktop', label: 'Desktop (1440px)', widthPx: 1440, description: 'Desktop monitor' },
    { id: 'hd', label: 'HD (1920px)', widthPx: 1920, description: 'HD monitor' },
  ];
  previewModeId = signal<PreviewModeId>('desktop');
  previewZoom = signal(50);
  readonly previewPreset = computed(() => {
    return this.previewPresets.find(preset => preset.id === this.previewModeId()) ?? this.previewPresets[0];
  });
  readonly previewWidthPx = computed(() => this.previewPreset().widthPx);
  readonly previewScale = computed(() => this.previewZoom() / 100);
  // Preview frame observers
  @ViewChild('scroller') set scrollerRef(ref: ElementRef<HTMLElement> | undefined) {
    this.scrollerEl = ref?.nativeElement ?? null;
    this.observeScroller();
  }
  @ViewChild('scrollerContent') set scrollerContentRef(ref: ElementRef<HTMLElement> | undefined) {
    this.scrollerContentEl = ref?.nativeElement ?? null;
    this.observeScroller();
  }
  private scrollerEl: HTMLElement | null = null;
  private scrollerContentEl: HTMLElement | null = null;
  private scrollerObserver: ResizeObserver | null = null;
  private viewReady = false;
  private readonly recenterEffect = effect(() => {
    this.previewWidthPx();
    if (!this.viewReady || !this.scrollerEl || typeof window === 'undefined') {
      return;
    }
    requestAnimationFrame(() => this.centerIfScrollable());
  });

  // Get current username and generate initial byline block
  private readonly currentUserService = inject(CurrentUserService);
  readonly currentUser = this.currentUserService.user;
  private readonly currentAuthor = computed(() => {
    const user = this.currentUser();
    if (!user) { return 'Admin'; }
    return user.username ? user.username.trim() :
      (user.firstName ? user.firstName : 'Admin');
  });

  constructor() {
    effect(() => {
      const author = this.currentAuthor();
      this.blocks.update(arr => {
        let changed = false;
        const next = arr.map(block => {
          if (this.isBylineBlock(block) && block.author !== author) {
            changed = true;
            return { ...block, author };
          }
          return block;
        });
        return changed ? next : arr;
      });
    });
  }

  // Initial editor state and selected block as signal array
  blocks = signal<AnyBlock[]>([
    { id: 't1', type: 'title', layout: { row: 1, colStart: 1, colSpan: 12, rowSpan: 2 }, text: '' } as TitleBlock,
    { id: 'b1', type: 'byline', layout: { row: 3, colStart: 1, colSpan: 12, rowSpan: 2 }, author: '', publishedAt: '' } as BylineBlock
  ]);
  // Read-only version of blocks, sorted by row then column, for page flow
  pageBlocks = computed(() => [...this.blocks()].sort((a, b) => this.compareByLayout(a, b)));

  selectedId = signal<string | null>(null);
  selected = computed(() => this.blocks().find(b => b.id === this.selectedId()) ?? null);
  inspectorOpen = signal(true);
  inspectorOverlaps = signal(false);

  @HostListener('document:keydown.escape')
  onEsc() { this.clearSelection(); }

  @HostListener('window:resize')
  onViewportResize() {
    this.updateInspectorView();
  }

  ngAfterViewInit() {
    this.updateInspectorView();
    this.viewReady = true;
    this.centerIfScrollable();
  }

  setPreviewMode(id: PreviewModeId | string) {
    const nextId = id as PreviewModeId;
    if (this.previewModeId() === nextId) {
      return;
    }
    this.previewModeId.set(nextId);
    if (this.viewReady) {
      requestAnimationFrame(() => this.centerIfScrollable());
    }
  }

  setPreviewZoom(percent: number) {
    const next = Math.min(200, Math.max(25, Math.round(percent)));
    this.previewZoom.set(next);
  }

  resetPreviewZoom() {
    this.previewZoom.set(100);
  }

  private observeScroller(): void {
    this.scrollerObserver?.disconnect();
    if (!this.scrollerContentEl || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.scrollerObserver = new ResizeObserver(() => this.centerIfScrollable());
    this.scrollerObserver.observe(this.scrollerContentEl);
  }

  private centerIfScrollable(): void {
    if (typeof window === 'undefined' || !this.scrollerEl) {
      return;
    }
    const scrollableWidth = this.scrollerEl.scrollWidth;
    const visibleWidth = this.scrollerEl.clientWidth;
    if (scrollableWidth <= visibleWidth) {
      return;
    }
    this.scrollerEl.scrollLeft = (scrollableWidth - visibleWidth) / 2;
  }

  // Help the canvas id which block types to render
  isTitleBlock(block: AnyBlock): block is TitleBlock { return block.type === 'title'; }
  isBylineBlock(block: AnyBlock): block is BylineBlock { return block.type === 'byline'; }
  isTextBlock(block: AnyBlock): block is TextBlock { return block.type === 'text'; }
  isImageBlock(block: AnyBlock): block is ImageBlock { return block.type === 'image'; }
  supportsFontSize(block: AnyBlock | null): block is TitleBlock | TextBlock | BylineBlock {
    if (!block) {
      return false;
    }
    return this.isTitleBlock(block) || this.isTextBlock(block) || this.isBylineBlock(block);
  }

  // Generate new Components
  addTitle() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 2,
      }, arr);
      return [...arr, { id, type: 'title', layout, hAlign: "flex-start", vAlign: "flex-start", text: '' } as TitleBlock];
    });
    this.selectedId.set(id);
  }

  addByline() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 2,
      }, arr);
      return [...arr, {
        id,
        type: 'byline',
        layout,
        hAlign: "flex-start", 
        vAlign: "flex-start",
        author: this.currentAuthor()
      } as BylineBlock];
    });
    this.selectedId.set(id);
  }

  addText() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: Math.min(this.columns, 8),
        rowSpan: 4,
      }, arr);
      return [...arr, { id, type: 'text', layout, hAlign: "flex-start", vAlign: "flex-start", text: '' } as TextBlock];
    });
    this.selectedId.set(id);
  }

  addImage() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: Math.min(this.columns, 6),
        rowSpan: 5,
      }, arr);
      return [
        ...arr,
        {
          id,
          type: 'image',
          layout,
          hAlign: "flex-start", 
          vAlign: "flex-start",
          src: '',
          alt: '',
          mediaHandle: null
        } as ImageBlock
      ];
    });
    this.selectedId.set(id);
  }

  // Remove a component
  remove(id: string) {
    this.blocks.update(arr => {
      const remaining = arr.filter(b => b.id !== id);
      const sorted = [...remaining].sort((a, b) => this.compareByLayout(a, b));
      const normalized = this.reindexRows(sorted);
      const byId = new Map(normalized.map(block => [block.id, block]));
      return remaining.map(block => byId.get(block.id) ?? block);
    });
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  // Live preview styles
  blockStyle(block: AnyBlock) {
    const layout = block.layout ?? { row: 1, colStart: 1, colSpan: this.columns, rowSpan: 1 };
    const hAlign = block.hAlign ?? 'flex-start';
    const vAlign = block.vAlign ?? 'flex-start';
    const isText = this.isTextBlock(block);
    const alignItems = isText ? 'stretch' : hAlign;
    return {
      'grid-column': `${layout.colStart} / span ${layout.colSpan}`,
      'grid-row': `${layout.row} / span ${layout.rowSpan ?? 1}`,
      'align-items': alignItems,
      'justify-content': vAlign
    };
  }

  autoSize(blockId: string, contentHeight: number) {
    if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
      return;
    }
    const targetRows = this.rowsForContentHeight(contentHeight);
    this.blocks.update(blocks => {
      let changed = false;
      const resized = blocks.map(block => {
        if (block.id !== blockId || !this.isTextBlock(block) || !block.layout) {
          return block;
        }
        const currentSpan = Math.max(1, block.layout.rowSpan ?? 1);
        if (currentSpan === targetRows) {
          return block;
        }
        changed = true;
        return {
          ...block,
          layout: { ...block.layout, rowSpan: targetRows },
        };
      });
      if (!changed) {
        return blocks;
      }
      const sorted = [...resized].sort((a, b) => this.compareByLayout(a, b));
      const normalized = this.reindexRows(sorted);
      const byId = new Map(normalized.map(entry => [entry.id, entry]));
      return resized.map(block => byId.get(block.id) ?? block);
    });
  }

  setColumns(val: number) {
    const next = Math.max(1, Math.min(Math.floor(val || this.columns), this.maxColumns));
    if (next === this.columns) {
      return;
    }
    const reflowed = this.reflowColumns(next);
    if (!reflowed) {
      return;
    }
    this.columns = next;
    this.blocks.set(reflowed);
  }

  setGap(val: number) {
    const next = Math.max(0, Math.min(Math.floor(val || 0), 64));
    this.gapPx = next;
  }

  setRowHeight(val: number) {
    const next = Math.max(8, Math.min(Math.floor(val || this.tileRowHeight), 256));
    this.tileRowHeight = next;
  }

  // Set/clear focus
  select(blockId: string) { this.selectedId.set(blockId); }

  clearSelection() {
    this.selectedId.set(null);
  }

  toggleInspector() {
    this.inspectorOpen.update((open) => !open);
  }

  onLayoutChange(block: AnyBlock, layout: GridPlacement) {
    const current = this.blocks();
    const validated = this.tryPlace(block.id, layout, current);
    if (!validated) {
      this.blocks.update(arr => arr.map(b => {
        if (b.id !== block.id || !b.layout) {
          return b;
        }
        return { ...b, layout: { ...b.layout } };
      }));
      return;
    }
    this.onBlockUpdate(block, { layout: validated });
  }

  onPreviewCanvasClick(event: MouseEvent) {
    event.stopPropagation();
    this.clearSelection();
  }

  onPreviewBlockClick(blockId: string, event: MouseEvent) {
    event.stopPropagation();
    this.select(blockId);
  }

  onFontSizeInput(block: AnyBlock, raw: string | number | null | undefined) {
    if (!this.supportsFontSize(block)) {
      return;
    }
    if (raw === null || raw === undefined || raw === '') {
      this.onBlockUpdate(block, { fontSize: null });
      return;
    }
    const value = typeof raw === 'number' ? raw : Number(raw);
    const parsed = FontSizePatchSchema.safeParse({ fontSize: value });
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, parsed.data);
  }

  resetFontSize(block: AnyBlock) {
    if (!this.supportsFontSize(block)) {
      return;
    }
    this.onBlockUpdate(block, { fontSize: null });
  }

  onFontSizeBlur(block: AnyBlock) {
    if (!this.supportsFontSize(block)) {
      return;
    }
    const current = block.fontSize;
    if (current == null) {
      return;
    }
    const clamped = Math.min(96, Math.max(12, Math.round(current)));
    const parsed = FontSizePatchSchema.safeParse({ fontSize: clamped });
    if (!parsed.success) {
      return;
    }
    if (clamped !== current) {
      this.onBlockUpdate(block, parsed.data);
    }
  }

  onHAlignChange(block: AnyBlock, align: AlignType) {
    const parsed = AlignTypeSchema.safeParse(align);
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, { hAlign: parsed.data });
  }

  onVAlignChange(block: AnyBlock, align: AlignType) {
    const parsed = AlignTypeSchema.safeParse(align);
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, { vAlign: parsed.data });
  }

  onInspectorMediaSelected(item: MediaItem) {
    const target = this.selected();
    if (!target || !this.isImageBlock(target)) {
      return;
    }
    const cdn = item.cdnUrl?.trim() ?? '';
    const storage = item.storagePath?.trim() ?? '';
    const nextSrc = cdn || storage;
    if (!nextSrc) {
      return;
    }
    const patch: BlockUpdate = {
      src: nextSrc,
      mediaHandle: item.handle
    };
    if (!target.alt?.trim()) {
      patch.alt = this.buildAltSuggestion(item.filename);
    }
    this.onBlockUpdate(target, patch);
  }

  clearImageBlock(block: ImageBlock) {
    if (!this.isImageBlock(block)) {
      return;
    }
    this.onBlockUpdate(block, { src: '', alt: '', mediaHandle: null });
  }

  onTextContentChange(block: TextBlock, html: string | null | undefined) {
    if (!this.isTextBlock(block)) {
      return;
    }
    const next = this.normalizeEditorHtml(html);
    if ((block.text ?? '') === next) {
      return;
    }
    this.onBlockUpdate(block, { text: next });
  }

  private readonly ParsedPatchSchema = BlockUpdateSchema.partial();
  private normalizePatch = (input: BlockUpdate | null) => {
    const parsed = this.ParsedPatchSchema.safeParse(input);
    return parsed.success ? parsed.data : null;
  };

  onBlockUpdate(block: AnyBlock, patch: BlockUpdate) {
    const normalized = this.normalizePatch(patch);
    if (!normalized) {
      return;
    }

    this.blocks.update(arr => arr.map(b => {
      if (b.id !== block.id) {
        return b;
      }
      let next = { ...b };

      if (normalized.layout) {
        const layout = this.tryPlace(b.id, normalized.layout, arr);
        if (layout) {
          next.layout = layout;
        }
      }

      if (Object.prototype.hasOwnProperty.call(normalized, 'fontSize')) {
        if (normalized.fontSize === null) {
          delete next.fontSize;
        } else {
          next.fontSize = normalized.fontSize;
        }
      }
      if (normalized.hAlign) {
        next.hAlign = normalized.hAlign;
      }
      if (normalized.vAlign) {
        next.vAlign = normalized.vAlign;
      }

      if (this.isTitleBlock(next) || this.isTextBlock(next)) {
        if (Object.prototype.hasOwnProperty.call(normalized, 'text')) {
          next = { ...next, text: normalized.text ?? '' };
        }
      } else if (this.isImageBlock(next)) {
        next = {
          ...next,
          ...(normalized.src !== undefined ? { src: normalized.src ?? '' } : {}),
          ...(normalized.alt !== undefined ? { alt: normalized.alt } : {}),
          ...(normalized.mediaHandle !== undefined ? { mediaHandle: normalized.mediaHandle ?? null } : {}),
          ...(normalized.imageStyle !== undefined ? { imageStyle: normalized.imageStyle ?? undefined } : {}),
        };
      } else if (this.isBylineBlock(next)) {
        next = {
          ...next,
          ...(normalized.author !== undefined ? { author: normalized.author ?? next.author } : {}),
          ...(normalized.publishedAt !== undefined ? { publishedAt: normalized.publishedAt ?? undefined } : {}),
        };
      }

      return next;
    }));
  }

  private normalizeEditorHtml(value: string | null | undefined) {
    const trimmed = (value ?? '').trim();
    return trimmed === '<p><br></p>' ? '' : trimmed;
  }

  // Strip file extension, and replace underscores/dashes with spaces
  private buildAltSuggestion(filename: string | null | undefined) {
    if (!filename) {
      return '';
    }
    return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }

  private updateInspectorView() {
    if (typeof window === 'undefined') {
      return;
    }
    const shouldOverlap = window.innerWidth <= 1024;
    this.inspectorOverlaps.set(shouldOverlap);
  }

  // Find last empty row
  private nextRow(blocks: AnyBlock[]) {
    const lastRow = blocks.reduce((max, block) => {
      const layout = block.layout;
      if (!layout) {
        return max;
      }
      const span = Math.max(1, layout.rowSpan ?? 1);
      const rowEnd = (layout.row ?? 0) + span - 1;
      return Math.max(max, rowEnd);
    }, 0);
    return lastRow + 1;
  }

  private rowsForContentHeight(contentHeight: number) {
    const rowHeight = Math.max(1, this.tileRowHeight);
    const rowGap = Math.max(0, this.gapPx);
    const paddedHeight = Math.max(0, contentHeight + BLOCK_VERTICAL_PADDING);
    return Math.max(1, Math.ceil((paddedHeight + rowGap) / (rowHeight + rowGap)));
  }

  // Stack each block's rows without gaps
  private reindexRows(blocks: AnyBlock[]) {
    let currentRow = 1;
    return blocks.map((block) => {
      const span = Math.max(1, block.layout?.rowSpan ?? 1);
      const layout = this.clampLayout({
        ...(block.layout ?? { row: currentRow, colStart: 1, colSpan: this.columns, rowSpan: span }),
        row: currentRow,
        rowSpan: span,
      });
      currentRow += span;
      return {
        ...block,
        layout,
      };
    });
  }

  // Reshuffles layout when column count is changed
  private reflowColumns(total: number) {
    const sorted = [...this.pageBlocks()];
    const placed: AnyBlock[] = [];
    for (const block of sorted) {
      const seed = block.layout ?? { row: this.nextRow(placed), colStart: 1, colSpan: total, rowSpan: 1 };
      const layout = this.tryPlace(block.id, seed, placed, total);
      if (!layout) {
        return null;
      }
      placed.push({ ...block, layout });
    }
    const byId = new Map(placed.map(entry => [entry.id, entry]));
    return this.blocks().map(block => byId.get(block.id) ?? block);
  }

  // Sort by row then column
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

  private clampLayout(desired: GridPlacement, total = this.columns): GridPlacement {
    const totalCols = total;
    const row = Math.max(1, desired?.row ?? 1);
    const colSpan = Math.max(1, Math.min(desired?.colSpan ?? totalCols, totalCols));
    const maxStart = totalCols - colSpan + 1;
    const colStart = Math.max(1, Math.min(desired?.colStart ?? 1, maxStart));
    const rowSpan = Math.max(1, desired?.rowSpan ?? 1);
    return { row, colStart, colSpan, rowSpan };
  }

  private tryPlace(blockId: string, desired: GridPlacement, blocks: AnyBlock[], total = this.columns) {
    const layout = this.clampLayout(desired, total);
    return this.hasOverlap(blockId, layout, blocks) ? null : layout;
  }

  private autoPlace(blockId: string, desired: GridPlacement, blocks: AnyBlock[], total = this.columns) {
    let row = desired.row ?? this.nextRow(blocks);
    const attempts = blocks.length + 12;
    for (let i = 0; i < attempts; i += 1) {
      const layout = this.tryPlace(blockId, { ...desired, row }, blocks, total);
      if (layout) {
        return layout;
      }
      row += 1;
    }
    return this.clampLayout({ ...desired, row }, total);
  }

  private hasOverlap(blockId: string, layout: GridPlacement, blocks: AnyBlock[]) {
    const startRow = layout.row;
    const endRow = startRow + (layout.rowSpan ?? 1) - 1;
    const startCol = layout.colStart;
    const endCol = startCol + layout.colSpan - 1;

    return blocks.some(block => {
      if (block.id === blockId || !block.layout) {
        return false;
      }
      const other = this.clampLayout(block.layout);
      const otherStartRow = other.row;
      const otherEndRow = otherStartRow + (other.rowSpan ?? 1) - 1;
      if (otherEndRow < startRow || endRow < otherStartRow) {
        return false;
      }
      const otherStartCol = other.colStart;
      const otherEndCol = otherStartCol + other.colSpan - 1;
      return !(endCol < otherStartCol || otherEndCol < startCol);
    });
  }

  trackByBlockId: TrackByFunction<AnyBlock> = (_i, block) => block.id;
}
