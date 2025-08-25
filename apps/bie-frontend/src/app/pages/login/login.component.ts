import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private router: Router) {}

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
      this.router.navigateByUrl('/author');
    } catch (e: any) {
      this.error.set(e.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}