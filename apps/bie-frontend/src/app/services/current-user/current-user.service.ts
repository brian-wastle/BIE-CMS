import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CurrentUser {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _user = signal<CurrentUser | null | undefined>(undefined);

  readonly user = this._user.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      queueMicrotask(() => void this.refresh());
    } else {
      this._user.set(null);
    }
  }

  async refresh() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        this._user.set(null);
        return;
      }
      const body = await res.json();
      this._user.set(body.user ?? null);
    } catch {
      this._user.set(null);
    }
  }
}
