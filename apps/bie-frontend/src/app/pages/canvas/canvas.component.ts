import { Component, TrackByFunction, computed, signal, HostListener, effect, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CurrentUserService } from '../../services/current-user/current-user.service';
import { AnyBlock, TextBlock, ImageBlock, BylineBlock, TitleBlock, BlockUpdate, GridPlacement, AlignType } from 'bie-models';
import { BlogTitleComponent } from '../../components/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/imagebox/imagebox.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import { LayoutControlsComponent } from '../../components/layout-controls/layout-controls.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { MatExpansionModule } from '@angular/material/expansion';

type PreviewModeId = 'responsive' | 'mobile' | 'tablet' | 'desktop' | 'hd';

interface PreviewPreset {
  id: PreviewModeId;
  label: string;
  widthPx: number | null;
  description: string;
}

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
    MatExpansionModule
  ],
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
  previewModeId = signal<PreviewModeId>('responsive');
  previewZoom = signal(100);
  readonly previewPreset = computed(() => {
    return this.previewPresets.find(preset => preset.id === this.previewModeId()) ?? this.previewPresets[0];
  });
  readonly previewWidthPx = computed(() => this.previewPreset().widthPx);
  readonly previewScale = computed(() => this.previewZoom() / 100);

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
  // Read-only version of blocks, sorted by row then column
  pageBlocks = computed(() => [...this.blocks()].sort((a, b) => this.compareByLayout(a, b)));

  selectedId = signal<string | null>(null);
  selected = computed(() => this.blocks().find(b => b.id === this.selectedId()) ?? null);
  inspectorOpen = signal(true);
  inspectorCollapsible = signal(true);

  @HostListener('document:keydown.escape')
  onEsc() { this.clearSelection(); }

  @HostListener('window:resize')
  onViewportResize() {
    this.updateInspectorView();
  }

  ngAfterViewInit() {
    this.updateInspectorView();
  }

  setPreviewMode(id: PreviewModeId | string) {
    const nextId = id as PreviewModeId;
    if (this.previewModeId() === nextId) {
      return;
    }
    this.previewModeId.set(nextId);
  }

  setPreviewZoom(percent: number) {
    const next = Math.min(200, Math.max(25, Math.round(percent)));
    this.previewZoom.set(next);
  }

  resetPreviewZoom() {
    this.previewZoom.set(100);
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
    const hAlign = block.hAlign;
    const vAlign = block.vAlign;
    return {
      'grid-column': `${layout.colStart} / span ${layout.colSpan}`,
      'grid-row': `${layout.row} / span ${layout.rowSpan ?? 1}`,
      'justify-content': `${hAlign}`,
      'align-items': `${vAlign}`
    };
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
    if (!this.inspectorCollapsible()) {
      return;
    }
    this.inspectorOpen.update((open) => !open);
  }

  onInspectorLayoutChange(block: AnyBlock, layout: GridPlacement) {
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
    if (!Number.isFinite(value)) {
      return;
    }
    const next = Math.min(96, Math.max(12, Math.round(value)));
    this.onBlockUpdate(block, { fontSize: next });
  }

  resetFontSize(block: AnyBlock) {
    if (!this.supportsFontSize(block)) {
      return;
    }
    this.onBlockUpdate(block, { fontSize: null });
  }

  onHAlignChange(block: AnyBlock, align: AlignType) {
    if (typeof align === 'string' && ['flex-start', 'center', 'flex-end'].includes(align)) {
      this.onBlockUpdate(block, { hAlign: align });
    }
  }

  onVAlignChange(block: AnyBlock, align: AlignType) {
    if (typeof align === 'string' && ['flex-start', 'center', 'flex-end'].includes(align)) {
      this.onBlockUpdate(block, { vAlign: align });
    }
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

  onBlockUpdate(block: AnyBlock, patch: BlockUpdate) {
    this.blocks.update(arr => arr.map(b => {
      if (b.id !== block.id) return b;
      let base: AnyBlock = b;
      if (patch.layout) {
        const layout = this.tryPlace(b.id, patch.layout, arr);
        if (layout) {
          base = { ...base, layout };
        }
      }
      if ('fontSize' in patch) {
        const updated = { ...base };
        if (typeof patch.fontSize === 'number' && Number.isFinite(patch.fontSize)) {
          updated.fontSize = patch.fontSize;
        } else {
          delete updated.fontSize;
        }
        base = updated;
      }
      if ('hAlign' in patch) {
        const updated = { ...base };
        if (typeof patch.hAlign === 'string') {
          updated.hAlign = patch.hAlign as AlignType;
        } 
        base = updated;
      }
      if ('vAlign' in patch) {
        const updated = { ...base };
        if (typeof patch.vAlign === 'string') {
          updated.vAlign = patch.vAlign as AlignType;
        }
        base = updated;
      }

      // Component specific changes
      if (this.isTitleBlock(base)) {
        return ('text' in patch) ? { ...base, text: patch.text ?? '' } as TitleBlock : base;
      }
      if (this.isTextBlock(base)) {
        return ('text' in patch) ? { ...base, text: patch.text ?? '' } as TextBlock : base;
      }
      if (this.isImageBlock(base)) {
        return {
          ...base,
          ...('src' in patch ? { src: patch.src ?? '' } : {}),
          ...('alt' in patch ? { alt: patch.alt } : {}),
          ...('mediaHandle' in patch ? { mediaHandle: patch.mediaHandle ?? null } : {}),
          ...('imageStyle' in patch ? { imageStyle: patch.imageStyle ?? null } : {})
        } as ImageBlock;
      }
      if (this.isBylineBlock(base)) {
        return {
          ...base,
          ...('author' in patch ? { author: patch.author ?? base.author } : {}),
          ...('publishedAt' in patch ? { publishedAt: patch.publishedAt } : {}),
        } as BylineBlock;
      }
      return base;
    }));
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
    const canCollapse = window.innerWidth > 1024;
    if (!canCollapse && !this.inspectorOpen()) {
      this.inspectorOpen.set(true);
    }
    this.inspectorCollapsible.set(canCollapse);
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
