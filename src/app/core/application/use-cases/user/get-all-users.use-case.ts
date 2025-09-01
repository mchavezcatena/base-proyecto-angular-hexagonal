import { Injectable, Inject } from '@angular/core';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../ports/injection-tokens';
import { User } from '../../../domain/entities/user.entity';

export interface GetAllUsersResponse {
  success: boolean;
  users?: User[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetAllUsersUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(): Promise<GetAllUsersResponse> {
    try {
      const users = await this.userRepository.findAll();

      return {
        success: true,
        users
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios'
      };
    }
  }
}
