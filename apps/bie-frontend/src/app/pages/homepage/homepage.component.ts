import { Component, inject, signal, computed, TrackByFunction } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DOCUMENT } from '@angular/common';
import type { PageSummary } from 'bie-models';
import { PagesService, PageListCursor, PageListParams } from '../../services/pages/pages.service';
import { MatIconModule } from '@angular/material/icon';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import type { PageMeta } from 'bie-models';

const homeMeta: PageMeta = {
  seoTitle: 'Brian Wastle dot net | Completed Side Quests',
  description: 'Fulltime dev and hobbyist solderer, I write articles about my side projects. Homemade server and CMS.',
  keywords: ['brian wastle', 'brian wastle developer', 'web developer portfolio', 'brian wastle cms', 'bie cms', 'self hosted',
    'infrastructure engineer', 'modern cms consulting', 'dev tutorials', 'brian wastle dev', 'web dev portfolio'],
  canonicalUrl: 'https://brianwastle.com',
  robots: 'index,follow',
  author: 'Brian Wastle',
  ogTitle: 'Brian Wastle dot net | Completed Side Quests',
  ogDescription: 'Fulltime dev and hobbyist solderer, I write articles about my side projects. Homemade server and CMS.',
  ogUrl: 'https://brianwastle.net',
  ogType: 'profile',
  twitterCard: 'summary',
  twitterTitle: 'Brian Wastle dot net | Completed Side Quests',
  twitterDescription: 'Fulltime dev and hobbyist solderer, articles about my side projects.',
  jsonLd: {
    '@context': 'https://schema.org',
    "@type": ["WebPage", "CollectionPage"],
    "name": "Brian Wastle — Completed Side Quests",
    "url": "https://brianwastle.net",
    "description": "Fulltime dev and hobbyist solderer…",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Brian Wastle dot net",
      "url": "https://brianwastle.net"
    },
    "author": {
      "@type": "Person",
      "name": "Brian Wastle"
    }
  }
};

