import { Injectable, Inject } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../ports/injection-tokens';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export interface LogoutRequest {
  userId: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogoutUseCase {
  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository) {}

  async execute(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      const userId = new UserId(request.userId);
      await this.authRepository.logout(userId);

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      };
    }
  }
}
