import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthServicePort } from '../../core/application/ports/auth.service.port';
import { LoginUseCase } from '../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../core/application/use-cases/auth/logout.use-case';
import { AuthSession } from '../../core/domain/entities/auth-session.entity';
import { GlobalStateService } from '../../shared/services/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthServicePort {
  private globalState = inject(GlobalStateService);

  // Usar signals y observables del GlobalStateService
  public isAuthenticated = this.globalState.isAuthenticated;
  public authState$ = this.globalState.authState$;

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {
    console.log('AuthService - constructor: Starting...');
    // El GlobalStateService ya maneja la carga desde localStorage
    console.log('AuthService - constructor: Completed');
  }

  async login(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    this.globalState.setAuthLoading(true);
    this.globalState.clearAuthError();

    try {
      const result = await this.loginUseCase.execute({ email, password });

      if (result.success && result.session) {
        this.globalState.setAuthSession(result.session);
        // El GlobalStateService maneja automáticamente el guardado en localStorage
        console.log('AuthService - login: Session set successfully');
      } else {
        this.globalState.setAuthError(result.error || 'Error al iniciar sesión');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Error inesperado durante el login';
      this.globalState.setAuthError(errorMessage);
      console.error('AuthService - login error:', error);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      this.globalState.setAuthLoading(false);
    }
  }

  async logout(userId: string): Promise<{ success: boolean; error?: string }> {
    console.log('AuthService - logout: Starting logout for userId:', userId);
    this.globalState.setAuthLoading(true);

    try {
      const result = await this.logoutUseCase.execute({ userId });
      console.log('AuthService - logout: Use case result:', result);

      if (result.success) {
        console.log('AuthService - logout: Clearing session and storage...');
        this.globalState.logout();
        console.log('AuthService - logout: Logout completed successfully');
      } else {
        this.globalState.setAuthError(result.error || 'Error al cerrar sesión');
        console.error('AuthService - logout: Logout failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Error inesperado durante el logout';
      this.globalState.setAuthError(errorMessage);
      console.error('AuthService - logout error:', error);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      this.globalState.setAuthLoading(false);
    }
  }

  getCurrentSession(): AuthSession | null {
    console.log('AuthService - getCurrentSession: Getting current session...');
    console.log(this.globalState.getCurrentSession());
    return this.globalState.getCurrentSession();
  }

  isAuthenticatedValue(): boolean {
    return this.isAuthenticated();
  }

  async refreshToken(): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    // Implementación básica - en un caso real usarías el refreshToken
    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      return {
        success: false,
        error: 'No hay sesión activa'
      };
    }

    // Verificar si la sesión sigue siendo válida
    if (!currentSession.isValid()) {
      this.globalState.logout();
      return {
        success: false,
        error: 'La sesión ha expirado'
      };
    }

    return {
      success: true,
      session: currentSession
    };
  }

  // Método público para obtener el observable del estado de autenticación
  getAuthState(): Observable<boolean> {
    return this.authState$;
  }

  // Método público para forzar la verificación del estado
  checkAuthState(): void {
    console.log('AuthService - checkAuthState: Forced check...');
    this.globalState.checkAuthState();
  }
}
