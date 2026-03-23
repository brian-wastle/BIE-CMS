import { Component, inject, signal, computed, TrackByFunction } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import type { RecipePageSummary } from 'bie-models';
import { RecipesService, RecipeListCursor, RecipeListParams } from '../../services/recipes/recipes.service';

@Component({
  selector: 'app-cookbook',
  imports: [DatePipe, RouterLink],
  templateUrl: './cookbook.component.html',
  styleUrl: './cookbook.component.scss',
})
export class CookbookComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly pageSize = 10;
  private cursorRef: RecipeListCursor | null | undefined = undefined;
  private pendingPages: RecipePageSummary[] = [];

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageCache = signal<RecipePageSummary[][]>([]);
  readonly currentPageIndex = signal(0);
  readonly hasMoreData = signal(true);
  private readonly pendingPageCount = signal(0);

  readonly displayedPages = computed(() => this.pageCache()[this.currentPageIndex()] ?? []);
  readonly loadedPages = computed(() => this.pageCache().length);
  readonly currentPageDisplay = computed(() => (this.loadedPages() ? this.currentPageIndex() + 1 : 0));
  readonly hasPrevPage = computed(() => this.currentPageIndex() > 0);
  readonly hasNextPage = computed(() => {
    if (!this.loadedPages()) return false;
    if (this.currentPageIndex() + 1 < this.loadedPages()) return true;
    return this.pendingPageCount() > 0 || this.hasMoreData();
  });

  constructor() {
    void this.loadFirstPage();
  }

  async refresh() {
    if (this.loading()) return;
    await this.loadFirstPage();
  }

  async nextPage() {
    if (this.currentPageIndex() + 1 < this.loadedPages()) {
      this.currentPageIndex.update((idx) => idx + 1);
      return;
    }
    if (!this.hasNextPage() || this.loading()) return;
    await this.fetchPageAtIndex(this.loadedPages());
  }

  prevPage() {
    if (!this.hasPrevPage() || this.loading()) return;
    this.currentPageIndex.update((idx) => Math.max(0, idx - 1));
  }

  trackByRecipe: TrackByFunction<RecipePageSummary> = (_index, summary) => summary.page.id;

  private async loadFirstPage() {
    this.pageCache.set([]);
    this.currentPageIndex.set(0);
    this.cursorRef = undefined;
    this.pendingPages = [];
    this.pendingPageCount.set(0);
    this.hasMoreData.set(true);
    this.error.set(null);
    await this.fetchPageAtIndex(0);
  }

  private async fetchPageAtIndex(targetIndex: number) {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const guardLimit = 50;
      let guard = 0;
      while (this.pageCache().length <= targetIndex && guard < guardLimit) {
        guard += 1;
        if (this.pendingPages.length >= this.pageSize) {
          this.addPageFromPending();
          continue;
        }
        if (this.cursorRef === null) {
          if (this.pendingPages.length) this.addPageFromPending(true);
          break;
        }
        const chunk = await this.fetchNextChunk();
        if (!chunk.length && this.cursorRef === null && !this.pendingPages.length) break;
        if (chunk.length) {
          this.pendingPages.push(...chunk);
          this.pendingPageCount.set(this.pendingPages.length);
        }
      }
      const available = this.loadedPages();
      if (!available) {
        this.currentPageIndex.set(0);
        return;
      }
      this.currentPageIndex.set(Math.max(0, Math.min(targetIndex, available - 1)));
    } catch (err) {
      console.error('Failed to load recipes', err);
      this.error.set((err as Error)?.message ?? 'Unable to load recipes at this time.');
    } finally {
      this.loading.set(false);
    }
  }

  private addPageFromPending(includeRemainder = false) {
    const takeCount = includeRemainder ? this.pendingPages.length : Math.min(this.pendingPages.length, this.pageSize);
    if (!takeCount) return;
    const page = this.pendingPages.splice(0, takeCount);
    this.pendingPageCount.set(this.pendingPages.length);
    this.pageCache.update((pages) => [...pages, page]);
  }

  private async fetchNextChunk(): Promise<RecipePageSummary[]> {
    const params: RecipeListParams = { limit: this.pageSize };
    if (this.cursorRef?.cursorUpdatedAt && this.cursorRef?.cursorId) {
      params.cursorUpdatedAt = this.cursorRef.cursorUpdatedAt;
      params.cursorId = this.cursorRef.cursorId;
    }
    const response = await this.recipesService.listPublished(params);
    this.cursorRef = response.nextCursor ?? null;
    this.hasMoreData.set(Boolean(response.nextCursor));
    return response.pages;
  }
}
