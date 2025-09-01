// src/app/presentation/pages/login/login.page.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthServicePort, AUTH_SERVICE_PORT } from '../../../core/application';
import { GlobalStateService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  // Inyección moderna
  private authService = inject(AUTH_SERVICE_PORT);
  private router = inject(Router);
  private globalState = inject(GlobalStateService);

  // Usar signals del estado global
  isLoading = this.globalState.authLoading;
  errorMessage = this.globalState.authError;

  // Signals locales para el formulario
  credentials = signal({
    email: '',
    password: ''
  });

  // Computed signals
  canSubmit = computed(() => {
    const creds = this.credentials();
    return !this.isLoading() && creds.email.trim() !== '' && creds.password.trim() !== '';
  });

  async onSubmit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.globalState.setAuthLoading(true);
    this.globalState.clearAuthError();

    try {
      const creds = this.credentials();
      const result = await this.authService.login(creds.email, creds.password);

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

  updateEmail(email: string): void {
    this.credentials.update(creds => ({ ...creds, email }));
  }

  updatePassword(password: string): void {
    this.credentials.update(creds => ({ ...creds, password }));
  }
}
