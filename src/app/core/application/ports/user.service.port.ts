import { User } from '../../domain/entities/user.entity';

export interface UserServicePort {
  createUser(name: string, email: string): Promise<{ success: boolean; user?: User; error?: string }>;
  getAllUsers(): Promise<{ success: boolean; users?: User[]; error?: string }>;
  updateUser(id: string, name?: string, email?: string): Promise<{ success: boolean; user?: User; error?: string }>;
  deleteUser(id: string): Promise<{ success: boolean; error?: string }>;
  getUserById(id: string): Promise<{ success: boolean; user?: User; error?: string }>;
}
