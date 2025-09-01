import { TestBed } from '@angular/core/testing';
import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../ports/injection-tokens';
import { AuthSession } from '../../../domain/entities/auth-session.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthRepository: jasmine.SpyObj<AuthRepository>;

  beforeEach(() => {
    const authRepositorySpy = jasmine.createSpyObj('AuthRepository', [
      'authenticate',
      'refreshToken',
      'logout',
      'getCurrentSession'
    ]);

    TestBed.configureTestingModule({
      providers: [
        LoginUseCase,
        { provide: AUTH_REPOSITORY, useValue: authRepositorySpy }
      ]
    });

    useCase = TestBed.inject(LoginUseCase);
    mockAuthRepository = TestBed.inject(AUTH_REPOSITORY) as jasmine.SpyObj<AuthRepository>;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should login successfully with valid credentials', async () => {
    const request = { email: 'test@example.com', password: 'password123' };
    const mockSession = new AuthSession(
      new UserId('user-id'),
      new Email('test@example.com'),
      'token123',
      'refresh-token',
      new Date(Date.now() + 3600000),
      new Date()
    );

    mockAuthRepository.authenticate.and.returnValue(Promise.resolve(mockSession));

    const result = await useCase.execute(request);

    expect(result.success).toBeTruthy();
    expect(result.session).toBe(mockSession);
    expect(result.error).toBeUndefined();
    expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(jasmine.any(Object), request.password);
  });

  it('should fail with invalid credentials', async () => {
    const request = { email: 'test@example.com', password: 'wrongpassword' };

    mockAuthRepository.authenticate.and.returnValue(Promise.resolve(null));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.session).toBeUndefined();
    expect(result.error).toBe('Credenciales inválidas');
    expect(mockAuthRepository.authenticate).toHaveBeenCalledWith(jasmine.any(Object), request.password);
  });

  it('should fail when email is missing', async () => {
    const request = { email: '', password: 'password123' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Email y contraseña son requeridos');
    expect(mockAuthRepository.authenticate).not.toHaveBeenCalled();
  });

  it('should fail when password is missing', async () => {
    const request = { email: 'test@example.com', password: '' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Email y contraseña son requeridos');
    expect(mockAuthRepository.authenticate).not.toHaveBeenCalled();
  });

  it('should handle authentication errors gracefully', async () => {
    const request = { email: 'test@example.com', password: 'password123' };

    mockAuthRepository.authenticate.and.returnValue(Promise.reject(new Error('Authentication service unavailable')));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Authentication service unavailable');
    expect(mockAuthRepository.authenticate).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    const request = { email: 'test@example.com', password: 'password123' };

    mockAuthRepository.authenticate.and.returnValue(Promise.reject('Unknown error'));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Error al iniciar sesión');
    expect(mockAuthRepository.authenticate).toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const request = { email: 'invalid-email', password: 'password123' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBeTruthy();
    expect(mockAuthRepository.authenticate).not.toHaveBeenCalled();
  });
});
