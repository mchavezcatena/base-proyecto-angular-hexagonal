import { Injectable, Inject } from '@angular/core';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../ports/injection-tokens';
import { Role } from '../../../domain/entities/role.entity';

export interface GetAllRolesResponse {
  success: boolean;
  roles?: Role[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetAllRolesUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository) {}

  async execute(): Promise<GetAllRolesResponse> {
    try {
      const roles = await this.roleRepository.findAll();

      return {
        success: true,
        roles
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener roles'
      };
    }
  }
}
