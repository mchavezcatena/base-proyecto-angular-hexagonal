import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { API_CONFIG } from '../config/api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private tokenService: TokenService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo agregar token a peticiones hacia nuestra API
    if (this.shouldAddToken(request.url)) {
      request = this.addTokenToRequest(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es un error 401 (Unauthorized) y tenemos refresh token, intentar renovar
        if (error.status === 401 && this.tokenService.getRefreshToken() && this.shouldAddToken(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Determina si se debe agregar el token a la petición
   */
  private shouldAddToken(url: string): boolean {
    // Solo agregar token a peticiones hacia nuestra API
    return url.startsWith(API_CONFIG.baseUrl);
  }

  /**
   * Agrega el Bearer token a la petición
   */
  private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenService.getCurrentToken();

    // Siempre agregar el header Authorization, incluso si el token está vacío
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Maneja errores 401 intentando renovar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken) {
        return this.refreshToken(refreshToken).pipe(
          switchMap((newToken: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newToken);

            // Reintentar la petición original con el nuevo token
            return next.handle(this.addTokenToRequest(request));
          }),
          catchError((error) => {
            this.isRefreshing = false;

            // Si falla el refresh, limpiar tokens y redirigir al login
            this.tokenService.clearTokens();

            // Aquí podrías emitir un evento para redirigir al login
            // o usar el Router para navegar

            return throwError(() => error);
          })
        );
      }
    }

    // Si ya se está refrescando, esperar a que termine
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(this.addTokenToRequest(request)))
    );
  }

  /**
   * Renueva el token usando el refresh token
   */
  private refreshToken(refreshToken: string): Observable<any> {
    // Crear una petición HTTP para renovar el token
    // Nota: Esta petición NO debe pasar por el interceptor para evitar bucles infinitos
    return new Observable(observer => {
      // Simular llamada al backend para renovar token
      // En una implementación real, harías una petición HTTP aquí

      // Por ahora, simular que el refresh falló para mantener el comportamiento actual
      observer.error(new Error('Token refresh not implemented'));
    });
  }
}
