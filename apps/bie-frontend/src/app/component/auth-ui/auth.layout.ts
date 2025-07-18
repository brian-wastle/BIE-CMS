import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  standalone : true,
  selector   : 'auth-layout',
  imports    : [RouterOutlet],
  template   : `
    <main class="min-h-screen grid place-items-center bg-slate-50">
      <section class="w-full max-w-md">
        <router-outlet></router-outlet>
      </section>
    </main>
  `
})
export class AuthLayoutComponent {}
