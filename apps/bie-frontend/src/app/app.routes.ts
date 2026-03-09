import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { PublicShellComponent } from './pages/public-shell/public-shell.component';
import { CmsShellComponent } from './components/cms-shell/cms-shell.component';
import { PublishedPageComponent } from './pages/published-page/published-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { publishedPageResolver } from './resolvers/published-page.resolver';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomepageComponent },
      { path: 'blog/:slug', component: PublishedPageComponent, resolve: { publishedPage: publishedPageResolver } },
    ],
  },
  {
    path: '',
    component: CmsShellComponent,
    canActivateChild: [authGuard],
    children: [
      { path: 'author', data: { pageTitle: 'Canvas Editor' }, loadComponent: () => import('./pages/canvas/canvas.component').then(m => m.CanvasComponent)},
      { path: 'upload', data: { pageTitle: 'Media Browser' }, loadComponent: () => import('./pages/media-upload/media-upload.component').then(m => m.MediaUploadComponent)},
      { path: 'recipe', data: { pageTitle: 'Recipe Generator' }, loadComponent: () => import('./pages/recipe-generator/recipe-generator.component').then(m => m.RecipeGeneratorComponent)},
      { path: 'drafts', data: { pageTitle: 'Draft Manager' }, loadComponent: () => import('./pages/draft-manager/draft-manager.component').then(m => m.DraftManagerComponent)},
      { path: 'login', data: { pageTitle: 'Sign In', requiresAuth: false }, loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)},
    ],
  },
  
  { path: '**', component: ErrorPageComponent },
];
