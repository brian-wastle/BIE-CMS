import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'author', canActivate: [authGuard], loadComponent: () => import('./pages/canvas/canvas.component').then(m => m.CanvasComponent), data: { pageTitle: 'Canvas' } },
  { path: 'upload', canActivate: [authGuard], loadComponent: () => import('./pages/media-upload/media-upload.component').then(m => m.MediaUploadComponent), data: { pageTitle: 'Media Browser' } },
  { path: 'drafts', canActivate: [authGuard], loadComponent: () => import('./pages/draft-manager/draft-manager.component').then(m => m.DraftManagerComponent), data: { pageTitle: 'Draft Manager' } },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), data: { pageTitle: 'Sign In' } },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./pages/canvas/canvas.component').then(m => m.CanvasComponent), data: { pageTitle: 'Canvas' } },
  //{ path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  //{ path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
