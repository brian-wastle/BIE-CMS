import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthSessionService } from '../auth-session/auth-session.service';

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
  private readonly authSession = inject(AuthSessionService);
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
      const res = await this.authSession.withAuthRetry(() =>
        fetch('/api/auth/me', { credentials: 'include' })
      );
      if (!res.ok) {
        this._user.set(null);
        this.authSession.markSessionInactive();
        return;
      }
      const body = await res.json();
      const user = body.user ?? null;
      this._user.set(user);
      if (user) {
        this.authSession.markSessionActive();
      } else {
        this.authSession.markSessionInactive();
      }
    } catch {
      this._user.set(null);
      this.authSession.markSessionInactive();
    }
  }
}
