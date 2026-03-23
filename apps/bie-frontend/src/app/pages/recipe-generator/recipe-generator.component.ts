import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BulletEditorComponent } from '../../components/bullet-editor/bullet-editor.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { RecipesService } from '../../services/recipes/recipes.service';
import { slugify } from '../canvas/canvas-utils';
import type { Recipe, RecipeHeroImage, RecipePage, RecipePageCreatePayload } from 'bie-models';

@Component({
  selector: 'app-recipe-generator',
  imports: [ReactiveFormsModule, BulletEditorComponent, MediaBrowserCarouselComponent, TitleCasePipe],
  templateUrl: './recipe-generator.component.html',
  styleUrl: './recipe-generator.component.scss',
})
export class RecipeGeneratorComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  title = signal<string>('');

  blurbControl = new FormControl<string>('', {
    nonNullable: true,
  });

  ingredients = signal<string[]>([]);
  instructions = signal<string[]>([]);
  notes = signal<string[]>([]);
  heroImageSrc = signal<string>('');
  heroAltControl = new FormControl<string>('', {
    nonNullable: true,
  });

  readonly slug = computed(() => slugify(this.title()));
  readonly savingRecipe = signal(false);
  readonly publishingRecipe = signal(false);
  readonly deletingRecipe = signal(false);
  readonly loadingRecipe = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly lastSavedAt = signal<string | null>(null);
  readonly lastSavedDisplay = computed(() => {
    const value = this.lastSavedAt();
    return value ? this.formatDate(value) : null;
  });
  readonly recipeMeta = signal<{
    id: string | null;
    slugRef: string | null;
    status: 'draft' | 'published';
  }>({
    id: null,
    slugRef: null,
    status: 'draft',
  });

  heroImage = computed<RecipeHeroImage | undefined>(() => {
    const src = this.heroImageSrc().trim();
    if (!src) {
      return undefined;
    }
    const alt = this.heroAltControl.value.trim();
    return {
      src,
      ...(alt ? { alt } : {}),
    };
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const slug = params.get('recipe')?.trim();
        if (!slug) {
          if (this.recipeMeta().slugRef) {
            this.resetRecipe();
          }
          return;
        }
        if (slug === this.recipeMeta().slugRef) {
          return;
        }
        void this.loadRecipe(slug);
      });
  }

  formatDate(value: string | null | undefined) {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  onHeroImageSelected(item: MediaItem) {
    const cdn = item.cdnUrl?.trim() ?? '';
    const storage = item.storagePath?.trim() ?? '';
    const nextSrc = cdn || storage;
    if (!nextSrc) {
      return;
    }
    this.heroImageSrc.set(nextSrc);
  }

  clearHeroImage() {
    this.heroImageSrc.set('');
    this.heroAltControl.setValue('');
  }

  private isBusy() {
    return this.savingRecipe() || this.publishingRecipe() || this.deletingRecipe() || this.loadingRecipe();
  }

  private buildRecipePayload(status: 'draft' | 'published'): { base: RecipePageCreatePayload; title: string; slug: string } | null {
    const title = this.title().trim();
    const slug = this.slug().trim();
    if (!title) {
      this.saveError.set('Add a title before saving.');
      return null;
    }
    if (!slug) {
      this.saveError.set('Title must contain at least one letter or number.');
      return null;
    }
    if (!this.ingredients().length || !this.instructions().length) {
      this.saveError.set('Add ingredients and instructions before saving.');
      return null;
    }
    const heroImage = this.heroImage();
    const recipe: Recipe = {
      title,
      blurb: this.blurbControl.value,
      ingredients: this.ingredients(),
      instructions: this.instructions(),
      notes: this.notes(),
      ...(heroImage ? { heroImage } : {}),
    };
    const base: RecipePageCreatePayload = {
      slug,
      title,
      status,
      recipe,
      publishedAt: status === 'published' ? new Date().toISOString() : null,
    };
    return { base, title, slug };
  }

  async saveRecipe() {
    if (this.isBusy()) return;
    const payload = this.buildRecipePayload('draft');
    if (!payload) return;

    this.savingRecipe.set(true);
    this.saveError.set(null);
    try {
      const meta = this.recipeMeta();
      const ref = meta.slugRef ?? meta.id;
      const page = ref
        ? await this.recipesService.update(ref, { ...payload.base, slug: payload.slug })
        : await this.recipesService.post(payload.base);
      this.applySavedRecipe(page);
    } catch (err) {
      console.error('Failed to save recipe', err);
      this.saveError.set((err as Error)?.message || 'Failed to save recipe.');
    } finally {
      this.savingRecipe.set(false);
    }
  }

  async publishRecipe() {
    if (this.isBusy()) return;
    const payload = this.buildRecipePayload('published');
    if (!payload) return;

    this.publishingRecipe.set(true);
    this.saveError.set(null);
    try {
      const meta = this.recipeMeta();
      const ref = meta.slugRef ?? meta.id;
      const page = ref
        ? await this.recipesService.update(ref, { ...payload.base, slug: payload.slug })
        : await this.recipesService.post(payload.base);
      this.applySavedRecipe(page);
    } catch (err) {
      console.error('Failed to publish recipe', err);
      this.saveError.set((err as Error)?.message || 'Failed to publish recipe.');
    } finally {
      this.publishingRecipe.set(false);
    }
  }

  async deleteRecipe() {
    if (this.savingRecipe() || this.deletingRecipe() || this.loadingRecipe()) {
      return;
    }
    const meta = this.recipeMeta();
    const ref = meta.slugRef ?? meta.id ?? null;
    if (!ref) {
      return;
    }
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Delete this recipe? This cannot be undone.');
      if (!confirmed) {
        return;
      }
    }
    this.deletingRecipe.set(true);
    this.saveError.set(null);
    try {
      await this.recipesService.delete(ref);
      await this.router.navigate([], { queryParams: { recipe: null }, queryParamsHandling: 'merge' });
      this.resetRecipe();
    } catch (err) {
      console.error('Failed to delete recipe', err);
      const message = (err as Error)?.message || 'Failed to delete recipe.';
      this.saveError.set(message);
    } finally {
      this.deletingRecipe.set(false);
    }
  }

  private async loadRecipe(slug: string) {
    this.loadingRecipe.set(true);
    this.loadError.set(null);
    try {
      const page = await this.recipesService.get(slug);
      this.applySavedRecipe(page);
    } catch (err) {
      console.error('Failed to load recipe', err);
      const message = (err as Error)?.message || 'Unable to load the selected recipe.';
      this.loadError.set(message);
      this.resetRecipe();
    } finally {
      this.loadingRecipe.set(false);
    }
  }

  private applySavedRecipe(page: RecipePage) {
    this.recipeMeta.set({
      id: page.id ?? null,
      slugRef: page.slug ?? null,
      status: page.status ?? 'draft',
    });
    this.title.set(page.title ?? page.recipe?.title ?? '');
    this.blurbControl.setValue(page.recipe?.blurb ?? '');
    this.ingredients.set(Array.isArray(page.recipe?.ingredients) ? page.recipe.ingredients : []);
    this.instructions.set(Array.isArray(page.recipe?.instructions) ? page.recipe.instructions : []);
    this.notes.set(Array.isArray(page.recipe?.notes) ? page.recipe.notes : []);
    this.heroImageSrc.set(page.recipe?.heroImage?.src ?? '');
    this.heroAltControl.setValue(page.recipe?.heroImage?.alt ?? '');
    this.lastSavedAt.set(page.updatedAt ?? page.createdAt ?? null);
    this.saveError.set(null);
    this.loadError.set(null);
    void this.router.navigate([], { queryParams: { recipe: page.slug }, queryParamsHandling: 'merge' });
  }

  private resetRecipe() {
    this.recipeMeta.set({ id: null, slugRef: null, status: 'draft' });
    this.title.set('');
    this.blurbControl.setValue('');
    this.ingredients.set([]);
    this.instructions.set([]);
    this.notes.set([]);
    this.heroImageSrc.set('');
    this.heroAltControl.setValue('');
    this.lastSavedAt.set(null);
    this.saveError.set(null);
    this.loadError.set(null);
  }
}
