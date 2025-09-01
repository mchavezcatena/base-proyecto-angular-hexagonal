import { AuthSession } from '../../domain/entities/auth-session.entity';

export interface AuthServicePort {
  login(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }>;
  logout(userId: string): Promise<{ success: boolean; error?: string }>;
  getCurrentSession(): AuthSession | null;
  isAuthenticated(): boolean;
  refreshToken(): Promise<{ success: boolean; session?: AuthSession; error?: string }>;
}
