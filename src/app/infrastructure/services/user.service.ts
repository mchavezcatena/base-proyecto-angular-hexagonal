import { Injectable, Inject } from '@angular/core';
import { UserServicePort } from '../../core/application/ports/user.service.port';
import { CreateUserUseCase } from '../../core/application/use-cases/user/create-user.use-case';
import { GetAllUsersUseCase } from '../../core/application/use-cases/user/get-all-users.use-case';
import { UpdateUserUseCase } from '../../core/application/use-cases/user/update-user.use-case';
import { User } from '../../core/domain/entities/user.entity';
import { UserRepository } from '../../core/domain/repositories/user.repository';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { USER_REPOSITORY } from '../../core/application/ports/injection-tokens';

@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServicePort {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  async createUser(name: string, email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return await this.createUserUseCase.execute({ name, email });
  }

  async getAllUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
    return await this.getAllUsersUseCase.execute();
  }

  async updateUser(id: string, name?: string, email?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return await this.updateUserUseCase.execute({ id, name, email });
  }

  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = new UserId(id);
      await this.userRepository.delete(userId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar usuario'
      };
    }
  }

  async getUserById(id: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userId = new UserId(id);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al buscar usuario'
      };
    }
  }
}
