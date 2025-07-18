import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}
  // Uses CanActivate interface to verify route guards before navigation is allowed, 
  // otherwise user is redirected to login page
  canActivate(): boolean | UrlTree {
    return this.auth.user()
      ? true // Allow navigation
      : this.router.parseUrl('/login');
  }
}
