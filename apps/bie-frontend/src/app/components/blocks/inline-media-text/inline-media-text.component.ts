import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, SecurityContext, ViewChild, computed, inject } from '@angular/core';
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
  private resizeObserver: ResizeObserver | null = null;
  private pendingHeight = 0;
  private autosizeFrame: number | null = null;
  private viewReady = false;

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
      return;
    }
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
