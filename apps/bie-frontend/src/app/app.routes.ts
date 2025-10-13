import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'author', canActivate: [authGuard], loadComponent: () => import('./pages/canvas/canvas.component').then(m => m.CanvasComponent) },
  { path: 'upload', canActivate: [authGuard], loadComponent: () => import('./pages/media-upload/media-upload.component').then(m => m.MediaUploadComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./pages/canvas/canvas.component').then(m => m.CanvasComponent) },
  //{ path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  //{ path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
