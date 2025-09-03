import { UpdateUserUseCase } from '../update-user.use-case';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Email } from '../../../../domain/value-objects/email.vo';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: jasmine.SpyObj<UserRepository>;

  const mockUser = new User(
    new UserId('1'),
    'Test User',
    new Email('test@example.com'),
    true
  );

  const mockUpdatedUser = new User(
    new UserId('1'),
    'Updated User',
    new Email('updated@example.com'),
    true
  );

  beforeEach(() => {
    mockUserRepository = jasmine.createSpyObj('UserRepository', ['findById', 'findByEmail', 'save']);
    useCase = new UpdateUserUseCase(mockUserRepository);

    // Configuración por defecto de los mocks
    mockUserRepository.findById.and.returnValue(Promise.resolve(mockUser));
    mockUserRepository.findByEmail.and.returnValue(Promise.resolve(null));
    mockUserRepository.save.and.returnValue(Promise.resolve(mockUpdatedUser));
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  // Tests para actualización de nombre
  describe('Name Update', () => {
    it('should update only name successfully', async () => {
      const request = { id: '1', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.user).toBe(mockUpdatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(new UserId('1'));
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should handle invalid user ID when updating name', async () => {
      mockUserRepository.findById.and.returnValue(Promise.resolve(null));
      const request = { id: 'invalid-id', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Usuario no encontrado');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // Tests para actualización de email
  describe('Email Update', () => {
    it('should update only email successfully', async () => {
      const request = { id: '1', email: 'updated@example.com' };
      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.user).toBe(mockUpdatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(new UserId('1'));
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(new Email('updated@example.com'));
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should handle email already in use by different user', async () => {
      const existingUser = new User(
        new UserId('2'),
        'Other User',
        new Email('updated@example.com'),
        true
      );
      mockUserRepository.findByEmail.and.returnValue(Promise.resolve(existingUser));

      const request = { id: '1', email: 'updated@example.com' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('El email ya está en uso por otro usuario');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should allow updating email to same user\'s current email', async () => {
      mockUserRepository.findByEmail.and.returnValue(Promise.resolve(mockUser));

      const request = { id: '1', email: 'test@example.com' };
      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.user).toBe(mockUpdatedUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should handle invalid email format', async () => {
      const request = { id: '1', email: 'invalid-email' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBeTruthy();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // Tests para actualización combinada
  describe('Combined Update', () => {
    it('should update both name and email successfully', async () => {
      const request = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com'
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeTrue();
      expect(result.user).toBe(mockUpdatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(new UserId('1'));
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(new Email('updated@example.com'));
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should handle partial update when email is invalid', async () => {
      const request = {
        id: '1',
        name: 'Updated User',
        email: 'invalid-email'
      };

      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBeTruthy();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // Tests para manejo de errores
  describe('Error Handling', () => {
    it('should handle invalid user ID format', async () => {
      const request = { id: '', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBeTruthy();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      mockUserRepository.save.and.returnValue(Promise.reject(new Error('Database error')));

      const request = { id: '1', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown error gracefully', async () => {
      mockUserRepository.save.and.returnValue(Promise.reject('Unknown error'));

      const request = { id: '1', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Error al actualizar usuario');
    });

    it('should handle findById repository error', async () => {
      mockUserRepository.findById.and.returnValue(Promise.reject(new Error('Database error')));

      const request = { id: '1', name: 'Updated User' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Database error');
    });

    it('should handle findByEmail repository error', async () => {
      mockUserRepository.findByEmail.and.returnValue(Promise.reject(new Error('Database error')));

      const request = { id: '1', email: 'updated@example.com' };
      const result = await useCase.execute(request);

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Database error');
    });
  });
});
