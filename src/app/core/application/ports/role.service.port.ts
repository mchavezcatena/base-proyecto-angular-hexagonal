import { Role } from '../../domain/entities/role.entity';

export interface RoleServicePort {
  createRole(name: string, description: string, permissions?: string[]): Promise<{ success: boolean; role?: Role; error?: string }>;
  getAllRoles(): Promise<{ success: boolean; roles?: Role[]; error?: string }>;
  updateRole(id: string, name?: string, description?: string): Promise<{ success: boolean; role?: Role; error?: string }>;
  deleteRole(id: string): Promise<{ success: boolean; error?: string }>;
  getRoleById(id: string): Promise<{ success: boolean; role?: Role; error?: string }>;
  assignPermission(roleId: string, permission: string): Promise<{ success: boolean; error?: string }>;
  removePermission(roleId: string, permission: string): Promise<{ success: boolean; error?: string }>;
}
