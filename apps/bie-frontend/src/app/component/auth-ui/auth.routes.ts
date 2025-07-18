import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth.layout';
import { AuthCardComponent } from './auth.card';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', loadComponent: () =>import('./login.form').then(m => m.LoginFormComponent) },
      { path: 'login', loadComponent: () => import('./login.form').then(m => m.LoginFormComponent) },
      { path: 'register', loadComponent: () => import('./register.form').then(m => m.RegisterFormComponent) },
    ],
  },
];