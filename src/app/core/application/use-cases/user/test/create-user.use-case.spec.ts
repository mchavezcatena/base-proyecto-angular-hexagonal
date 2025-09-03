import { TestBed } from '@angular/core/testing';
import { UserRepository, User, UserId, Email } from '../../../../domain';
import { USER_REPOSITORY } from '../../../ports/injection-tokens';
import { CreateUserUseCase } from '../create-user.use-case';


describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;

  beforeEach(() => {
    const userRepositorySpy = jasmine.createSpyObj('UserRepository', [
      'save',
      'findByEmail'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepositorySpy }
      ]
    });

    useCase = TestBed.inject(CreateUserUseCase);
    mockUserRepository = TestBed.inject(USER_REPOSITORY) as jasmine.SpyObj<UserRepository>;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should create user successfully', async () => {
    const request = { name: 'Test User', email: 'test@example.com' };
    const mockUser = new User(
      new UserId('test-id'),
      'Test User',
      new Email('test@example.com')
    );

    mockUserRepository.findByEmail.and.returnValue(Promise.resolve(null));
    mockUserRepository.save.and.returnValue(Promise.resolve(mockUser));

    const result = await useCase.execute(request);

    expect(result.success).toBeTruthy();
    expect(result.user).toBeTruthy();
    expect(result.error).toBeUndefined();
    expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should fail when name is missing', async () => {
    const request = { name: '', email: 'test@example.com' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Nombre y email son requeridos');
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when email is missing', async () => {
    const request = { name: 'Test User', email: '' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Nombre y email son requeridos');
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when email already exists', async () => {
    const request = { name: 'Test User', email: 'test@example.com' };
    const existingUser = new User(
      new UserId('existing-id'),
      'Existing User',
      new Email('test@example.com')
    );

    mockUserRepository.findByEmail.and.returnValue(Promise.resolve(existingUser));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Ya existe un usuario con este email');
    expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should handle repository errors gracefully', async () => {
    const request = { name: 'Test User', email: 'test@example.com' };

    mockUserRepository.findByEmail.and.returnValue(Promise.resolve(null));
    mockUserRepository.save.and.returnValue(Promise.reject(new Error('Database error')));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Database error');
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    const request = { name: 'Test User', email: 'test@example.com' };

    mockUserRepository.findByEmail.and.returnValue(Promise.resolve(null));
    mockUserRepository.save.and.returnValue(Promise.reject('Unknown error'));

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBe('Error al crear usuario');
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should handle invalid email format', async () => {
    const request = { name: 'Test User', email: 'invalid-email' };

    const result = await useCase.execute(request);

    expect(result.success).toBeFalsy();
    expect(result.error).toBeTruthy();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });
});
