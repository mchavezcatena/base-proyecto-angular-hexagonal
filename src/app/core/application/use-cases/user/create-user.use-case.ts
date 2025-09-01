import { Injectable, Inject } from '@angular/core';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../ports/injection-tokens';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // Validar entrada
      if (!request.name || !request.email) {
        return {
          success: false,
          error: 'Nombre y email son requeridos'
        };
      }

      // Crear value objects
      const email = new Email(request.email);
      const userId = UserId.create();

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'Ya existe un usuario con este email'
        };
      }

      // Crear nueva entidad User
      const user = new User(userId, request.name, email);

      // Guardar usuario
      const savedUser = await this.userRepository.save(user);

      return {
        success: true,
        user: savedUser
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear usuario'
      };
    }
  }
}
