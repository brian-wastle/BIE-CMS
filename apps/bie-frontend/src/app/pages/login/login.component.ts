import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrentUserService } from '../../services/current-user/current-user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly currentUser = inject(CurrentUserService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
      await this.currentUser.refresh();
      this.router.navigateByUrl('/author');
    } catch (e: any) {
      this.error.set(e.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}