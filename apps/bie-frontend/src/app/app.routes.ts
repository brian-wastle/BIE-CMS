import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/canvas/canvas.component').then(m => m.CanvasComponent) },
  //{ path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  //{ path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
