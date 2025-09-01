import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { CreateUserUseCase } from '../../core/application/use-cases/user/create-user.use-case';
import { GetAllUsersUseCase } from '../../core/application/use-cases/user/get-all-users.use-case';
import { UpdateUserUseCase } from '../../core/application/use-cases/user/update-user.use-case';
import { UserRepository } from '../../core/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../core/application/ports/injection-tokens';
import { User } from '../../core/domain/entities/user.entity';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { Email } from '../../core/domain/value-objects/email.vo';

describe('UserService', () => {
  let service: UserService;
  let mockCreateUserUseCase: jasmine.SpyObj<CreateUserUseCase>;
  let mockGetAllUsersUseCase: jasmine.SpyObj<GetAllUsersUseCase>;
  let mockUpdateUserUseCase: jasmine.SpyObj<UpdateUserUseCase>;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;

  beforeEach(() => {
    const createUserSpy = jasmine.createSpyObj('CreateUserUseCase', ['execute']);
    const getAllUsersSpy = jasmine.createSpyObj('GetAllUsersUseCase', ['execute']);
    const updateUserSpy = jasmine.createSpyObj('UpdateUserUseCase', ['execute']);
    const userRepositorySpy = jasmine.createSpyObj('UserRepository', ['findById', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: CreateUserUseCase, useValue: createUserSpy },
        { provide: GetAllUsersUseCase, useValue: getAllUsersSpy },
        { provide: UpdateUserUseCase, useValue: updateUserSpy },
        { provide: USER_REPOSITORY, useValue: userRepositorySpy }
      ]
    });

    service = TestBed.inject(UserService);
    mockCreateUserUseCase = TestBed.inject(CreateUserUseCase) as jasmine.SpyObj<CreateUserUseCase>;
    mockGetAllUsersUseCase = TestBed.inject(GetAllUsersUseCase) as jasmine.SpyObj<GetAllUsersUseCase>;
    mockUpdateUserUseCase = TestBed.inject(UpdateUserUseCase) as jasmine.SpyObj<UpdateUserUseCase>;
    mockUserRepository = TestBed.inject(USER_REPOSITORY) as jasmine.SpyObj<UserRepository>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = new User(
        new UserId('test-id'),
        'Test User',
        new Email('test@example.com')
      );
      const mockResponse = { success: true, user: mockUser };

      mockCreateUserUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createUser('Test User', 'test@example.com');

      expect(result.success).toBeTruthy();
      expect(result.user).toBe(mockUser);
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    it('should handle create user error', async () => {
      const mockResponse = { success: false, error: 'Email already exists' };

      mockCreateUserUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createUser('Test User', 'test@example.com');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        new User(new UserId('1'), 'User 1', new Email('user1@example.com')),
        new User(new UserId('2'), 'User 2', new Email('user2@example.com'))
      ];
      const mockResponse = { success: true, users: mockUsers };

      mockGetAllUsersUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getAllUsers();

      expect(result.success).toBeTruthy();
      expect(result.users).toEqual(mockUsers);
      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalled();
    });

    it('should handle get all users error', async () => {
      const mockResponse = { success: false, users: [], error: 'Database error' };

      mockGetAllUsersUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getAllUsers();

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = new User(
        new UserId('test-id'),
        'Updated User',
        new Email('updated@example.com')
      );
      const mockResponse = { success: true, user: mockUser };

      mockUpdateUserUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateUser('test-id', 'Updated User', 'updated@example.com');

      expect(result.success).toBeTruthy();
      expect(result.user).toBe(mockUser);
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
        id: 'test-id',
        name: 'Updated User',
        email: 'updated@example.com'
      });
    });

    it('should handle update user error', async () => {
      const mockResponse = { success: false, error: 'User not found' };

      mockUpdateUserUseCase.execute.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateUser('test-id', 'Updated User', 'updated@example.com');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.delete.and.returnValue(Promise.resolve());

      const result = await service.deleteUser('test-id');

      expect(result.success).toBeTruthy();
      expect(mockUserRepository.delete).toHaveBeenCalled();
    });

    it('should handle delete user error', async () => {
      mockUserRepository.delete.and.returnValue(Promise.reject(new Error('Delete failed')));

      const result = await service.deleteUser('test-id');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Delete failed');
    });
  });
});
