import { inject, RESPONSE_INIT } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Page } from 'bie-models';

import { PagesService } from '../services/pages/pages.service';

export interface PublishedPageResolverResult {
  slug: string;
  page: Page | null;
  error: string | null;
}

export const publishedPageResolver: ResolveFn<PublishedPageResolverResult> = async (route) => {
  const slug = route.paramMap.get('slug')?.trim() ?? '';
  const responseInit = inject(RESPONSE_INIT, { optional: true });

  if (!slug) {
    if (responseInit) {
      responseInit.status = 400;
    }
    return { slug, page: null, error: 'Missing slug.' };
  }

  const pagesService = inject(PagesService);

  try {
    const page = await pagesService.getPublished(slug);
    return { slug, page, error: null };
  } catch (err) {
    const message = (err as Error)?.message ?? 'Unable to load this page.';
    if (responseInit) {
      responseInit.status = message === 'Published page not found.' ? 404 : 500;
    }
    return { slug, page: null, error: message };
  }
};
