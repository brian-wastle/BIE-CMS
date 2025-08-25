import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) return true;
  } catch {}
  router.navigateByUrl('/login');
  return false;
};
