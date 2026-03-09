import { Component, TrackByFunction, computed, signal, HostListener, effect, inject, AfterViewInit, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserService } from '../../services/current-user/current-user.service';
import { PagesService } from '../../services/pages/pages.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AnyBlock, TextBlock, ImageBlock, VideoBlock, BylineBlock, TitleBlock, BGBlock, DividerBlock,
  BlockUpdate, GridPlacement, AlignType, BlockUpdateSchema, AlignTypeSchema, BGStyleSchema,
  GridSettings, GridDefaults, Page, PageStatus, PageCreatePayload, PageUpdatePayload, InlineTextBlock,
  InlinePlacement, InlineImage, InlineImageSize
} from 'bie-models';
import { BlogTitleComponent } from '../../components/blocks/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blocks/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/blocks/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/blocks/imagebox/imagebox.component';
import { BackgroundBlockComponent } from '../../components/blocks/background-block/background-block.component';
import { HorizontalRuleBlockComponent } from '../../components/blocks/horizontal-rule-block/horizontal-rule-block.component';
import { ColorPickerInputComponent } from '../../components/color-picker-input/color-picker-input.component';
import { LayoutControlsComponent } from '../../components/layout-controls/layout-controls.component';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { BLOCK_SHELL } from '../../components/blocks/block-shell/block-shell';
import { extractYoutubeId } from '../../utils/youtube';
import { VideoBoxComponent } from '../../components/blocks/videobox/videobox.component';
import { InlineTextComponent } from '../../components/blocks/inline-media-text/inline-media-text.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import { rowsForContentHeight } from '../../shared/grid-layout';
import {
  clampLayout, validateKeywords, compareByLayout, findInsertPoint, nextRow, normalizeEditorHtml,
  normalizeInlineImages, parseInlineImageSize, parseInlinePlacement, reflowRows, slugify, stringifyKeywords
} from './canvas-utils';

type PageMetaState = {
  id: string | null;
  title: string;
  slug: string;
  slugRef: string | null;
  status: PageStatus;
  description: string;
  keywords: string;
};

const pageMetaState: PageMetaState = {
  id: null,
  title: '',
  slug: '',
  slugRef: null,
  status: 'draft',
  description: '',
  keywords: '',
};

type PreviewModeId = 'responsive' | 'mobile' | 'tablet' | 'desktop' | 'hd';

