import { Injectable, Inject } from '@angular/core';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../ports/injection-tokens';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const userId = new UserId(request.id);

      // Buscar usuario existente
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Actualizar nombre si se proporciona
      if (request.name) {
        user.updateName(request.name);
      }

      // Actualizar email si se proporciona
      if (request.email) {
        const newEmail = new Email(request.email);

        // Verificar que el nuevo email no esté en uso
        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser && !existingUser.id.equals(userId)) {
          return {
            success: false,
            error: 'El email ya está en uso por otro usuario'
          };
        }

        user.updateEmail(newEmail);
      }

      // Guardar cambios
      const updatedUser = await this.userRepository.save(user);

      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      };
    }
  }
}
