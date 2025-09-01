import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { AuthRepository } from '../../core/domain/repositories/auth.repository';
import { AuthSession } from '../../core/domain/entities/auth-session.entity';
import { Email } from '../../core/domain/value-objects/email.vo';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { API_CONFIG, ApiResponse, LoginRequest, LoginResponse } from '../config/api.config';
import { TokenService } from '../services/token.service';

interface MockUser {
  id: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl implements AuthRepository {
  private mockUsers: MockUser[] = [
    { id: '1', email: 'admin@example.com', password: 'admin123' },
    { id: '2', email: 'user@example.com', password: 'user123' },
    { id: '3', email: 'test@example.com', password: 'test123' }
  ];

  private activeSessions: Map<string, AuthSession> = new Map();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  async authenticate(email: Email, password: string): Promise<AuthSession | null> {
    try {
      // Intentar autenticación con backend real
      const loginData: LoginRequest = {
        email: email.value,
        password: password
      };

      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`,
          loginData
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend authentication failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        // Procesar respuesta del backend
        const data = response.data;

        // Guardar tokens en el servicio de tokens
        this.tokenService.setToken({
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt)
        });

        const session = new AuthSession(
          new UserId(data.user.id),
          new Email(data.user.email),
          data.token,
          data.refreshToken,
          new Date(data.expiresAt)
        );

        this.activeSessions.set(data.token, session);
        return session;
      }
    } catch (error) {
      console.warn('Backend authentication error, using fallback:', error);
    }

    // Fallback: usar autenticación mock
    return this.authenticateMock(email, password);
  }

  async refreshToken(refreshToken: string): Promise<AuthSession | null> {
    try {
      // Intentar refresh con backend real
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.refresh}`,
          { refreshToken }
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend refresh failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        const data = response.data;

        // Actualizar tokens en el servicio de tokens
        this.tokenService.setToken({
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt)
        });

        const session = new AuthSession(
          new UserId(data.user.id),
          new Email(data.user.email),
          data.token,
          data.refreshToken,
          new Date(data.expiresAt)
        );

        // Remover sesión anterior y agregar nueva
        this.activeSessions.delete(refreshToken);
        this.activeSessions.set(data.token, session);
        return session;
      }
    } catch (error) {
      console.warn('Backend refresh error, using fallback:', error);
    }

    // Fallback: usar refresh mock
    return this.refreshTokenMock(refreshToken);
  }

  async logout(userId: UserId): Promise<void> {
    try {
      // Intentar logout con backend real
      await firstValueFrom(
        this.http.post<ApiResponse>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`,
          { userId: userId.value }
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend logout failed, using fallback:', error.message);
            return of({ success: false });
          })
        )
      );
    } catch (error) {
      console.warn('Backend logout error, using fallback:', error);
    }

    // Siempre limpiar tokens y sesiones locales
    this.tokenService.clearTokens();
    this.logoutMock(userId);
  }

  async getCurrentSession(token?: string): Promise<AuthSession | null> {
    // Si no se proporciona token, usar el del servicio de tokens
    const currentToken = token || this.tokenService.getCurrentToken();

    if (!currentToken) {
      return null;
    }

    // Primero verificar sesión local
    const localSession = this.activeSessions.get(currentToken);

    if (localSession && !localSession.isExpired()) {
      return localSession;
    }

    // Si no hay sesión local válida, intentar verificar con backend
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<LoginResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.current}`
          // El token se inyecta automáticamente por el interceptor
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend session check failed:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        const data = response.data;
        const session = new AuthSession(
          new UserId(data.user.id),
          new Email(data.user.email),
          data.token,
          data.refreshToken,
          new Date(data.expiresAt)
        );

        this.activeSessions.set(currentToken, session);
        return session;
      }
    } catch (error) {
      console.warn('Backend session check error:', error);
    }

    // Limpiar sesión expirada
    if (localSession) {
      this.activeSessions.delete(currentToken);
    }

    return null;
  }

  // Métodos mock como fallback
  private async authenticateMock(email: Email, password: string): Promise<AuthSession | null> {
    const user = this.mockUsers.find(u => u.email === email.value && u.password === password);

    if (!user) {
      return null;
    }

    const token = this.generateToken();
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar tokens en el servicio de tokens (también para mock)
    this.tokenService.setToken({
      accessToken: token,
      refreshToken: refreshToken,
      expiresAt: expiresAt
    });

    const session = new AuthSession(
      new UserId(user.id),
      email,
      token,
      refreshToken,
      expiresAt
    );

    this.activeSessions.set(token, session);
    return session;
  }

  private async refreshTokenMock(refreshToken: string): Promise<AuthSession | null> {
    const existingSession = Array.from(this.activeSessions.values())
      .find(session => session.refreshToken === refreshToken);

    if (!existingSession || existingSession.isExpired()) {
      return null;
    }

    const newToken = this.generateToken();
    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Actualizar tokens en el servicio de tokens (también para mock)
    this.tokenService.setToken({
      accessToken: newToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresAt
    });

    const newSession = new AuthSession(
      existingSession.userId,
      existingSession.email,
      newToken,
      newRefreshToken,
      expiresAt
    );

    this.activeSessions.delete(existingSession.token);
    this.activeSessions.set(newToken, newSession);

    return newSession;
  }

  private logoutMock(userId: UserId): void {
    for (const [token, session] of this.activeSessions.entries()) {
      if (session.userId.equals(userId)) {
        this.activeSessions.delete(token);
      }
    }
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
  }

  private generateRefreshToken(): string {
    return 'refresh_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
  }
}
