// apps/bie-frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authRoutes } from './component/auth-ui/auth.routes'
import { AuthGuard } from './service/canActivate/can-activate.service';

export const appRoutes: Routes = [
    // Auth Routes
    ...authRoutes,

    //CMS Routes
    { path: 'cms', canActivate: [AuthGuard], loadChildren: () => import('./cms.routes').then(m => m.cmsRoutes) },

    // Fallback
    { path: '**', redirectTo: '' },
];
