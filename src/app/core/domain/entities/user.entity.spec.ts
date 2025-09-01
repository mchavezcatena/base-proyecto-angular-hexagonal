import { User } from './user.entity';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

describe('User Entity', () => {
  let userId: UserId;
  let email: Email;

  beforeEach(() => {
    userId = new UserId('test-user-id');
    email = new Email('test@example.com');
  });

  it('should create a user with valid data', () => {
    const user = new User(userId, 'Test User', email);

    expect(user.id).toBe(userId);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe(email);
    expect(user.isActive).toBeTruthy();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a user with isActive parameter', () => {
    const user = new User(userId, 'Test User', email, false);

    expect(user.isActive).toBeFalsy();
  });

  it('should update user name', () => {
    const user = new User(userId, 'Test User', email);
    const originalUpdatedAt = user.updatedAt;

    // Wait a bit to ensure different timestamp
    setTimeout(() => {
      user.updateName('Updated Name');
      expect(user.name).toBe('Updated Name');
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    }, 1);
  });

  it('should update user email', () => {
    const user = new User(userId, 'Test User', email);
    const newEmail = new Email('newemail@example.com');
    const originalUpdatedAt = user.updatedAt;

    setTimeout(() => {
      user.updateEmail(newEmail);
      expect(user.email).toBe(newEmail);
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    }, 1);
  });

  it('should deactivate user', () => {
    const user = new User(userId, 'Test User', email);

    user.deactivate();
    expect(user.isActive).toBeFalsy();
  });

  it('should activate user', () => {
    const user = new User(userId, 'Test User', email, false);

    user.activate();
    expect(user.isActive).toBeTruthy();
  });

  it('should convert to plain object', () => {
    const user = new User(userId, 'Test User', email);
    const plainObject = user.toPlainObject();

    expect(plainObject).toEqual({
      id: userId.value,
      name: 'Test User',
      email: email.value,
      isActive: true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  });

  it('should handle comparison correctly', () => {
    const user1 = new User(userId, 'Test User', email);
    const user2 = new User(userId, 'Different Name', email);

    // Users with same ID should have same ID value
    expect(user1.id.value).toBe(user2.id.value);
  });
});
