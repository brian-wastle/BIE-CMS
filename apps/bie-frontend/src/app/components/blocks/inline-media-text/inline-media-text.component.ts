import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, SecurityContext, ViewChild, computed, effect, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InlineImage, InlinePlacement, InlineTextBlock } from 'bie-models';
import { BLOCK_SHELL, BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-inline-media-text',
  imports: [CommonModule],
  templateUrl: './inline-media-text.component.html',
  styleUrls: ['./inline-media-text.component.scss'],
})
export class InlineTextComponent extends BlockShell<InlineTextBlock> implements AfterViewInit, OnDestroy {
  @ViewChild('inlineRoot', { static: true }) inlineRoot!: ElementRef<HTMLElement>;
  @ViewChild('inlineText', { static: true }) inlineText!: ElementRef<HTMLElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly hostShell = inject(BLOCK_SHELL, { skipSelf: true });
  private readonly cdr = inject(ChangeDetectorRef);
  private resizeObserver: ResizeObserver | null = null;
  private figureObserver: ResizeObserver | null = null;
  private observedFigures = new Set<HTMLElement>();
  private pendingHeight = 0;
  private autosizeFrame: number | null = null;
  private offsetsFrame: number | null = null;
  private figureOffsets = new Map<string, number>();
  private viewReady = false;

  private readonly centerPlacements = new Set<InlinePlacement>();

  private readonly offsetsEffect = effect(() => {
    // Track image structure changes so we can refresh alignment.
    this.block().images ?? [];
    this.requestFigureOffsetUpdate();
  });

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
    return images;
  });

  readonly hasImages = computed(() => (this.block().images ?? []).length > 0);

  ngAfterViewInit(): void {
    this.viewReady = true;
    const element = this.inlineRoot.nativeElement;
    if (typeof ResizeObserver === 'undefined') {
      this.queueAutoSize(element.offsetHeight);
      this.requestFigureOffsetUpdate();
      return;
    }
    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height ?? element.offsetHeight;
      this.queueAutoSize(height);
      this.requestFigureOffsetUpdate();
    });
    this.resizeObserver.observe(element);

    this.figureObserver = new ResizeObserver(() => this.requestFigureOffsetUpdate());
    this.figureObserver.observe(this.inlineText.nativeElement);

    this.queueAutoSize(element.offsetHeight);
    this.requestFigureOffsetUpdate();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.figureObserver?.disconnect();
    this.figureObserver = null;
    this.observedFigures.clear();
    if (this.autosizeFrame != null) {
      cancelAnimationFrame(this.autosizeFrame);
    }
    this.autosizeFrame = null;
    if (this.offsetsFrame != null) {
      cancelAnimationFrame(this.offsetsFrame);
    }
    this.offsetsFrame = null;
    this.pendingHeight = 0;
    this.figureOffsets.clear();
    this.offsetsEffect.destroy();
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

  figureOffset(image: InlineImage): number {
    return this.figureOffsets.get(image.id) ?? 0;
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

  private requestFigureOffsetUpdate() {
    if (!this.viewReady) {
      return;
    }
    if (this.offsetsFrame != null) {
      return;
    }
    this.offsetsFrame = requestAnimationFrame(() => {
      this.offsetsFrame = null;
      this.observeCurrentFigures();
      this.updateFigureOffsets();
    });
  }

  private observeCurrentFigures() {
    if (!this.figureObserver) {
      return;
    }
    const root = this.inlineRoot.nativeElement;
    const nextObserved = new Set<HTMLElement>();
    root.querySelectorAll<HTMLElement>('figure.inline-figure').forEach(figure => {
      nextObserved.add(figure);
      if (!this.observedFigures.has(figure)) {
        this.figureObserver!.observe(figure);
      }
    });
    for (const figure of this.observedFigures) {
      if (!nextObserved.has(figure)) {
        this.figureObserver.unobserve(figure);
      }
    }
    this.observedFigures = nextObserved;
  }

  private updateFigureOffsets() {
    const textEl = this.inlineText?.nativeElement;
    const root = this.inlineRoot?.nativeElement;
    if (!textEl || !root) {
      return;
    }
    const textHeight = textEl.offsetHeight;
    if (!textHeight) {
      if (this.figureOffsets.size) {
        this.figureOffsets.clear();
        this.cdr.detectChanges();
      }
      return;
    }
    const images = this.block().images ?? [];
    const nextOffsets = new Map<string, number>();
    root.querySelectorAll<HTMLElement>('figure.inline-figure').forEach(figure => {
      const id = figure.dataset['imageId'];
      if (!id) {
        return;
      }
      const image = images.find(candidate => candidate.id === id);
      if (!image) {
        return;
      }
      const offset = this.calculateOffset(textHeight, figure.offsetHeight, image.placement);
      if (offset > 0) {
        nextOffsets.set(id, offset);
      }
    });
    if (this.areOffsetsEqual(this.figureOffsets, nextOffsets)) {
      return;
    }
    this.figureOffsets = nextOffsets;
    this.cdr.detectChanges();
  }

  private calculateOffset(textHeight: number, figureHeight: number, placement: InlinePlacement): number {
    if (!textHeight || !figureHeight) {
      return 0;
    }
    if (this.centerPlacements.has(placement)) {
      return Math.max(0, (textHeight - figureHeight) / 2);
    }
    return 0;
  }

  private areOffsetsEqual(current: Map<string, number>, next: Map<string, number>): boolean {
    if (current.size !== next.size) {
      return false;
    }
    for (const [key, value] of next) {
      if (current.get(key) !== value) {
        return false;
      }
    }
    return true;
  }

  private normalizeWhitespace(html: string): string {
    if (!html) {
      return '';
    }
    return html.replace(/\u00a0/g, ' ').replace(/&(nbsp|#160|#x0*a0);/gi, ' ');
  }
}
