import { Injectable, Inject } from '@angular/core';
import { RoleServicePort } from '../../core/application/ports/role.service.port';
import { CreateRoleUseCase } from '../../core/application/use-cases/role/create-role.use-case';
import { GetAllRolesUseCase } from '../../core/application/use-cases/role/get-all-roles.use-case';
import { Role } from '../../core/domain/entities/role.entity';
import { RoleRepository } from '../../core/domain/repositories/role.repository';
import { RoleId } from '../../core/domain/value-objects/role-id.vo';
import { ROLE_REPOSITORY } from '../../core/application/ports/injection-tokens';

@Injectable({
  providedIn: 'root'
})
export class RoleService implements RoleServicePort {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getAllRolesUseCase: GetAllRolesUseCase,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository
  ) {}

  async createRole(name: string, description: string, permissions?: string[]): Promise<{ success: boolean; role?: Role; error?: string }> {
    return await this.createRoleUseCase.execute({ name, description, permissions });
  }

  async getAllRoles(): Promise<{ success: boolean; roles?: Role[]; error?: string }> {
    return await this.getAllRolesUseCase.execute();
  }

  async updateRole(id: string, name?: string, description?: string): Promise<{ success: boolean; role?: Role; error?: string }> {
    try {
      const roleId = new RoleId(id);
      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado'
        };
      }

      if (name) {
        role.updateName(name);
      }

      if (description) {
        role.updateDescription(description);
      }

      const updatedRole = await this.roleRepository.save(role);

      return {
        success: true,
        role: updatedRole
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar rol'
      };
    }
  }

  async deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const roleId = new RoleId(id);
      await this.roleRepository.delete(roleId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar rol'
      };
    }
  }

  async getRoleById(id: string): Promise<{ success: boolean; role?: Role; error?: string }> {
    try {
      const roleId = new RoleId(id);
      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado'
        };
      }

      return {
        success: true,
        role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al buscar rol'
      };
    }
  }

  async assignPermission(roleId: string, permission: string): Promise<{ success: boolean; error?: string }> {
    try {
      const id = new RoleId(roleId);
      const role = await this.roleRepository.findById(id);

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado'
        };
      }

      role.addPermission(permission);
      await this.roleRepository.save(role);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al asignar permiso'
      };
    }
  }

  async removePermission(roleId: string, permission: string): Promise<{ success: boolean; error?: string }> {
    try {
      const id = new RoleId(roleId);
      const role = await this.roleRepository.findById(id);

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado'
        };
      }

      role.removePermission(permission);
      await this.roleRepository.save(role);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al remover permiso'
      };
    }
  }
}
