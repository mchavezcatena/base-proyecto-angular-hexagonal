import { GetAllUsersUseCase } from '../get-all-users.use-case';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Email } from '../../../../domain/value-objects/email.vo';

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;

  const mockUsers = [
    new User(
      new UserId('1'),
      'User 1',
      new Email('user1@example.com'),
      true
    ),
    new User(
      new UserId('2'),
      'User 2',
      new Email('user2@example.com'),
      true
    )
  ];

  beforeEach(() => {
    mockUserRepository = jasmine.createSpyObj('UserRepository', ['findAll']);
    useCase = new GetAllUsersUseCase(mockUserRepository);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should get all users successfully', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.resolve(mockUsers));

    const result = await useCase.execute();

    expect(result.success).toBeTrue();
    expect(result.users).toEqual(mockUsers);
    expect(result.error).toBeNull();
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle empty user list', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.resolve([]));

    const result = await useCase.execute();

    expect(result.success).toBeTrue();
    expect(result.users).toEqual([]);
    expect(result.error).toBeNull();
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.reject(new Error('Database error')));

    const result = await useCase.execute();

    expect(result.success).toBeFalse();
    expect(result.users).toEqual([]);
    expect(result.error).toBe('Error al obtener usuarios');
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.reject('Unknown error'));

    const result = await useCase.execute();

    expect(result.success).toBeFalse();
    expect(result.users).toEqual([]);
    expect(result.error).toBe('Error al obtener usuarios');
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });
});
