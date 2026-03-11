import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BulletEditorComponent } from '../../components/bullet-editor/bullet-editor.component';
import { MediaBrowserCarouselComponent } from '../../components/media-browser-carousel/media-browser-carousel.component';
import type { MediaItem } from '../../services/media-library/media-library.service';
import { RecipesService } from '../../services/recipes/recipes.service';
import { slugify } from '../canvas/canvas-utils';
import type { Recipe, RecipeHeroImage, RecipePage, RecipePageCreatePayload, RecipePageUpdatePayload } from 'bie-models';

@Component({
  selector: 'app-recipe-generator',
  imports: [ReactiveFormsModule, BulletEditorComponent, MediaBrowserCarouselComponent, JsonPipe, TitleCasePipe],
  templateUrl: './recipe-generator.component.html',
  styleUrl: './recipe-generator.component.scss',
})
export class RecipeGeneratorComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  titleControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(42)],
  });

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

  readonly slug = computed(() => slugify(this.titleControl.value));
  readonly savingRecipe = signal(false);
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

  async saveRecipe() {
    if (this.savingRecipe() || this.deletingRecipe() || this.loadingRecipe()) {
      return;
    }
    const title = this.titleControl.value.trim();
    const slug = this.slug().trim();
    if (!title || !slug) {
      this.saveError.set('Add a title before saving.');
      return;
    }
    if (!this.ingredients().length || !this.instructions().length) {
      this.saveError.set('Add ingredients and instructions before saving.');
      return;
    }

    this.savingRecipe.set(true);
    this.saveError.set(null);
    try {
      const heroImage = this.heroImage();
      const recipe: Recipe = {
        title,
        blurb: this.blurbControl.value,
        ingredients: this.ingredients(),
        instructions: this.instructions(),
        notes: this.notes(),
        ...(heroImage ? { heroImage } : {}),
      };

      let page: RecipePage;
      const basePayload: RecipePageCreatePayload = {
        slug,
        title,
        status: 'draft',
        recipe,
        publishedAt: null,
      };
      const meta = this.recipeMeta();
      if (meta.slugRef || meta.id) {
        const ref = meta.slugRef ?? meta.id ?? slug;
        const updatePayload: RecipePageUpdatePayload = { ...basePayload, slug };
        page = await this.recipesService.update(ref, updatePayload);
      } else {
        page = await this.recipesService.post(basePayload);
      }
      this.applySavedRecipe(page);
    } catch (err) {
      console.error('Failed to save recipe', err);
      const message = (err as Error)?.message || 'Failed to save recipe.';
      this.saveError.set(message);
    } finally {
      this.savingRecipe.set(false);
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
    this.titleControl.setValue(page.title ?? page.recipe?.title ?? '');
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
    this.titleControl.setValue('');
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
