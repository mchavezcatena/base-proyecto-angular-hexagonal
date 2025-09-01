import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LoginUseCase } from '../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../core/application/use-cases/auth/logout.use-case';
import { AuthSession } from '../../core/domain/entities/auth-session.entity';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { Email } from '../../core/domain/value-objects/email.vo';

describe('AuthService', () => {
  let service: AuthService;
  let mockLoginUseCase: jasmine.SpyObj<LoginUseCase>;
  let mockLogoutUseCase: jasmine.SpyObj<LogoutUseCase>;

  beforeEach(() => {
    const loginSpy = jasmine.createSpyObj('LoginUseCase', ['execute']);
    const logoutSpy = jasmine.createSpyObj('LogoutUseCase', ['execute']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: LoginUseCase, useValue: loginSpy },
        { provide: LogoutUseCase, useValue: logoutSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockLoginUseCase = TestBed.inject(LoginUseCase) as jasmine.SpyObj<LoginUseCase>;
    mockLogoutUseCase = TestBed.inject(LogoutUseCase) as jasmine.SpyObj<LogoutUseCase>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockSession = new AuthSession(
        new UserId('user-id'),
        new Email('test@example.com'),
        'token123',
        'refresh-token',
        new Date(Date.now() + 3600000),
        new Date()
      );
      const mockResponse = { success: true, session: mockSession };

      mockLoginUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.login('test@example.com', 'password123');

      expect(result.success).toBeTruthy();
      expect(result.session).toBe(mockSession);
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle login failure', async () => {
      const mockResponse = { success: false, error: 'Invalid credentials' };

      mockLoginUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.login('test@example.com', 'wrongpassword');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = { success: true };

      mockLogoutUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.logout('user-id');

      expect(result.success).toBeTruthy();
      expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({ userId: 'user-id' });
    });

    it('should handle logout failure', async () => {
      const mockResponse = { success: false, error: 'Logout failed' };

      mockLogoutUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.logout('user-id');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Logout failed');
    });
  });
});
