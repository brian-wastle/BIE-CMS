import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import type { RecipePage } from 'bie-models';
import type { PublishedRecipePageResolverResult } from '../../resolvers/published-recipe-page.resolver';

@Component({
  selector: 'app-published-recipe-page',
  imports: [DatePipe],
  templateUrl: './published-recipe-page.component.html',
  styleUrl: './published-recipe-page.component.scss',
})
export class PublishedRecipePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });

  readonly page = computed<RecipePage | null>(() => {
    const resolved = this.routeData()?.['publishedRecipePage'] as PublishedRecipePageResolverResult | undefined;
    return resolved?.page ?? null;
  });

  readonly error = computed<string | null>(() => {
    const resolved = this.routeData()?.['publishedRecipePage'] as PublishedRecipePageResolverResult | undefined;
    return resolved?.error ?? null;
  });

  constructor() {
    effect(() => {
      const p = this.page();
      if (p) {
        document.title = p.title;
      }
    });
  }
}
