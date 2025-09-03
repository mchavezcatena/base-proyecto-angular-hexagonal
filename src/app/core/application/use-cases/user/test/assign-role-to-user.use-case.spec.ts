import { AssignRoleToUserUseCase } from '../assign-role-to-user.use-case';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { RoleRepository } from '../../../../domain/repositories/role.repository';
import { User } from '../../../../domain/entities/user.entity';
import { Role } from '../../../../domain/entities/role.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { Email } from '../../../../domain/value-objects/email.vo';

describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;
  let mockRoleRepository: jasmine.SpyObj<RoleRepository>;

  const mockUser = new User(
    new UserId('user1'),
    'Test User',
    new Email('test@example.com'),
    true
  );

  const mockRoles = [
    new Role(new RoleId('role1'), 'Admin', 'Admin role', []),
    new Role(new RoleId('role2'), 'User', 'User role', [])
  ];

  beforeEach(() => {
    mockUserRepository = jasmine.createSpyObj('UserRepository', ['findById', 'assignRoles']);
    mockRoleRepository = jasmine.createSpyObj('RoleRepository', ['findById']);

    useCase = new AssignRoleToUserUseCase(mockUserRepository, mockRoleRepository);

    // Configuración por defecto de los mocks
    mockUserRepository.findById.and.returnValue(Promise.resolve(mockUser));
    mockUserRepository.assignRoles.and.returnValue(Promise.resolve());
    mockRoleRepository.findById.and.returnValue(Promise.resolve(mockRoles[0]));
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  describe('Success Cases', () => {
    it('should assign single role successfully', async () => {
      const request = {
        userId: 'user1',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.error).toBeUndefined();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(new UserId('user1'));
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(new RoleId('role1'));
      expect(mockUserRepository.assignRoles).toHaveBeenCalledWith(
        new UserId('user1'),
        [new RoleId('role1')]
      );
    });

    it('should assign multiple roles successfully', async () => {
      mockRoleRepository.findById.and.returnValues(
        Promise.resolve(mockRoles[0]),
        Promise.resolve(mockRoles[1])
      );

      const request = {
        userId: 'user1',
        roleIds: ['role1', 'role2']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.error).toBeUndefined();
      expect(mockRoleRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.assignRoles).toHaveBeenCalledWith(
        new UserId('user1'),
        [new RoleId('role1'), new RoleId('role2')]
      );
    });
  });

  describe('Validation Cases', () => {
    it('should handle non-existent user', async () => {
      mockUserRepository.findById.and.returnValue(Promise.resolve(null));

      const request = {
        userId: 'invalid-user',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Usuario no encontrado');
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle empty role list', async () => {
      const request = {
        userId: 'user1',
        roleIds: []
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Debe seleccionar al menos un rol');
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle undefined role list', async () => {
      const request = {
        userId: 'user1',
        roleIds: undefined as any
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Debe seleccionar al menos un rol');
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle non-existent role', async () => {
      mockRoleRepository.findById.and.returnValue(Promise.resolve(null));

      const request = {
        userId: 'user1',
        roleIds: ['invalid-role']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('El rol con ID invalid-role no existe');
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID format', async () => {
      const request = {
        userId: '',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBeTruthy();
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle invalid role ID format', async () => {
      const request = {
        userId: 'user1',
        roleIds: ['']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBeTruthy();
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle repository errors in findById', async () => {
      mockUserRepository.findById.and.returnValue(Promise.reject(new Error('Database error')));

      const request = {
        userId: 'user1',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Database error');
      expect(mockUserRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('should handle repository errors in assignRoles', async () => {
      mockUserRepository.assignRoles.and.returnValue(Promise.reject(new Error('Database error')));

      const request = {
        userId: 'user1',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors gracefully', async () => {
      mockUserRepository.assignRoles.and.returnValue(Promise.reject('Unknown error'));

      const request = {
        userId: 'user1',
        roleIds: ['role1']
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Error al asignar roles al usuario');
    });
  });
});
