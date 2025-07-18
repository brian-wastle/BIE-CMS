import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthInputComponent } from "./shared/auth-input.component";
import { AuthService } from "../../service/auth/auth.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  standalone : true,
  selector   : 'auth-register-form',
  imports    : [ReactiveFormsModule, RouterLink, AuthInputComponent],
  template   : `
    <form [formGroup]="form"
          (ngSubmit)="submit()"
          class="max-w-sm mx-auto p-8 rounded shadow">
      <h1 class="text-xl mb-6">Create account</h1>

      <auth-input label="Email"
                  [ctrl]="form.controls.email"></auth-input>
      <auth-input label="Password"
                  type="password"
                  [ctrl]="form.controls.password"></auth-input>

      <button type="submit"
              [disabled]="form.invalid"
              class="w-full py-2 bg-green-600 text-white rounded">
        Register
      </button>

      <p class="mt-4 text-center text-sm">
        Already have an account?
        <a routerLink="/login" class="text-blue-600">Sign in</a>
      </p>
    </form>
  `
})
export class RegisterFormComponent {
  private auth = inject(AuthService);
  form = new FormGroup({
    email   : new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value as any;
      this.auth.register(email, password);
    }
  }
}
