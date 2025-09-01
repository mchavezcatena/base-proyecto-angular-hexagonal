import { AuthSession } from '../entities/auth-session.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface AuthRepository {
  authenticate(email: Email, password: string): Promise<AuthSession | null>;
  refreshToken(refreshToken: string): Promise<AuthSession | null>;
  logout(userId: UserId): Promise<void>;
  getCurrentSession(token: string): Promise<AuthSession | null>;
}
