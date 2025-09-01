// src/app/presentation/pages/login/login.page.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthServicePort, AUTH_SERVICE_PORT } from '../../../core/application';
import { GlobalStateService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  // Inyección moderna
  private authService = inject(AUTH_SERVICE_PORT);
  private router = inject(Router);
  private globalState = inject(GlobalStateService);
  private fb = inject(FormBuilder);

  // Usar signals del estado global
  isLoading = this.globalState.authLoading;
  errorMessage = this.globalState.authError;

  // Formulario reactivo
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Computed signals
  canSubmit = computed(() => {
    return !this.isLoading() && this.loginForm.valid;
  });

  async onSubmit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.globalState.setAuthLoading(true);
    this.globalState.clearAuthError();

    try {
      const formValue = this.loginForm.value;
      const result = await this.authService.login(formValue.email, formValue.password);

      if (result.success && result.session) {
        this.globalState.setAuthSession(result.session);
        this.globalState.showSuccess('¡Inicio de sesión exitoso!');
        await this.router.navigate(['/home']);
      } else {
        this.globalState.setAuthError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      this.globalState.setAuthError('Error inesperado. Intente nuevamente.');
      console.error('Login error:', error);
    } finally {
      this.globalState.setAuthLoading(false);
    }
  }

  // Getters para facilitar el acceso a los controles en el template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
