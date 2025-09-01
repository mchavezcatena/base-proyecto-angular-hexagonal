import { Injectable, Inject } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../ports/injection-tokens';
import { Email } from '../../../domain/value-objects/email.vo';
import { AuthSession } from '../../../domain/entities/auth-session.entity';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Validar entrada
      if (!request.email || !request.password) {
        return {
          success: false,
          error: 'Email y contraseña son requeridos'
        };
      }

      // Crear value object Email
      const email = new Email(request.email);

      // Autenticar usuario
      const session = await this.authRepository.authenticate(email, request.password);

      if (!session) {
        return {
          success: false,
          error: 'Credenciales inválidas'
        };
      }

      return {
        success: true,
        session
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
