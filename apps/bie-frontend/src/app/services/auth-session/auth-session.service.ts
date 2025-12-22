import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private refreshPromise: Promise<boolean> | null = null;
  private autoRefreshHandle: ReturnType<typeof globalThis.setTimeout> | null = null;
  private autoRefreshEnabled = false;
  private readonly autoRefreshIntervalMs = 10 * 60 * 1000;

  async withAuthRetry(requestFactory: () => Promise<Response>): Promise<Response> {
    const response = await requestFactory();
    if (!this.expiredCreds(response.status)) {
      return response;
    }
    const refreshed = await this.refreshSession();
    if (!refreshed) {
      return response;
    }
    const body = response.body as ReadableStream | null;
    body?.cancel?.();
    return requestFactory();
  }

  async refreshSession(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }
    if (!this.refreshPromise) {
      this.refreshPromise = this.executeRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  markSessionActive() {
    if (!this.isBrowser) {
      return;
    }
    this.autoRefreshEnabled = true;
    this.scheduleNextRefresh();
  }

  markSessionInactive() {
    if (!this.isBrowser) {
      return;
    }
    this.autoRefreshEnabled = false;
    if (this.autoRefreshHandle !== null) {
      globalThis.clearTimeout(this.autoRefreshHandle);
      this.autoRefreshHandle = null;
    }
  }

  private expiredCreds(status: number) {
    return this.isBrowser && status === 401;
  }

  private async executeRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.markSessionInactive();
        }
        return false;
      }
      this.autoRefreshEnabled = true;
      this.scheduleNextRefresh();
      return true;
    } catch (err) {
      console.warn('Failed to refresh session', err);
      return false;
    }
  }

  private scheduleNextRefresh() {
    if (!this.isBrowser || !this.autoRefreshEnabled) {
      return;
    }
    if (this.autoRefreshHandle !== null) {
      globalThis.clearTimeout(this.autoRefreshHandle);
    }
    this.autoRefreshHandle = globalThis.setTimeout(() => {
      void this.refreshSession();
    }, this.autoRefreshIntervalMs);
  }
}
