import { TestBed } from '@angular/core/testing';
import { LogoutUseCase, LogoutRequest } from './logout.use-case';
import { AUTH_REPOSITORY } from '../../ports/injection-tokens';
import { UserId } from '../../../domain/value-objects/user-id.vo';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
  let mockAuthRepository: jasmine.SpyObj<any>;

  beforeEach(() => {
    // Create a spy object for AuthRepository
    mockAuthRepository = jasmine.createSpyObj('AuthRepository', ['logout']);

    // Configure TestBed with the use case and its dependencies
    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        { provide: AUTH_REPOSITORY, useValue: mockAuthRepository }
      ]
    });

    // Get an instance of the use case
    logoutUseCase = TestBed.inject(LogoutUseCase);
  });

  it('should be created', () => {
    expect(logoutUseCase).toBeTruthy();
  });

  describe('execute', () => {
    const testUserId = '123e4567-e89b-12d3-a456-426614174000';
    const request: LogoutRequest = { userId: testUserId };

    it('should call authRepository.logout with correct UserId', async () => {
      // Arrange
      mockAuthRepository.logout.and.returnValue(Promise.resolve());

      // Act
      await logoutUseCase.execute(request);

      // Assert
      expect(mockAuthRepository.logout).toHaveBeenCalled();
      const calledWith = mockAuthRepository.logout.calls.mostRecent().args[0];
      expect(calledWith).toBeInstanceOf(UserId);
      expect(calledWith.value).toBe(testUserId);
    });

    it('should return success true when logout is successful', async () => {
      // Arrange
      mockAuthRepository.logout.and.returnValue(Promise.resolve());

      // Act
      const result = await logoutUseCase.execute(request);

      // Assert
      expect(result).toEqual({ success: true });
    });

    it('should handle errors and return success false with error message', async () => {
      // Arrange
      const errorMessage = 'Logout failed';
      mockAuthRepository.logout.and.returnValue(Promise.reject(new Error(errorMessage)));

      // Act
      const result = await logoutUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });

    it('should handle non-Error rejections', async () => {
      // Arrange
      const errorObject = { message: 'Some error' };
      mockAuthRepository.logout.and.returnValue(Promise.reject(errorObject));

      // Act
      const result = await logoutUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Error al cerrar sesión'
      });
    });
  });
});
