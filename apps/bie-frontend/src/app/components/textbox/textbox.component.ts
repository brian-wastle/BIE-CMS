// textbox.component.ts
import { Component, SecurityContext, computed, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock } from 'bie-models';
import { BlockShell, BLOCK_SHELL } from '../block-shell/block-shell';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-textbox',
  imports: [CommonModule],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextBoxComponent extends BlockShell<TextBlock> implements AfterViewInit, OnDestroy {
  @ViewChild('textboxRoot', { static: true }) textboxRoot!: ElementRef<HTMLElement>;
  private resizeObserver!: ResizeObserver;
  private pendingAutoSizeHeight = 0;
  private autoSizeFrame: number | null = null;

  private readonly hostShell = inject(BLOCK_SHELL, { skipSelf: true });
  private readonly sanitizer = inject(DomSanitizer);

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
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, raw);
    const html = sanitized && sanitized.length ? sanitized : '<p>Add some text…</p>';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textAlign = computed<'left' | 'center' | 'right'>(() => {
    const align = this.block().hAlign ?? 'flex-start';
    if (align === 'center') {
      return 'center';
    }
    if (align === 'flex-end') {
      return 'right';
    }
    return 'left';
  });

  ngAfterViewInit() {
    const element = this.textboxRoot.nativeElement;
    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      const height = entry.borderBoxSize?.[0]?.blockSize
        ?? entry.contentRect.height
        ?? element.offsetHeight;
      this.queueAutoSize(height);
    });
    this.resizeObserver.observe(element);
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
    if (this.autoSizeFrame != null) {
      cancelAnimationFrame(this.autoSizeFrame);
    }
    this.autoSizeFrame = null;
    this.pendingAutoSizeHeight = 0;
  }

  private queueAutoSize(height: number) {
    this.pendingAutoSizeHeight = height;
    if (this.autoSizeFrame != null) {
      return;
    }
    this.autoSizeFrame = requestAnimationFrame(() => {
      this.autoSizeFrame = null;
      this.flushAutoSize();
    });
  }

  private flushAutoSize() {
    if (!this.pendingAutoSizeHeight) {
      return;
    }
    this.hostShell.autoSize!(this.block().id, this.pendingAutoSizeHeight);
    this.pendingAutoSizeHeight = 0;
  }
}
