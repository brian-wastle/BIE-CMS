import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // SSG - static
  /*
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    // If a slug isn't in the list, fall back to SSR at request time
    fallback: PrerenderFallback.Server,
    // Runs at build; you can call your API/DB here
    getPrerenderParams: async () => {
      // Example: hit your Node API (or read from PostgreSQL/file/etc.)
      const res = await fetch('https://your-api.example.com/posts/slugs');
      const slugs: string[] = await res.json();
      return slugs.map(slug => ({ slug }));  // { slug: 'my-first-post' }
    },
  },
  */
  // CSR - client
  //{ path: 'playground', renderMode: RenderMode.Client },
  { path: '', renderMode: RenderMode.Client, headers: { 'X-Render-Mode': 'client' } },
  // SSR - server
  { path: '**', renderMode: RenderMode.Server },
];
