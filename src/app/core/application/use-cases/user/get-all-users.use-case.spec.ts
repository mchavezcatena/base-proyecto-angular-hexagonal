import { TestBed } from '@angular/core/testing';
import { GetAllUsersUseCase } from './get-all-users.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../ports/injection-tokens';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;

  beforeEach(() => {
    const userRepositorySpy = jasmine.createSpyObj('UserRepository', ['findAll']);

    TestBed.configureTestingModule({
      providers: [
        GetAllUsersUseCase,
        { provide: USER_REPOSITORY, useValue: userRepositorySpy }
      ]
    });

    useCase = TestBed.inject(GetAllUsersUseCase);
    mockUserRepository = TestBed.inject(USER_REPOSITORY) as jasmine.SpyObj<UserRepository>;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should return all users successfully', async () => {
    const mockUsers = [
      new User(new UserId('1'), 'User 1', new Email('user1@example.com')),
      new User(new UserId('2'), 'User 2', new Email('user2@example.com'))
    ];

    mockUserRepository.findAll.and.returnValue(Promise.resolve(mockUsers));

    const result = await useCase.execute();

    expect(result.success).toBeTruthy();
    expect(result.users).toEqual(mockUsers);
    expect(result.users!.length).toBe(2);
    expect(result.error).toBeUndefined();
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no users exist', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.resolve([]));

    const result = await useCase.execute();

    expect(result.success).toBeTruthy();
    expect(result.users).toEqual([]);
    expect(result.users!.length).toBe(0);
    expect(result.error).toBeUndefined();
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle repository errors gracefully', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.reject(new Error('Database connection failed')));

    const result = await useCase.execute();

    expect(result.success).toBeFalsy();
    expect(result.users).toEqual([]);
    expect(result.error).toBe('Database connection failed');
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    mockUserRepository.findAll.and.returnValue(Promise.reject('Unknown error'));

    const result = await useCase.execute();

    expect(result.success).toBeFalsy();
    expect(result.users).toEqual([]);
    expect(result.error).toBe('Error al obtener usuarios');
    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });
});
