import { inject } from '@angular/core';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../ports/injection-tokens';

export interface GetAllUsersResponse {
  success: boolean;
  users: User[];
  error: string | null;
}

export class GetAllUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository = inject(USER_REPOSITORY)
  ) {}

  async execute(): Promise<GetAllUsersResponse> {
    try {
      const users = await this.userRepository.findAll();
      return {
        success: true,
        users,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        users: [], // Aseguramos que siempre devolvemos un array vacío en caso de error
        error: 'Error al obtener usuarios'
      };
    }
  }
}
