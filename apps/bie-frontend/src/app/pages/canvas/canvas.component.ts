import { Component, TrackByFunction, computed, signal, HostListener, effect, inject, AfterViewInit, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserService } from '../../services/current-user/current-user.service';
import { PagesService } from '../../services/pages/pages.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnyBlock, TextBlock, ImageBlock, VideoBlock, BylineBlock, TitleBlock, BGBlock, DividerBlock, BlockUpdate, GridPlacement, AlignType, BlockUpdateSchema, AlignTypeSchema, BGStyleSchema, GridSettings, GridSettingsDefaults, Page, PageStatus, PageWrite, PageUpdate } from 'bie-models';
import { BlogTitleComponent } from '../../components/blocks/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blocks/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/blocks/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/blocks/imagebox/imagebox.component';
import { BackgroundBlockComponent } from '../../components/blocks/background-block/background-block.component';
import { HorizontalRuleBlockComponent } from '../../components/blocks/horizontal-rule-block/horizontal-rule-block.component';
import { ColorPickerInputComponent } from '../../components/color-picker-input/color-picker-input.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import { LayoutControlsComponent } from '../../components/layout-controls/layout-controls.component';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { BLOCK_SHELL } from '../../components/blocks/block-shell/block-shell';
import { extractYoutubeId } from '../../utils/youtube';
import { VideoBoxComponent } from '../../components/blocks/videobox/videobox.component';

// TODO: touch gesture handler for preview-frame area

type PreviewModeId = 'responsive' | 'mobile' | 'tablet' | 'desktop' | 'hd';

type PageMetaState = {
  id: string | null;
  title: string;
  slug: string;
  slugRef: string | null;
  status: PageStatus;
  description: string;
  keywords: string;
};

const defaultPageMeta: PageMetaState = {
  id: null,
  title: '',
  slug: '',
  slugRef: null,
  status: 'draft',
  description: '',
  keywords: '',
};

interface PreviewPreset {
  id: PreviewModeId;
  label: string;
  widthPx: number | null;
  description: string;
}

const BLOCK_VERTICAL_PADDING = 16; // matches .block's padding (8px top/bottom)
const FontSizePatchSchema = BlockUpdateSchema.pick({ fontSize: true });

