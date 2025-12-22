
import { Component, OnDestroy, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoBlock } from 'bie-models';
import { extractYoutubeId } from '../../../utils/youtube';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-videobox',
  imports: [],
  templateUrl: './videobox.component.html',
  styleUrls: ['./videobox.component.scss'],
})
export class VideoBoxComponent extends BlockShell<VideoBlock> implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  readonly hasVideo = computed(() => Boolean(this.resolveVideoId()));
  private readonly aspectRatio = 16 / 9;
  private readonly embedBounds = signal<{ width: number; height: number }>({ width: 0, height: 0 });
  private resizeObserver: ResizeObserver | null = null;
  private videoFrameEl: HTMLElement | null = null;

  readonly embedWidth = computed(() => {
    const { width } = this.embedBounds();
    return width > 0 ? width : null;
  });

  readonly embedHeight = computed(() => {
    const { height } = this.embedBounds();
    return height > 0 ? height : null;
  });

  @ViewChild('videoFrame') set videoFrameRef(ref: ElementRef<HTMLDivElement> | undefined) {
    const nextEl = ref?.nativeElement ?? null;
    if (nextEl === this.videoFrameEl) {
      return;
    }
    this.stopObserving();
    this.videoFrameEl = nextEl;
    if (nextEl) {
      this.startObserving(nextEl);
    } else {
      this.embedBounds.set({ width: 0, height: 0 });
    }
  }

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const videoId = this.resolveVideoId();
    if (!videoId) {
      return null;
    }
    const url = `https://www.youtube.com/embed/${videoId}?rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  readonly caption = computed(() => (this.block().caption ?? '').trim());

  ngOnDestroy(): void {
    this.stopObserving();
  }

  private resolveVideoId(): string {
    const stored = (this.block().videoId ?? '').trim();
    if (stored) {
      return stored;
    }
    return extractYoutubeId(this.block().videoUrl ?? '');
  }

  private startObserving(element: HTMLElement) {
    if (typeof ResizeObserver === 'undefined') {
      this.embedBounds.set(this.computeEmbedSize(element.getBoundingClientRect()));
      return;
    }
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === element) {
          this.embedBounds.set(this.computeEmbedSize(entry.contentRect));
        }
      }
    });
    this.resizeObserver.observe(element);
    this.embedBounds.set(this.computeEmbedSize(element.getBoundingClientRect()));
  }

  private stopObserving() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.videoFrameEl = null;
  }

  private computeEmbedSize(rect: DOMRectReadOnly | DOMRect): { width: number; height: number } {
    const width = Math.max(0, rect.width);
    const height = Math.max(0, rect.height);
    if (!width || !height) {
      return { width: 0, height: 0 };
    }
    const widthLimitedHeight = width / this.aspectRatio;
    if (widthLimitedHeight <= height) {
      return { width, height: widthLimitedHeight };
    }
    const heightLimitedWidth = height * this.aspectRatio;
    return { width: heightLimitedWidth, height };
  }
}
