import { User } from '../entities/user.entity';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { RoleId } from '../value-objects/role-id.vo';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
  existsByEmail(email: Email): Promise<boolean>;
  assignRoles(userId: UserId, roleIds: RoleId[]): Promise<void>;
  getUserRoles(userId: UserId): Promise<RoleId[]>;
}
