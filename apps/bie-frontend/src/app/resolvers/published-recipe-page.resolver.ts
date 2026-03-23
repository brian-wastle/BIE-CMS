import { inject, RESPONSE_INIT } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RecipePage } from 'bie-models';
import { RecipesService } from '../services/recipes/recipes.service';

export interface PublishedRecipePageResolverResult {
  slug: string;
  page: RecipePage | null;
  error: string | null;
}

export const publishedRecipePageResolver: ResolveFn<PublishedRecipePageResolverResult> = async (route) => {
  const slug = route.paramMap.get('slug')?.trim() ?? '';
  const responseInit = inject(RESPONSE_INIT, { optional: true });

  if (!slug) {
    if (responseInit) {
      responseInit.status = 400;
    }
    return { slug, page: null, error: 'Missing slug.' };
  }

  const recipesService = inject(RecipesService);

  try {
    const page = await recipesService.getPublished(slug);
    return { slug, page, error: null };
  } catch (err) {
    const message = (err as Error)?.message ?? 'Unable to load this recipe.';
    if (responseInit) {
      responseInit.status = message === 'Published recipe not found.' ? 404 : 500;
    }
    return { slug, page: null, error: message };
  }
};
