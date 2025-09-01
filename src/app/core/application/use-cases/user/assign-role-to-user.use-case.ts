import { Injectable, Inject } from '@angular/core';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../ports/injection-tokens';

export interface AssignRoleToUserRequest {
  userId: string;
  roleIds: string[];
}

export interface AssignRoleToUserResponse {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssignRoleToUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository
  ) {}

  async execute(request: AssignRoleToUserRequest): Promise<AssignRoleToUserResponse> {
    try {
      // Validar que el usuario existe
      const userId = new UserId(request.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Validar que al menos se asigne un rol
      if (!request.roleIds || request.roleIds.length === 0) {
        return {
          success: false,
          error: 'Debe seleccionar al menos un rol'
        };
      }

      // Validar que todos los roles existen
      for (const roleIdStr of request.roleIds) {
        const roleId = new RoleId(roleIdStr);
        const role = await this.roleRepository.findById(roleId);

        if (!role) {
          return {
            success: false,
            error: `El rol con ID ${roleIdStr} no existe`
          };
        }
      }

      // Asignar roles al usuario (esto debería implementarse en el repositorio)
      await this.userRepository.assignRoles(userId, request.roleIds.map(id => new RoleId(id)));

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al asignar roles al usuario'
      };
    }
  }
}
