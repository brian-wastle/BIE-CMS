import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // SSG - static
// TODO: Add programmatically generated slugs routes
  // CSR - client
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'author', renderMode: RenderMode.Client },
  // SSR - server
  { path: '**', renderMode: RenderMode.Server },
];
