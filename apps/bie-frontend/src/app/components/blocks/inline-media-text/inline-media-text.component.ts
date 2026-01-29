import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { AfterViewInit, Component, ElementRef, OnDestroy, SecurityContext, ViewChild, computed, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InlineImage, InlinePlacement, InlineTextBlock, InlineImageSize } from 'bie-models';
import type { MediaItem } from '../../../services/media-library/media-library.service';
import { MediaBrowserCarouselComponent } from '../../media-browser-carousel/media-browser-carousel.component';
import { BLOCK_SHELL, BlockShell } from '../block-shell/block-shell';

export const INLINE_MEDIA_PLACEMENTS: InlinePlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'left',
  'right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export const INLINE_MEDIA_SIZES: InlineImageSize[] = ['small', 'medium', 'large'];
export const INLINE_MEDIA_IMAGE_LIMIT = 4;

export function createInlineImage(placement: InlinePlacement = 'left'): InlineImage {
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

export function parseInlinePlacement(raw: string | InlinePlacement | null | undefined): InlinePlacement {
  const candidate = (raw ?? '').toString() as InlinePlacement;
  if (INLINE_MEDIA_PLACEMENTS.includes(candidate)) {
    return candidate;
  }
  return INLINE_MEDIA_PLACEMENTS[0];
}

export function parseInlineImageSize(raw: string | InlineImageSize | null | undefined): InlineImageSize {
  const candidate = (raw ?? '').toString() as InlineImageSize;
  if (INLINE_MEDIA_SIZES.includes(candidate)) {
    return candidate;
  }
  return 'medium';
}

export function normalizeInlineImages(input: InlineImage[] | null | undefined): InlineImage[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .slice(0, INLINE_MEDIA_IMAGE_LIMIT)
    .map((image, index) => {
      const placement = INLINE_MEDIA_PLACEMENTS.includes(image.placement)
        ? image.placement
        : INLINE_MEDIA_PLACEMENTS[0];
      const size = INLINE_MEDIA_SIZES.includes(image.size as InlineImageSize)
        ? (image.size as InlineImageSize)
        : 'medium';
      const id = (image.id ?? '').trim() || `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
      return {
        id,
        placement,
        size,
        src: (image.src ?? '').trim(),
        alt: image.alt ?? '',
        caption: image.caption ?? '',
        mediaHandle: image.mediaHandle ?? null,
      };
    });
}

@Component({
  selector: 'app-inline-media-text',
  imports: [CommonModule],
  templateUrl: './inline-media-text.component.html',
  styleUrls: ['./inline-media-text.component.scss'],
})
export class InlineTextComponent extends BlockShell<InlineTextBlock> implements AfterViewInit, OnDestroy {
  @ViewChild('inlineRoot', { static: true }) inlineRoot!: ElementRef<HTMLElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly hostShell = inject(BLOCK_SHELL, { skipSelf: true });
  private resizeObserver: ResizeObserver | null = null;
  private pendingHeight = 0;
  private autosizeFrame: number | null = null;

  private readonly bottomPlacements = new Set<InlinePlacement>([
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]);

  readonly fontSizes = computed(() => {
    const base = this.block().fontSize ?? 18;
    const clamp = (value: number) => Math.max(12, Math.round(value));
    return {
      desktop: clamp(base),
      tablet: clamp(base * 0.9),
      mobile: clamp(base * 0.85),
    };
  });

  readonly richContent = computed<SafeHtml>(() => {
    const raw = (this.block().text ?? '').trim();
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
    const normalized = this.normalizeWhitespace(sanitized);
    const html = normalized.length ? normalized : '<p>Add some text…</p>';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly imagesBefore = computed<InlineImage[]>(() => {
    const images = this.block().images ?? [];
    return images.filter(image => !this.bottomPlacements.has(image.placement));
  });

  readonly imagesAfter = computed<InlineImage[]>(() => {
    const images = this.block().images ?? [];
    return images.filter(image => this.bottomPlacements.has(image.placement));
  });

  readonly hasImages = computed(() => (this.block().images ?? []).length > 0);

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') {
      this.queueAutoSize(this.inlineRoot.nativeElement.offsetHeight);
      return;
    }
    const element = this.inlineRoot.nativeElement;
    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height ?? element.offsetHeight;
      this.queueAutoSize(height);
    });
    this.resizeObserver.observe(element);
    this.queueAutoSize(element.offsetHeight);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.autosizeFrame != null) {
      cancelAnimationFrame(this.autosizeFrame);
    }
    this.autosizeFrame = null;
    this.pendingHeight = 0;
  }

  hasSource(image: InlineImage | null | undefined): boolean {
    return Boolean(image && (image.src ?? '').trim());
  }

  placementClass(placement: InlinePlacement): string {
    return `placement-${placement}`;
  }

  sizeClass(size: InlineImage['size'] | null | undefined): string {
    const candidate = (size ?? 'medium').toLowerCase();
    if (candidate === 'small' || candidate === 'large') {
      return `size-${candidate}`;
    }
    return 'size-medium';
  }

  figureClasses(image: InlineImage): string[] {
    return [this.placementClass(image.placement), this.sizeClass(image.size)];
  }

  trackImage(_index: number, image: InlineImage): string {
    return image.id;
  }

  private queueAutoSize(height: number) {
    this.pendingHeight = height;
    if (this.autosizeFrame != null) {
      return;
    }
    this.autosizeFrame = requestAnimationFrame(() => {
      this.autosizeFrame = null;
      this.flushAutoSize();
    });
  }

  private flushAutoSize() {
    if (!this.pendingHeight) {
      return;
    }
    this.hostShell.autoSize?.(this.block().id, this.pendingHeight);
    this.pendingHeight = 0;
  }

  private normalizeWhitespace(html: string): string {
    if (!html) {
      return '';
    }
    return html.replace(/\u00a0/g, ' ').replace(/&(nbsp|#160|#x0*a0);/gi, ' ');
  }
}

@Component({
  selector: 'app-inline-media-text-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatExpansionModule, MediaBrowserCarouselComponent],
  templateUrl: './inline-media-text-inspector.component.html',
  styleUrls: ['./inline-media-text-inspector.component.scss'],
})
export class InlineMediaTextInspectorComponent {
  readonly block = input.required<InlineTextBlock>();
  readonly imagesChange = output<InlineImage[]>();

  readonly images = computed<InlineImage[]>(() => this.block().images ?? []);
  readonly placements = INLINE_MEDIA_PLACEMENTS;
  readonly sizes = INLINE_MEDIA_SIZES;
  readonly maxImages = INLINE_MEDIA_IMAGE_LIMIT;

  addInlineImage() {
    if (this.images().length >= this.maxImages) {
      return;
    }
    const defaultPlacement = this.placements[this.images().length] ?? this.placements[0];
    const next = [...this.images(), createInlineImage(defaultPlacement)];
    this.emitImages(next);
  }

  removeInlineImage(imageId: string) {
    this.emitImages(this.images().filter(image => image.id !== imageId));
  }

  onPlacementChange(imageId: string, raw: InlinePlacement | string | null | undefined) {
    const placement = parseInlinePlacement(raw);
    this.emitImages(
      this.images().map(image => (image.id === imageId ? { ...image, placement } : image)),
    );
  }

  onSizeChange(imageId: string, raw: InlineImageSize | string | null | undefined) {
    const size = parseInlineImageSize(raw);
    this.emitImages(
      this.images().map(image => (image.id === imageId ? { ...image, size } : image)),
    );
  }

  onSrcChange(imageId: string, raw: string | null | undefined) {
    const src = (raw ?? '').toString().trim();
    this.emitImages(
      this.images().map(image =>
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

  onAltChange(imageId: string, raw: string | null | undefined) {
    const alt = (raw ?? '').toString();
    this.emitImages(
      this.images().map(image => (image.id === imageId ? { ...image, alt } : image)),
    );
  }

  onCaptionChange(imageId: string, raw: string | null | undefined) {
    const caption = (raw ?? '').toString();
    this.emitImages(
      this.images().map(image => (image.id === imageId ? { ...image, caption } : image)),
    );
  }

  onMediaSelected(imageId: string, item: MediaItem) {
    const cdn = item.cdnUrl?.trim() ?? '';
    const storage = item.storagePath?.trim() ?? '';
    const src = cdn || storage;
    if (!src) {
      return;
    }
    this.emitImages(
      this.images().map(image => {
        if (image.id !== imageId) {
          return image;
        }
        const shouldSetAlt = !(image.alt ?? '').trim();
        return {
          ...image,
          src,
          mediaHandle: item.handle,
          alt: shouldSetAlt ? this.buildAltSuggestion(item.filename) : image.alt,
        };
      }),
    );
  }

  clearInlineImageMedia(imageId: string) {
    this.emitImages(
      this.images().map(image =>
        image.id === imageId ? { ...image, src: '', mediaHandle: null } : image,
      ),
    );
  }

  trackImage(_index: number, image: InlineImage) {
    return image.id;
  }

  private emitImages(images: InlineImage[]) {
    this.imagesChange.emit(normalizeInlineImages(images));
  }

  private buildAltSuggestion(filename: string | null | undefined) {
    if (!filename) {
      return '';
    }
    return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }
}