@Component({
  selector: 'app-canvas',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TextBoxComponent,
    ImageBoxComponent,
    VideoBoxComponent,
    BlogTitleComponent,
    BlogBylineComponent,
    MediaBrowserCarouselComponent,
    LayoutControlsComponent,
    MatExpansionModule,
    RichTextEditorComponent,
    BackgroundBlockComponent,
    HorizontalRuleBlockComponent,
    ColorPickerInputComponent
  ],
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => CanvasComponent) }],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  // Grid settings
  columns: number = GridSettingsDefaults.columns;
  gapPx: number = GridSettingsDefaults.gapPx;
  readonly maxColumns = 24;
  tileRowHeight: number = GridSettingsDefaults.rowHeight;
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

  // Scroller and observers
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
  private readonly pagesService = inject(PagesService);
  private readonly route = inject(ActivatedRoute);

  // Drafts
  readonly pageMeta = signal<PageMetaState>({ ...defaultPageMeta });
  readonly savingDraft = signal(false);
  readonly publishingDraft = signal(false);
  readonly deletingDraft = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly lastSavedAt = signal<string | null>(null);
  readonly loadingDraft = signal(false);
  readonly draftLoadError = signal<string | null>(null);
  private draftLoadSeq = 0; // Keep track of most recent pages query

  // SEO
  readonly keywordError = signal<string | null>(null);

  // Initial editor state and selected block as signal array
  blocks = signal<AnyBlock[]>(this.createDefaultBlocks());
  // Read-only version of blocks, sorted by row then column, for page flow
  pageBlocks = computed(() => [...this.blocks()].sort((a, b) => this.compareByLayout(a, b)));
  private readonly titleBlockSyncEffect = effect(() => {
    const title = this.pageMeta().title ?? '';
    const blocks = this.blocks();
    let changed = false;
    const next = blocks.map(block => {
      if (!this.isTitleBlock(block) || (block.text ?? '') === title) {
        return block;
      }
      changed = true;
      return { ...block, text: title };
    });
    if (changed) {
      this.blocks.set(next);
    }
  });
  private readonly videoBlockSyncEffect = effect(() => {
    const blocks = this.blocks();
    let changed = false;
    const next = blocks.map(block => {
      if (!this.isVideoBlock(block)) {
        return block;
      }
      const trimmedUrl = (block.videoUrl ?? '').trim();
      const parsedFromUrl = extractYoutubeId(trimmedUrl);
      const trimmedId = (block.videoId ?? '').trim();
      const resolvedId = trimmedId || parsedFromUrl;
      if (resolvedId === block.videoId && trimmedUrl === (block.videoUrl ?? '')) {
        return block;
      }
      changed = true;
      return {
        ...block,
        videoId: resolvedId,
        videoUrl: trimmedUrl,
      };
    });
    if (changed) {
      this.blocks.set(next);
    }
  });

  readonly hasBlocks = computed(() => this.blocks().length > 0);
  readonly metadataReady = computed(() => Boolean(this.pageMeta().title.trim()) && Boolean(this.pageMeta().slug.trim()));
  readonly canSaveDraft = computed(
    () => this.metadataReady() && this.hasBlocks() && !this.savingDraft() && !this.loadingDraft()
  );
  readonly canDeleteDraft = computed(() =>
    Boolean(this.pageMeta().slugRef) &&
    !this.savingDraft() &&
    !this.publishingDraft() &&
    !this.loadingDraft() &&
    !this.deletingDraft()
  );
  readonly lastSavedDisplay = computed(() => {
    const value = this.lastSavedAt();
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
      hour: 'numeric',
      minute: '2-digit',
    });
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

    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const slug = params.get('draft');
        if (!slug) {
          return;
        }
        void this.loadDraft(slug);
      });
  }

  onTitleChange(raw: string | null | undefined) {
    const title = raw ?? '';
    const slug = this.slugify(title);
    this.pageMeta.update(meta => ({ ...meta, title, slug }));
    this.saveError.set(null);
  }

  onMetaDescriptionChange(raw: string | null | undefined) {
    const description = (raw ?? '').toString();
    this.pageMeta.update(meta => ({ ...meta, description }));
  }

  onMetaKeywordsChange(raw: string | null | undefined) {
    const keywords = (raw ?? '').toString();
    const { invalid } = this.collectKeywords(keywords);
    this.pageMeta.update(meta => ({ ...meta, keywords }));
    this.keywordError.set(invalid.length ? `Remove invalid keywords: ${invalid.join(', ')}` : null);
  }

  async saveDraft() {
    if (this.savingDraft() || this.publishingDraft() || this.loadingDraft()) {
      return;
    }
    const meta = this.pageMeta();
    const title = meta.title.trim();
    const slug = meta.slug.trim();
    if (!title || !slug) {
      this.saveError.set('Add a title and slug before saving.');
      return;
    }
    if (!this.blocks().length) {
      this.saveError.set('Add at least one block before saving.');
      return;
    }

    this.savingDraft.set(true);
    this.saveError.set(null);
    try {
      let page: Page;
      const basePayload = this.buildPageWritePayload(meta);
      if (meta.id || meta.slugRef) {
        const ref = meta.slugRef ?? meta.id ?? slug;
        const updatePayload: PageUpdate = { ...basePayload, slug };
        page = await this.pagesService.update(ref, updatePayload);
      } else {
        page = await this.pagesService.post(basePayload);
      }
      this.applySavedPage(page);
    } catch (err) {
      console.error('Failed to save draft', err);
      const message = (err as Error)?.message || 'Failed to save draft.';
      this.saveError.set(message);
    } finally {
      this.savingDraft.set(false);
    }
  }

  async publishDraft() {
    if (this.savingDraft() || this.publishingDraft() || this.loadingDraft()) {
      return;
    }
    if (!this.blocks().length) {
      this.saveError.set('Add at least one block before saving.');
      return;
    }
    const meta = this.pageMeta();
    if (!meta.id) {
      return;
    }
    this.publishingDraft.set(true);
    this.saveError.set(null);
    try {
      let page: Page;
      const payload: PageUpdate = {
        ...this.buildPageWritePayload(meta),
        status: 'published',
        publishedAt: new Date().toISOString(),
      };
      const ref = meta.slugRef ?? meta.id ?? meta.slug;
      page = await this.pagesService.update(ref, payload);
      this.applySavedPage(page);
    } catch (err) {
      console.error('Failed to publish draft', err);
      const message = (err as Error)?.message || 'Failed to publish draft.';
      this.saveError.set(message);
    } finally {
      this.publishingDraft.set(false);
    }
  }

  async deleteDraft() {
    if (!this.canDeleteDraft()) {
      return;
    }
    const meta = this.pageMeta();
    const ref = meta.slugRef ?? meta.slug;
    if (!ref) {
      return;
    }
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Delete this draft? This cannot be undone.');
      if (!confirmed) {
        return;
      }
    }
    this.deletingDraft.set(true);
    this.saveError.set(null);
    try {
      await this.pagesService.delete(ref);
      this.resetEditor();
    } catch (err) {
      console.error('Failed to delete draft', err);
      const message = (err as Error)?.message || 'Failed to delete draft.';
      this.saveError.set(message);
    } finally {
      this.deletingDraft.set(false);
    }
  }

  private buildPageWritePayload(meta: PageMetaState): PageWrite {
    const metaPayload = this.buildMetaPayload(meta);
    return {
      slug: meta.slug,
      title: meta.title,
      status: meta.status,
      blocks: this.blocks(),
      grid: this.getCurrentGridSettings(),
      ...(metaPayload ? { meta: metaPayload } : {}),
      publishedAt: null,
    };
  }

  private getCurrentGridSettings(): GridSettings {
    return {
      columns: this.columns,
      gapPx: this.gapPx,
      rowHeight: this.tileRowHeight,
    };
  }

  private applySavedPage(page: Page) {
    this.pageMeta.set({
      id: page.id ?? null,
      title: page.title ?? '',
      slug: page.slug ?? '',
      slugRef: page.slug ?? null,
      status: page.status ?? 'draft',
      description: typeof page.meta?.description === 'string' ? page.meta.description : '',
      keywords: this.stringifyKeywords(page.meta?.keywords),
    });
    this.keywordError.set(null);
    this.lastSavedAt.set(page.updatedAt ?? page.createdAt ?? null);
    this.applyGridSettings(page.grid);
    this.blocks.set(page.blocks?.length ? page.blocks : this.createDefaultBlocks());
    this.selectedId.set(null);
    this.saveError.set(null);
  }

  private async loadDraft(ref: string) {
    const slug = ref?.trim();
    if (!slug) {
      return;
    }
    const requestId = ++this.draftLoadSeq;
    this.loadingDraft.set(true);
    this.draftLoadError.set(null);
    try {
      const page = await this.pagesService.get(slug);
      if (requestId === this.draftLoadSeq) {
        this.applySavedPage(page);
      }
    } catch (err) {
      console.error('Failed to load draft', err);
      if (requestId === this.draftLoadSeq) {
        const message = (err as Error)?.message || 'Unable to load the selected draft.';
        this.draftLoadError.set(message);
        this.resetEditor();
      }
    } finally {
      if (requestId === this.draftLoadSeq) {
        this.loadingDraft.set(false);
      }
    }
  }

  private resetEditor() {
    this.pageMeta.set({ ...defaultPageMeta });
    this.keywordError.set(null);
    this.lastSavedAt.set(null);
    this.saveError.set(null);
    this.applyGridSettings(GridSettingsDefaults);
    this.blocks.set(this.createDefaultBlocks());
    this.selectedId.set(null);
  }

  private applyGridSettings(grid?: GridSettings | null) {
    const next = this.normalizeGridSettings(grid);
    this.columns = next.columns;
    this.gapPx = next.gapPx;
    this.tileRowHeight = next.rowHeight;
  }

  private normalizeGridSettings(grid?: GridSettings | null): GridSettings {
    const columns = Math.max(1, Math.min(this.maxColumns, Math.floor(grid?.columns ?? GridSettingsDefaults.columns)));
    const gapPx = Math.max(0, Math.min(64, Math.floor(grid?.gapPx ?? GridSettingsDefaults.gapPx)));
    const rowHeight = Math.max(8, Math.min(256, Math.floor(grid?.rowHeight ?? GridSettingsDefaults.rowHeight)));
    return { columns, gapPx, rowHeight };
  }

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
  isVideoBlock(block: AnyBlock): block is VideoBlock { return block.type === 'video'; }
  isImageBlock(block: AnyBlock): block is ImageBlock { return block.type === 'image'; }
  isBackgroundBlock(block: AnyBlock): block is BGBlock { return block.type === 'background'; }
  isDividerBlock(block: AnyBlock): block is DividerBlock { return block.type === 'divider'; }
  supportsFontSize(block: AnyBlock | null): block is TitleBlock | TextBlock | BylineBlock {
    if (!block) {
      return false;
    }
    return this.isTitleBlock(block) || this.isTextBlock(block) || this.isBylineBlock(block);
  }
  supportsColor(block: AnyBlock | null): block is TitleBlock | BylineBlock {
    if (!block) {
      return false;
    }
    return this.isTitleBlock(block) || this.isBylineBlock(block);
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
      return [
        ...arr,
        {
          id,
          type: 'title',
          layout,
          hAlign: "flex-start",
          vAlign: "flex-start",
          text: this.pageMeta().title ?? ''
        } as TitleBlock
      ];
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
      return [
        ...arr,
        {
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
      return [
        ...arr,
        {
          id,
          type: 'text',
          layout,
          hAlign: "flex-start",
          vAlign: "flex-start",
          text: ''
        } as TextBlock];
    });
    this.selectedId.set(id);
  }

  addVideo() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: Math.min(this.columns, 4),
        rowSpan: 3,
      }, arr);
      return [
        ...arr,
        {
          id,
          type: 'video',
          layout,
          hAlign: "flex-start",
          vAlign: "flex-start",
          videoId: '',
          videoUrl: ''
        } as VideoBlock
      ];
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
        colSpan: Math.min(this.columns, 2),
        rowSpan: 3,
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

  addHorizontalRule() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 1,
      }, arr);
      return [
        ...arr,
        {
          id,
          type: 'divider',
          layout,
          hAlign: 'center',
          vAlign: 'center',
        } as DividerBlock,
      ];
    });
    this.selectedId.set(id);
  }

  addBackground() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRow = this.nextRow(arr);
      const layout = this.autoPlace(id, {
        row: nextRow,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 6,
      }, arr);
      return [
        ...arr,
        {
          id,
          type: 'background',
          layout,
          hAlign: 'flex-start',
          vAlign: 'flex-start',
          color: '',
          src: '',
          mediaHandle: null,
          bgStyle: 'stretch',
        } as BGBlock,
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
    const stretchContent =
      this.isTextBlock(block) || this.isBackgroundBlock(block) || this.isVideoBlock(block) || this.isImageBlock(block) || this.isDividerBlock(block);
    const alignItems = stretchContent ? 'stretch' : hAlign;
    const justifyContent = stretchContent ? 'stretch' : vAlign;
    return {
      'grid-column': `${layout.colStart} / span ${layout.colSpan}`,
      'grid-row': `${layout.row} / span ${layout.rowSpan ?? 1}`,
      'align-items': alignItems,
      'justify-content': justifyContent
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
    this.onBlockUpdate(block, { layout });
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

  onFontColorChange(block: AnyBlock, raw: string | number | null | undefined) {
    if (!this.supportsColor(block)) {
      return;
    }
    const color = (raw ?? '').toString().trim();
    this.onBlockUpdate(block, { color });
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
    if (!target) {
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
    if (this.isImageBlock(target)) {
      if (!target.alt?.trim()) {
        patch.alt = this.buildAltSuggestion(item.filename);
      }
      this.onBlockUpdate(target, patch);
    } else if (this.isBackgroundBlock(target)) {
      this.onBlockUpdate(target, patch);
    }
  }

  clearImageBlock(block: ImageBlock) {
    if (!this.isImageBlock(block)) {
      return;
    }
    this.onBlockUpdate(block, { src: '', alt: '', mediaHandle: null });
  }

  clearBackgroundImage(block: BGBlock) {
    if (!this.isBackgroundBlock(block)) {
      return;
    }
    this.onBlockUpdate(block, { src: '', mediaHandle: null });
  }

  clearBackgroundColor(block: BGBlock) {
    if (!this.isBackgroundBlock(block)) {
      return;
    }
    this.onBlockUpdate(block, { color: '' });
  }

  onBackgroundColorChange(block: BGBlock, raw: string | null | undefined) {
    if (!this.isBackgroundBlock(block)) {
      return;
    }
    const color = (raw ?? '').trim();
    this.onBlockUpdate(block, { color });
  }

  onBackgroundImageUrlChange(block: BGBlock, raw: string | null | undefined) {
    if (!this.isBackgroundBlock(block)) {
      return;
    }
    const src = (raw ?? '').trim();
    this.onBlockUpdate(block, { src });
  }

  onBackgroundStyleChange(block: BGBlock, raw: string | null | undefined) {
    if (!this.isBackgroundBlock(block)) {
      return;
    }
    const parsed = BGStyleSchema.safeParse(raw);
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, { bgStyle: parsed.data });
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

  onVideoUrlChange(block: VideoBlock, url: string | null | undefined) {
    if (!this.isVideoBlock(block)) {
      return;
    }
    const input = (url ?? '').trim();
    const nextId = extractYoutubeId(input);
    if ((block.videoId ?? '') === nextId && (block.videoUrl ?? '') === input) {
      return;
    }
    this.onBlockUpdate(block, { videoId: nextId, videoUrl: input });
  }

  onVideoCaptionChange(block: VideoBlock, caption: string | null | undefined) {
    if (!this.isVideoBlock(block)) {
      return;
    }
    const nextCaption = (caption ?? '').trim();
    if ((block.caption ?? '') === nextCaption) {
      return;
    }
    this.onBlockUpdate(block, { caption: nextCaption });
  }

  private readonly ParsedPatchSchema = BlockUpdateSchema.partial();
  private readonly allowedPatchKeys = new Set(Object.keys(BlockUpdateSchema.shape));
  private normalizePatch = (input: BlockUpdate | null): BlockUpdate | null => {
    if (!input) {
      return null;
    }
    const parsed = this.ParsedPatchSchema.safeParse(input);
    if (!parsed.success) {
      return null;
    }
    const normalized = parsed.data as BlockUpdate;
    const normalizedRecord = normalized as Record<string, unknown>;
    const originalRecord = input as Record<string, unknown>;
    for (const key of Object.keys(originalRecord)) {
      if (!this.allowedPatchKeys.has(key)) {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(normalizedRecord, key) && normalizedRecord[key] !== undefined) {
        continue;
      }
      normalizedRecord[key] = originalRecord[key];
    }
    return normalized;
  };

  onBlockUpdate(block: AnyBlock, patch: BlockUpdate) {
    const normalized = this.normalizePatch(patch);
    if (!normalized) {
      console.warn('[Canvas] onBlockUpdate skipped (invalid patch)', { blockId: block.id, patch });
      return;
    }
    this.blocks.update(arr => {
      let working = arr;
      if (normalized.layout) {
        const reflowed = this.applyLayoutWithPushdown(block.id, normalized.layout, working);
        if (!reflowed) {
          console.warn('[Canvas] onBlockUpdate layout reflow failed', { blockId: block.id, layout: normalized.layout });
          return arr;
        }
        working = reflowed;
      }
      return working.map(b => {
        if (b.id !== block.id) {
          return b;
        }
        let next = { ...b };

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
          const layoutColSpan = next.layout?.colSpan;
          if (typeof layoutColSpan === 'number' && Number.isFinite(layoutColSpan)) {
            next = {
              ...next,
              imageStyle: { ...(next.imageStyle ?? {}), columns: layoutColSpan },
            };
          }
        } else if (this.isVideoBlock(next)) {
          const prevState = {
            videoId: next.videoId,
            videoUrl: next.videoUrl,
            caption: next.caption,
          };
          next = {
            ...next,
            ...(normalized.videoId !== undefined ? { videoId: normalized.videoId ?? next.videoId } : {}),
            ...(normalized.videoUrl !== undefined ? { videoUrl: normalized.videoUrl ?? next.videoUrl } : {}),
            ...(normalized.caption !== undefined ? { caption: normalized.caption ?? null } : {}),
          };
        } else if (this.isBylineBlock(next)) {
          next = {
            ...next,
            ...(normalized.author !== undefined ? { author: normalized.author ?? next.author } : {}),
            ...(normalized.publishedAt !== undefined ? { publishedAt: normalized.publishedAt ?? undefined } : {}),
          };
        } else if (this.isBackgroundBlock(next)) {
          next = {
            ...next,
            ...(normalized.src !== undefined ? { src: normalized.src ?? '' } : {}),
            ...(normalized.mediaHandle !== undefined ? { mediaHandle: normalized.mediaHandle ?? null } : {}),
            ...(normalized.color !== undefined ? { color: normalized.color ?? '' } : {}),
            ...(normalized.bgStyle !== undefined ? { bgStyle: normalized.bgStyle ?? 'stretch' } : {}),
          };
        }
        return next;
      });
    });
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

  private buildMetaPayload(meta: PageMetaState): PageWrite['meta'] | undefined {
    const description = meta.description.trim();
    const { values: keywords } = this.collectKeywords(meta.keywords);
    if (!description && !keywords.length) {
      return undefined;
    }
    return {
      ...(description ? { description } : {}),
      ...(keywords.length ? { keywords } : {}),
    };
  }

  private collectKeywords(raw: string | null | undefined): { values: string[]; invalid: string[] } {
    if (!raw) {
      return { values: [], invalid: [] };
    }
    const pattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{0,38}$/;
    const seen = new Set<string>();
    const values: string[] = [];
    const invalid: string[] = [];
    raw
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .forEach(keyword => {
        if (!pattern.test(keyword)) {
          invalid.push(keyword);
          return;
        }
        const normalized = keyword.toLowerCase();
        if (seen.has(normalized)) {
          return;
        }
        seen.add(normalized);
        values.push(keyword);
      });
    return { values, invalid };
  }

  private stringifyKeywords(value: unknown): string {
    if (Array.isArray(value)) {
      return value
        .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean)
        .join(', ');
    }
    if (typeof value === 'string') {
      return value;
    }
    return '';
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

  // Helper to clamp blocks within current margins
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

  private applyLayoutWithPushdown(blockId: string, desired: GridPlacement, blocks: AnyBlock[], total = this.columns): AnyBlock[] | null {
    const targetExists = blocks.some(entry => entry.id === blockId);
    if (!targetExists) {
      return null;
    }
    const override = this.clampLayout(desired, total);
    const entries = blocks.map((entry, index) => {
      const baseLayout = entry.layout
        ? this.clampLayout(entry.layout, total)
        : this.clampLayout(
            {
              row: index + 1,
              colStart: 1,
              colSpan: total,
              rowSpan: 1,
            },
            total
          );
      const layout = entry.id === blockId ? override : baseLayout;
      return { block: entry, layout };
    });
    return this.cascadeLayouts(entries, blocks, total, blockId);
  }

  private cascadeLayouts(
    entries: { block: AnyBlock; layout: GridPlacement }[],
    blocks: AnyBlock[],
    total: number,
    priorityId?: string
  ): AnyBlock[] {
    if (!entries.length) {
      return blocks;
    }
    const sorted = [...entries].sort((a, b) => this.compareCascadeEntries(a, b, priorityId));
    const columnHeights = new Array(total + 2).fill(1);
    const placed = new Map<string, GridPlacement>();
    for (const entry of sorted) {
      const span = Math.max(1, entry.layout.rowSpan ?? 1);
      const startCol = entry.layout.colStart;
      const endCol = startCol + entry.layout.colSpan - 1;
      let row = entry.layout.row;
      for (let col = startCol; col <= endCol; col += 1) {
        const available = columnHeights[col] ?? 1;
        row = Math.max(row, available);
      }
      const placement: GridPlacement = { ...entry.layout, row };
      placed.set(entry.block.id, placement);
      const releaseRow = row + span;
      for (let col = startCol; col <= endCol; col += 1) {
        columnHeights[col] = releaseRow;
      }
    }
    return blocks.map(block => {
      const placement = placed.get(block.id);
      if (!placement) {
        return block;
      }
      if (this.sameLayout(block.layout, placement)) {
        return block;
      }
      return { ...block, layout: placement };
    });
  }

  private compareCascadeEntries(
    a: { block: AnyBlock; layout: GridPlacement },
    b: { block: AnyBlock; layout: GridPlacement },
    priorityId?: string
  ) {
    const rowDiff = a.layout.row - b.layout.row;
    if (rowDiff !== 0) {
      return rowDiff;
    }
    if (priorityId) {
      if (a.block.id === priorityId && b.block.id !== priorityId) {
        return -1;
      }
      if (b.block.id === priorityId && a.block.id !== priorityId) {
        return 1;
      }
    }
    const colDiff = a.layout.colStart - b.layout.colStart;
    if (colDiff !== 0) {
      return colDiff;
    }
    return a.block.id.localeCompare(b.block.id);
  }

  // Compare grid placement between 2 blocks
  private sameLayout(a?: GridPlacement | null, b?: GridPlacement | null): boolean {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return (
      a.row === b.row &&
      a.colStart === b.colStart &&
      a.colSpan === b.colSpan &&
      (a.rowSpan ?? 1) === (b.rowSpan ?? 1)
    );
  }

  // Checks to see if moving a block will overlap an existing one during reflow
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

  // Sets a title and byline block at the top of a new page
  private createDefaultBlocks(): AnyBlock[] {
    const title = this.pageMeta().title ?? '';
    const totalCols = Math.max(1, this.columns);
    return [
      {
        id: 't1',
        type: 'title',
        layout: { row: 1, colStart: 1, colSpan: totalCols, rowSpan: 2 },
        hAlign: 'flex-start',
        vAlign: 'center',
        text: title,
      } as TitleBlock,
      {
        id: 'b1',
        type: 'byline',
        layout: { row: 3, colStart: 1, colSpan: totalCols, rowSpan: 2 },
        hAlign: 'flex-start',
        vAlign: 'center',
        author: this.currentAuthor(),
        publishedAt: '',
      } as BylineBlock,
    ];
  }

  // Convert a title to a valid URI value
  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  trackByBlockId: TrackByFunction<AnyBlock> = (_i, block) => block.id;
}
