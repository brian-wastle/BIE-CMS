import { inject, Injectable, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  user = signal<{ email: string } | null>(null);

  register(email: string, password: string): void {
    this.http.post('/api/auth/register', { email, password }, { withCredentials: true })
      .subscribe({
        next : () => this.reloadProfile(() => this.router.navigateByUrl('/')),
        error: err => console.error('register failed', err)
      });
  }

  login(email: string, password: string): void {
    this.http.post('/api/auth/login', { email, password }, { withCredentials: true })
      .subscribe({
        next : () => this.reloadProfile(() => this.router.navigateByUrl('/')),
        error: err => { console.error('login failed', err); this.user.set(null); }
      });
  }

  private reloadProfile(cb?: () => void): void {
    this.http.get<{ email: string }>('/api/auth/me', { withCredentials: true })
      .subscribe({
        next : me  => { this.user.set(me);  cb?.(); },
        error: ()  => { this.user.set(null); cb?.(); }
      });
  }

}
