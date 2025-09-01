import { Injectable, Inject } from '@angular/core';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../ports/injection-tokens';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions?: string[];
}

export interface CreateRoleResponse {
  success: boolean;
  role?: Role;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateRoleUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository) {}

  async execute(request: CreateRoleRequest): Promise<CreateRoleResponse> {
    try {
      // Validar entrada
      if (!request.name || !request.description) {
        return {
          success: false,
          error: 'Nombre y descripción son requeridos'
        };
      }

      // Verificar si el nombre ya existe
      const existingRole = await this.roleRepository.findByName(request.name);
      if (existingRole) {
        return {
          success: false,
          error: 'Ya existe un rol con este nombre'
        };
      }

      // Crear nueva entidad Role
      const roleId = RoleId.create();
      const role = new Role(
        roleId,
        request.name,
        request.description,
        request.permissions || []
      );

      // Guardar rol
      const savedRole = await this.roleRepository.save(role);

      return {
        success: true,
        role: savedRole
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear rol'
      };
    }
  }
}
