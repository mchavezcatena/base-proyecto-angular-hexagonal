import { Email } from '../../value-objects/email.vo';
import { UserId } from '../../value-objects/user-id.vo';
import { AuthSession } from '../auth-session.entity';


describe('AuthSession', () => {
  const mockUserId = new UserId('123e4567-e89b-12d3-a456-426614174000');
  const mockEmail = new Email('test@example.com');
  const mockToken = 'test-jwt-token';
  const mockRefreshToken = 'test-refresh-token';
  const mockExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day from now
  
  let authSession: AuthSession;

  beforeEach(() => {
    authSession = new AuthSession(
      mockUserId,
      mockEmail,
      mockToken,
      mockRefreshToken,
      mockExpiresAt
    );
  });

  it('should be created with correct properties', () => {
    expect(authSession).toBeTruthy();
    expect(authSession.userId).toBe(mockUserId);
    expect(authSession.email).toBe(mockEmail);
    expect(authSession.token).toBe(mockToken);
    expect(authSession.refreshToken).toBe(mockRefreshToken);
    expect(authSession.expiresAt).toBe(mockExpiresAt);
    expect(authSession.createdAt).toBeInstanceOf(Date);
  });

  describe('isExpired', () => {
    it('should return false when session is not expired', () => {
      expect(authSession.isExpired()).toBeFalse();
    });

    it('should return true when session is expired', () => {
      const expiredSession = new AuthSession(
        mockUserId,
        mockEmail,
        mockToken,
        mockRefreshToken,
        new Date(Date.now() - 1000) // 1 second ago
      );
      expect(expiredSession.isExpired()).toBeTrue();
    });
  });

  describe('isValid', () => {
    it('should return true when token is valid and not expired', () => {
      expect(authSession.isValid()).toBeTrue();
    });

    it('should return false when token is empty', () => {
      const invalidSession = new AuthSession(
        mockUserId,
        mockEmail,
        '', // Empty token
        mockRefreshToken,
        mockExpiresAt
      );
      expect(invalidSession.isValid()).toBeFalse();
    });

    it('should return false when session is expired', () => {
      const expiredSession = new AuthSession(
        mockUserId,
        mockEmail,
        mockToken,
        mockRefreshToken,
        new Date(Date.now() - 1000) // 1 second ago
      );
      expect(expiredSession.isValid()).toBeFalse();
    });
  });

  describe('toPlainObject', () => {
    it('should return a plain object with session data', () => {
      const plainObject = authSession.toPlainObject();
      
      expect(plainObject).toEqual({
        userId: mockUserId.value,
        email: mockEmail.value,
        token: mockToken,
        refreshToken: mockRefreshToken,
        expiresAt: mockExpiresAt,
        createdAt: authSession.createdAt,
        isExpired: authSession.isExpired(),
        isValid: authSession.isValid()
      });
    });
  });

  it('should use current date as default for createdAt', () => {
    const beforeCreation = new Date();
    const session = new AuthSession(
      mockUserId,
      mockEmail,
      mockToken,
      mockRefreshToken,
      mockExpiresAt
    );
    const afterCreation = new Date();

    expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(session.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});