@Component({
  selector: 'app-homepage',
  imports: [DatePipe, RouterLink, MatIconModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  private readonly metaService = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly pagesService = inject(PagesService);
  private readonly pageSize = 10;
  private cursorRef: PageListCursor | null | undefined = undefined;
  private pendingPages: PageSummary[] = [];
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageCache = signal<PageSummary[][]>([]);
  readonly currentPageIndex = signal(0);
  readonly hasMoreData = signal(true);
  private readonly pendingPageCount = signal(0);

  readonly displayedPages = computed(() => this.pageCache()[this.currentPageIndex()] ?? []);
  readonly loadedPages = computed(() => this.pageCache().length);
  readonly currentPageDisplay = computed(() => (this.loadedPages() ? this.currentPageIndex() + 1 : 0));
  readonly hasPrevPage = computed(() => this.currentPageIndex() > 0);
  readonly hasNextPage = computed(() => {
    if (!this.loadedPages()) {
      return false;
    }
    if (this.currentPageIndex() + 1 < this.loadedPages()) {
      return true;
    }
    return this.pendingPageCount() > 0 || this.hasMoreData();
  });

  constructor() {
    this.applyHomeMeta(homeMeta);
    void this.loadFirstPage();
  }

  async refresh() {
    if (this.loading()) {
      return;
    }
    await this.loadFirstPage();
  }

  async nextPage() {
    if (this.currentPageIndex() + 1 < this.loadedPages()) {
      this.currentPageIndex.update((idx) => idx + 1);
      return;
    }
    if (!this.hasNextPage() || this.loading()) {
      return;
    }
    await this.fetchPageAtIndex(this.loadedPages());
  }

  prevPage() {
    if (!this.hasPrevPage() || this.loading()) {
      return;
    }
    this.currentPageIndex.update((idx) => Math.max(0, idx - 1));
  }

  trackByPage: TrackByFunction<PageSummary> = (_index, summary) => summary.page.id;

  private async loadFirstPage() {
    this.resetPagination();
    await this.fetchPageAtIndex(0);
  }

  private resetPagination() {
    this.pageCache.set([]);
    this.currentPageIndex.set(0);
    this.cursorRef = undefined;
    this.pendingPages = [];
    this.pendingPageCount.set(0);
    this.hasMoreData.set(true);
    this.error.set(null);
  }

  private async fetchPageAtIndex(targetIndex: number) {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.nextAvailablePage(targetIndex);
      const available = this.loadedPages();
      if (!available) {
        this.currentPageIndex.set(0);
        return;
      }
      const bounded = Math.min(targetIndex, available - 1);
      this.currentPageIndex.set(Math.max(0, bounded));
    } catch (err) {
      console.error('Failed to load pages', err);
      const message = (err as Error)?.message ?? 'Unable to load pages at this time.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private async nextAvailablePage(targetIndex: number): Promise<void> {
    const guardLimit = 50;
    let guard = 0;
    while (this.pageCache().length <= targetIndex && guard < guardLimit) {
      guard += 1;
      if (this.pendingPages.length >= this.pageSize) {
        this.addPageFromPending();
        continue;
      }
      if (this.cursorRef === null) {
        if (this.pendingPages.length) {
          this.addPageFromPending(true);
        }
        break;
      }
      const chunk = await this.fetchNextChunk();
      if (!chunk.length && this.cursorRef === null && !this.pendingPages.length) {
        break;
      }
      if (chunk.length) {
        this.pendingPages.push(...chunk);
        this.pendingPageCount.set(this.pendingPages.length);
      }
    }
  }

  private addPageFromPending(includeRemainder = false) {
    const takeCount = includeRemainder ? this.pendingPages.length : Math.min(this.pendingPages.length, this.pageSize);
    if (!takeCount) {
      return;
    }
    const page = this.pendingPages.splice(0, takeCount);
    this.pendingPageCount.set(this.pendingPages.length);
    this.pageCache.update((pages) => [...pages, page]);
  }

  // Fetch next group of published pages by cursor
  private async fetchNextChunk(): Promise<PageSummary[]> {
    const params: PageListParams = { limit: this.pageSize };
    if (this.cursorRef && this.cursorRef.cursorUpdatedAt && this.cursorRef.cursorId) {
      params.cursorUpdatedAt = this.cursorRef.cursorUpdatedAt;
      params.cursorId = this.cursorRef.cursorId;
    }
    const response = await this.pagesService.listPublished(params);
    this.cursorRef = response.nextCursor ?? null;
    this.hasMoreData.set(Boolean(response.nextCursor));
    return response.pages;
  }

  private applyHomeMeta(meta: PageMeta) {
    if (meta.seoTitle) {
      this.titleService.setTitle(meta.seoTitle);
    }

    const definitions: Array<[string, MetaDefinition]> = [];
    const push = (selector: string, definition: MetaDefinition | null | undefined) => {
      if (definition?.content) {
        definitions.push([selector, definition]);
      }
    };

    push('name="description"', meta.description ? { name: 'description', content: meta.description } : null);
    push('name="keywords"', meta.keywords?.length ? { name: 'keywords', content: meta.keywords.join(', ') } : null);
    push('name="robots"', meta.robots ? { name: 'robots', content: meta.robots } : null);
    push('name="author"', meta.author ? { name: 'author', content: meta.author } : null);
    push('property="og:title"', meta.ogTitle ? { property: 'og:title', content: meta.ogTitle } : null);
    push('property="og:description"', meta.ogDescription ? { property: 'og:description', content: meta.ogDescription } : null);
    push('property="og:url"', meta.ogUrl ? { property: 'og:url', content: meta.ogUrl } : null);
    push('property="og:type"', meta.ogType ? { property: 'og:type', content: meta.ogType } : null);
    push('name="twitter:card"', meta.twitterCard ? { name: 'twitter:card', content: meta.twitterCard } : null);
    push('name="twitter:title"', meta.twitterTitle ? { name: 'twitter:title', content: meta.twitterTitle } : null);
    push('name="twitter:description"', meta.twitterDescription ? { name: 'twitter:description', content: meta.twitterDescription } : null);

    definitions.forEach(([selector, definition]) => this.metaService.updateTag(definition, selector));

    if (meta.canonicalUrl) {
      this.upsertCanonicalLink(meta.canonicalUrl);
    }

    this.syncJsonLd(meta.jsonLd);
  }

  private upsertCanonicalLink(url: string) {
    const doc = this.document;
    if (!doc?.head) {
      return;
    }
    let canonicalLink = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = doc.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      doc.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
  }

  private syncJsonLd(data: PageMeta['jsonLd']) {
    const doc = this.document;
    if (!doc?.head) {
      return;
    }
    const selector = 'script[data-homepage-jsonld="true"]';
    let script = doc.head.querySelector<HTMLScriptElement>(selector);
    if (!data) {
      script?.remove();
      return;
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (!script) {
      script = doc.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-homepage-jsonld', 'true');
      doc.head.appendChild(script);
    }
    script.textContent = payload;
  }
}