interface PreviewPreset {
  id: PreviewModeId;
  label: string;
  widthPx: number | null;
  description: string;
}

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
    InlineTextComponent,
    BlogTitleComponent,
    BlogBylineComponent,
    LayoutControlsComponent,
    MatExpansionModule,
    RichTextEditorComponent,
    BackgroundBlockComponent,
    HorizontalRuleBlockComponent,
    ColorPickerInputComponent,
    MediaBrowserCarouselComponent
  ],
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => CanvasComponent) }],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  // Grid settings
  columns: number = GridDefaults.columns;
  gapPx: number = GridDefaults.gapPx;
  maxWidthPx: number = GridDefaults.maxWidthPx;
  readonly maxColumns = 24;
  readonly maxGridWidthPx = 4096;
  tileRowHeight: number = GridDefaults.rowHeight;
  readonly rowHeightPresets = [24, 32, 40, 48, 56, 64];
  readonly InlinePlacements: InlinePlacement[] = ['top-left', 'top-right'];
  readonly InlineImageSizes: InlineImageSize[] = ['small', 'medium', 'large'];
  readonly maxInlineImages = 4;
  // View settings
  readonly previewPresets: PreviewPreset[] = [
    { id: 'responsive', label: 'Fit to Window', widthPx: null, description: 'Responsive (fluid)' },
    { id: 'mobile', label: 'Mobile (375px)', widthPx: 375, description: 'Mobile phone' },
    { id: 'tablet', label: 'Tablet (768px)', widthPx: 768, description: 'Tablet' },
    { id: 'desktop', label: 'Desktop (1440px)', widthPx: 1440, description: 'Desktop monitor' },
    { id: 'hd', label: 'HD (1920px)', widthPx: 1920, description: 'HD monitor' },
  ];
  previewModeId = signal<PreviewModeId>('desktop');
  previewZoom = signal(100);
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
  readonly pageMeta = signal<PageMetaState>({ ...pageMetaState });
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
  // Read-only version of blocks, sorted by row then column
  pageBlocks = computed(() => [...this.blocks()].sort(compareByLayout));

  // Re-sync Effects
  private readonly rowReflowEffect = effect(() => {
    const snapshot = this.blocks();
    const { blocks, changed } = reflowRows(snapshot, this.columns);
    if (changed) {
      this.blocks.set(blocks);
    }
  });
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

  // Draft status for saving/publishing
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

  // Page meta helper functions
  onTitleChange(raw: string | null | undefined) {
    const title = raw ?? '';
    const slug = slugify(title);
    this.pageMeta.update(meta => ({ ...meta, title, slug }));
    this.saveError.set(null);
  }

  onMetaDescriptionChange(raw: string | null | undefined) {
    const description = (raw ?? '').toString();
    this.pageMeta.update(meta => ({ ...meta, description }));
  }

  onMetaKeywordsChange(raw: string | null | undefined) {
    const keywords = (raw ?? '').toString();
    const { invalid } = validateKeywords(keywords);
    this.pageMeta.update(meta => ({ ...meta, keywords }));
    this.keywordError.set(invalid.length ? `Remove invalid keywords: ${invalid.join(', ')}` : null);
  }

  // Save/publish/delete
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
      const draftMeta: PageMetaState = { ...meta, status: 'draft' };
      const basePayload = this.buildPageCreatePayload(draftMeta);
      if (meta.id || meta.slugRef) {
        const ref = meta.slugRef ?? meta.id ?? slug;
        const updatePayload: PageUpdatePayload = { ...basePayload, slug };
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
      const payload: PageUpdatePayload = {
        ...this.buildPageCreatePayload(meta),
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

  // 
  private buildPageCreatePayload(meta: PageMetaState): PageCreatePayload {
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
      maxWidthPx: this.maxWidthPx,
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
      keywords: stringifyKeywords(page.meta?.keywords),
    });
    this.keywordError.set(null);
    this.lastSavedAt.set(page.updatedAt ?? page.createdAt ?? null);
    this.applyGridSettings(page.grid);
    const normalizedBlocks = this.normalizeLoadedBlocks(page.blocks);
    const orderedBlocks = [...normalizedBlocks].sort(compareByLayout);
    this.blocks.set(orderedBlocks);
    this.selectedId.set(null);
    this.saveError.set(null);
  }

  private normalizeLoadedBlocks(blocks: AnyBlock[] | null | undefined): AnyBlock[] {
    if (!Array.isArray(blocks) || !blocks.length) {
      return this.createDefaultBlocks();
    }
    return blocks.map(block => {
      if (!this.isInlineTextBlock(block)) {
        return block;
      }
      return {
        ...block,
        images: normalizeInlineImages(block.images, {
          maxInlineImages: this.maxInlineImages,
          placements: this.InlinePlacements,
          sizes: this.InlineImageSizes,
        }),
      };
    });
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
    this.pageMeta.set({ ...pageMetaState });
    this.keywordError.set(null);
    this.lastSavedAt.set(null);
    this.saveError.set(null);
    this.applyGridSettings(GridDefaults);
    this.blocks.set(this.createDefaultBlocks());
    this.selectedId.set(null);
  }

  private applyGridSettings(grid?: GridSettings | null) {
    const next = this.normalizeGridSettings(grid);
    this.columns = next.columns;
    this.gapPx = next.gapPx;
    this.tileRowHeight = next.rowHeight;
    this.maxWidthPx = next.maxWidthPx;
  }

  private normalizeGridSettings(grid?: GridSettings | null): GridSettings {
    const columns = Math.max(1, Math.min(this.maxColumns, Math.floor(grid?.columns ?? GridDefaults.columns)));
    const gapPx = Math.max(0, Math.min(64, Math.floor(grid?.gapPx ?? GridDefaults.gapPx)));
    const rowHeight = Math.max(8, Math.min(256, Math.floor(grid?.rowHeight ?? GridDefaults.rowHeight)));
    const maxWidthPx = Math.max(
      0,
      Math.min(this.maxGridWidthPx, Math.floor(grid?.maxWidthPx ?? GridDefaults.maxWidthPx))
    );
    return { columns, gapPx, rowHeight, maxWidthPx };
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
    if (this.viewReady) {
      requestAnimationFrame(() => this.centerIfScrollable());
    }
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
  isInlineTextBlock(block: AnyBlock): block is InlineTextBlock { return block.type === 'InlineText'; }
  isVideoBlock(block: AnyBlock): block is VideoBlock { return block.type === 'video'; }
  isImageBlock(block: AnyBlock): block is ImageBlock { return block.type === 'image'; }
  isBackgroundBlock(block: AnyBlock): block is BGBlock { return block.type === 'background'; }
  isDividerBlock(block: AnyBlock): block is DividerBlock { return block.type === 'divider'; }
  supportsFontSize(block: AnyBlock | null): block is TitleBlock | TextBlock | BylineBlock | InlineTextBlock {
    if (!block) {
      return false;
    }
    return this.isTitleBlock(block) || this.isTextBlock(block) || this.isInlineTextBlock(block) || this.isBylineBlock(block);
  }
  supportsRichText(block: AnyBlock | null): block is TextBlock | InlineTextBlock {
    if (!block) {
      return false;
    }
    return this.isTextBlock(block) || this.isInlineTextBlock(block);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 2,
      }, this.columns);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 2,
      }, this.columns);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: Math.min(this.columns, 8),
        rowSpan: 4,
      }, this.columns);
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

  addInlineText() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: Math.min(this.columns, 8),
        rowSpan: 5,
      }, this.columns);
      return [
        ...arr,
        {
          id,
          type: 'InlineText',
          layout,
          hAlign: 'flex-start',
          vAlign: 'flex-start',
          text: '',
          images: [this.createInlineImage('top-left')],
        } as InlineTextBlock,
      ];
    });
    this.selectedId.set(id);
  }

  addVideo() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => {
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: Math.min(this.columns, 4),
        rowSpan: 3,
      }, this.columns);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: Math.min(this.columns, 2),
        rowSpan: 3,
      }, this.columns);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 1,
      }, this.columns);
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
      const nextRowPosition = nextRow(arr);
      const layout = clampLayout({
        row: nextRowPosition,
        colStart: 1,
        colSpan: this.columns,
        rowSpan: 6,
      }, this.columns);
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
    this.blocks.update(arr => arr.filter(b => b.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  // Live preview styles
  blockStyle(block: AnyBlock) {
    const layout = block.layout ?? { row: 1, colStart: 1, colSpan: this.columns, rowSpan: 1 };
    const hAlign = block.hAlign ?? 'flex-start';
    const vAlign = block.vAlign ?? 'flex-start';
    const stretchContent =
      this.isTextBlock(block) ||
      this.isInlineTextBlock(block) ||
      this.isBackgroundBlock(block) ||
      this.isVideoBlock(block) ||
      this.isImageBlock(block) ||
      this.isDividerBlock(block);
    const alignItems = stretchContent ? 'stretch' : hAlign;
    const justifyContent = stretchContent ? 'stretch' : vAlign;
    const zIndex = this.getBlockZIndex(block);
    return {
      'grid-column': `${layout.colStart} / span ${layout.colSpan}`,
      'grid-row': `${layout.row} / span ${layout.rowSpan ?? 1}`,
      'align-items': alignItems,
      'justify-content': justifyContent,
      'z-index': zIndex,
    };
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

  autoSize(blockId: string, contentHeight: number) {
    if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
      return;
    }
    const targetRows = rowsForContentHeight(contentHeight, this.tileRowHeight, this.gapPx);
    this.blocks.update(blocks =>
      blocks.map(block => {
        if (
          block.id !== blockId ||
          (!this.isTextBlock(block) && !this.isInlineTextBlock(block)) ||
          !block.layout
        ) {
          return block;
        }
        const currentSpan = Math.max(1, block.layout.rowSpan ?? 1);
        if (currentSpan === targetRows) {
          return block;
        }
        return {
          ...block,
          layout: { ...block.layout, rowSpan: targetRows },
        };
      })
    );
  }

  setColumns(val: number) {
    const next = Math.max(1, Math.min(Math.floor(val || this.columns), this.maxColumns));
    if (next === this.columns) {
      return;
    }
    this.columns = next;
    this.blocks.update(blocks =>
      blocks.map(block => {
        if (!block.layout) {
          return block;
        }
        return {
          ...block,
          layout: clampLayout(block.layout, next),
        };
      })
    );
  }

  setGap(val: number) {
    const next = Math.max(0, Math.min(Math.floor(val || 0), 64));
    this.gapPx = next;
  }

  setMaxWidth(val: number) {
    const next = Math.max(0, Math.min(Math.floor(val || 0), this.maxGridWidthPx));
    if (next === this.maxWidthPx) {
      return;
    }
    this.maxWidthPx = next;
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
    const currentLayout = block.layout ?? clampLayout({
      row: 1,
      colStart: 1,
      colSpan: this.columns,
      rowSpan: 1,
    }, this.columns);
    const targetRow = Math.max(1, Math.floor(layout.row ?? currentLayout.row ?? 1));
    const normalized = clampLayout({
      ...currentLayout,
      ...layout,
      row: currentLayout.row ?? targetRow,
      rowGap: layout.rowGap ?? currentLayout.rowGap ?? 0,
    }, this.columns);
    const layoutPatch: GridPlacement = {
      ...normalized,
      row: currentLayout.row ?? normalized.row,
      rowGap: layout.rowGap ?? currentLayout.rowGap ?? 0,
    };
    this.onBlockUpdate(block, { layout: layoutPatch });
    if ((currentLayout.row ?? 1) !== targetRow) {
      this.moveBlockToRow(block.id, targetRow);
    }
  }

  onPreviewCanvasClick(event: MouseEvent) {
    event.stopPropagation();
    this.clearSelection();
  }

  onPreviewBlockClick(blockId: string, event: MouseEvent) {
    event.stopPropagation();
    this.select(blockId);
  }

  addInlineImage(block: InlineTextBlock) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    if ((block.images ?? []).length >= this.maxInlineImages) {
      return;
    }
    const defaultPlacement =
      this.InlinePlacements[(block.images ?? []).length] ?? this.InlinePlacements[0];
    this.updateInlineImages(block, images => [...images, this.createInlineImage(defaultPlacement)]);
  }

  removeInlineImage(block: InlineTextBlock, imageId: string) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    this.updateInlineImages(block, images => images.filter(image => image.id !== imageId));
  }

  onInlineImagePlacementChange(
    block: InlineTextBlock,
    imageId: string,
    raw: InlinePlacement | string | null | undefined,
  ) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const placement = parseInlinePlacement(raw, this.InlinePlacements);
    this.updateInlineImages(block, images =>
      images.map(image => (image.id === imageId ? { ...image, placement } : image)),
    );
  }

  onInlineImageSizeChange(
    block: InlineTextBlock,
    imageId: string,
    raw: InlineImageSize | string | null | undefined,
  ) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const size = parseInlineImageSize(raw, this.InlineImageSizes);
    this.updateInlineImages(block, images =>
      images.map(image => (image.id === imageId ? { ...image, size } : image)),
    );
  }

  onInlineImageSrcChange(block: InlineTextBlock, imageId: string, raw: string | null | undefined) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const src = (raw ?? '').toString().trim();
    this.updateInlineImages(block, images =>
      images.map(image =>
        image.id === imageId
          ? {
            ...image,
            src,
            mediaHandle: src && src === (image.src ?? '').trim() ? image.mediaHandle : null,
          }
          : image,
      ),
    );
  }

  onInlineImageAltChange(block: InlineTextBlock, imageId: string, raw: string | null | undefined) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const alt = (raw ?? '').toString();
    this.updateInlineImages(block, images =>
      images.map(image => (image.id === imageId ? { ...image, alt } : image)),
    );
  }

  onInlineImageCaptionChange(block: InlineTextBlock, imageId: string, raw: string | null | undefined) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const caption = (raw ?? '').toString();
    this.updateInlineImages(block, images =>
      images.map(image => (image.id === imageId ? { ...image, caption } : image)),
    );
  }

  onInlineImageMediaSelected(block: InlineTextBlock, imageId: string, item: MediaItem) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    const cdn = item.cdnUrl?.trim() ?? '';
    const storage = item.storagePath?.trim() ?? '';
    const src = cdn || storage;
    if (!src) {
      return;
    }
    this.updateInlineImages(block, images =>
      images.map(image => {
        if (image.id !== imageId) {
          return image;
        }
        return {
          ...image,
          src,
          mediaHandle: item.handle,
        };
      }),
    );
  }

  clearInlineImageMedia(block: InlineTextBlock, imageId: string) {
    if (!this.isInlineTextBlock(block)) {
      return;
    }
    this.updateInlineImages(block, images =>
      images.map(image =>
        image.id === imageId ? { ...image, src: '', mediaHandle: null } : image,
      ),
    );
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
    if (this.isImageBlock(target) || this.isBackgroundBlock(target)) {
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

  //Inspector
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

  //Inspector
  onFontColorChange(block: AnyBlock, raw: string | number | null | undefined) {
    if (!this.supportsColor(block)) {
      return;
    }
    const color = (raw ?? '').toString().trim();
    this.onBlockUpdate(block, { color });
  }
  //Inspector
  resetFontSize(block: AnyBlock) {
    if (!this.supportsFontSize(block)) {
      return;
    }
    this.onBlockUpdate(block, { fontSize: null });
  }
  //Inspector
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

  //Alignment
  onHAlignChange(block: AnyBlock, align: AlignType) {
    const parsed = AlignTypeSchema.safeParse(align);
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, { hAlign: parsed.data });
  }
  //Alignment
  onVAlignChange(block: AnyBlock, align: AlignType) {
    const parsed = AlignTypeSchema.safeParse(align);
    if (!parsed.success) {
      return;
    }
    this.onBlockUpdate(block, { vAlign: parsed.data });
  }

  onRichTextContentChange(block: TextBlock | InlineTextBlock, html: string | null | undefined) {
    if (!this.supportsRichText(block)) {
      return;
    }
    const next = normalizeEditorHtml(html);
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
    this.blocks.update(arr =>
      arr.map(b => {
        if (b.id !== block.id) {
          return b;
        }
        let next = { ...b };

        if (normalized.layout) {
          next.layout = clampLayout(normalized.layout, this.columns);
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

        if (this.isTitleBlock(next) || this.isTextBlock(next) || this.isInlineTextBlock(next)) {
          if (Object.prototype.hasOwnProperty.call(normalized, 'text')) {
            next = { ...next, text: normalized.text ?? '' };
          }
        }
        if (this.isInlineTextBlock(next)) {
          if (Object.prototype.hasOwnProperty.call(normalized, 'images')) {
            const inlineImages = (normalized.images as InlineImage[] | null | undefined) ?? [];
            next = {
              ...next,
              images: normalizeInlineImages(inlineImages, {
                maxInlineImages: this.maxInlineImages,
                placements: this.InlinePlacements,
                sizes: this.InlineImageSizes,
              }),
            };
          } else if (!Array.isArray(next.images)) {
            next = { ...next, images: [] };
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
      })
    );
  }


  private buildMetaPayload(meta: PageMetaState): PageCreatePayload['meta'] | undefined {
    const description = meta.description.trim();
    const { values: keywords } = validateKeywords(meta.keywords);
    if (!description && !keywords.length) {
      return undefined;
    }
    return {
      ...(description ? { description } : {}),
      ...(keywords.length ? { keywords } : {}),
    };
  }

  private updateInlineImages(
    block: InlineTextBlock,
    transform: (images: InlineImage[]) => InlineImage[],
  ) {
    const current = Array.isArray(block.images) ? block.images : [];
    const next = transform([...current]);
    this.onBlockUpdate(block, {
      images: normalizeInlineImages(next, {
        maxInlineImages: this.maxInlineImages,
        placements: this.InlinePlacements,
        sizes: this.InlineImageSizes,
      }),
    });
  }

  private createInlineImage(placement: InlinePlacement = 'top-left'): InlineImage {
    return {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      placement,
      size: 'medium',
      src: '',
      alt: '',
      caption: '',
      mediaHandle: null,
    };
  }

  private updateInspectorView() {
    if (typeof window === 'undefined') {
      return;
    }
    const shouldOverlap = window.innerWidth <= 1024;
    this.inspectorOverlaps.set(shouldOverlap);
    this.inspectorOpen.set(!shouldOverlap);
  }

  // Remove block from blocks array, determine insertion point, clamp to grid, and update blocks state
  private moveBlockToRow(blockId: string, targetRow: number) {
    const ordered = [...this.blocks()];
    const currentIndex = ordered.findIndex(block => block.id === blockId);
    if (currentIndex < 0) {
      return;
    }
    const [block] = ordered.splice(currentIndex, 1);
    const { index, gap } = findInsertPoint(ordered, targetRow, this.columns);
    const layout = clampLayout(
      block.layout ?? { row: targetRow, colStart: 1, colSpan: this.columns, rowSpan: 1 },
      this.columns,
    );
    const updated: AnyBlock = {
      ...block,
      layout: {
        ...layout,
        rowGap: gap,
      },
    };
    ordered.splice(index, 0, updated);
    this.blocks.set(ordered);
  }

  trackByBlockId: TrackByFunction<AnyBlock> = (_i, block) => block.id;
}
