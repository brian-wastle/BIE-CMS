import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CurrentUserService } from '../services/current-user/current-user.service';

export const authGuard: CanActivateChildFn = async (route, state) => {
  if (route.data?.['requiresAuth'] === false) {
    return true;
  }

  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  let user = currentUserService.user();
  if (user === undefined) {
    await currentUserService.refresh();
    user = currentUserService.user();
  }

  if (user) {
    return true;
  }

  return router.parseUrl('/login');
};
