import { Routes } from '@angular/router';
import { authRoutes } from './component/auth-ui/auth.routes';

export const serverRoutes: Routes = [
  ...authRoutes,                   // reuse
  { path: '**', redirectTo: '' }
];