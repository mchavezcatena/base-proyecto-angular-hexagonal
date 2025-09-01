import { Role } from '../entities/role.entity';
import { RoleId } from '../value-objects/role-id.vo';

export interface RoleRepository {
  findById(id: RoleId): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<Role>;
  delete(id: RoleId): Promise<void>;
  existsByName(name: string): Promise<boolean>;
}
