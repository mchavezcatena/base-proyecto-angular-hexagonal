import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'app_access_token';
  private readonly REFRESH_TOKEN_KEY = 'app_refresh_token';
  private readonly EXPIRES_AT_KEY = 'app_token_expires_at';

  private tokenSubject = new BehaviorSubject<string>('pruebaToken');
  public token$ = this.tokenSubject.asObservable();

  constructor() {
    // Cargar token desde localStorage al inicializar
    this.loadTokenFromStorage();
  }

  /**
   * Obtiene el token actual
   */
  getCurrentToken(): string {
    console.log('getCurrentTokenaki', this.tokenSubject.value);
    return this.tokenSubject.value;
  }

  /**
   * Verifica si hay un token válido
   */
  hasValidToken(): boolean {
    const token = this.getCurrentToken();
    if (!token) return false;

    const expiresAt = this.getTokenExpirationDate();
    if (!expiresAt) return false;

    return new Date() < expiresAt;
  }

  /**
   * Establece el token y lo guarda
   */
  setToken(tokenData: TokenData): void {
    // Guardar en localStorage
    localStorage.setItem(this.TOKEN_KEY, tokenData.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, tokenData.expiresAt.toISOString());

    // Notificar a los suscriptores
    this.tokenSubject.next(tokenData.accessToken);
  }

  /**
   * Establece solo el access token (para refresh)
   */
  setAccessToken(accessToken: string, expiresAt: Date): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toISOString());
    this.tokenSubject.next(accessToken);
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene la fecha de expiración del token
   */
  getTokenExpirationDate(): Date | null {
    const expiresAtStr = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAtStr ? new Date(expiresAtStr) : null;
  }

  /**
   * Verifica si el token está próximo a expirar (dentro de 5 minutos)
   */
  isTokenNearExpiration(): boolean {
    const expiresAt = this.getTokenExpirationDate();
    if (!expiresAt) return true;

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Limpia todos los tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    this.tokenSubject.next('');
  }

  /**
   * Carga el token desde localStorage
   */
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // Verificar si el token no ha expirado
      if (this.hasValidToken()) {
        this.tokenSubject.next(token);
      } else {
        // Token expirado, limpiarlo
        this.clearTokens();
      }
    }
  }

  /**
   * Observable para escuchar cambios en el token
   */
  onTokenChange(): Observable<string> {
    return this.token$;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }
}
