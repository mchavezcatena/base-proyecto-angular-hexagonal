import { RoleId } from '../../value-objects/role-id.vo';
import { Role } from '../role.entity';

describe('Role', () => {
  const mockRoleId = new RoleId('123e4567-e89b-12d3-a456-426614174000');
  const mockName = 'Admin';
  const mockDescription = 'Administrator role with full access';
  const mockPermissions = ['users:read', 'users:write'];
  
  let role: Role;

  beforeEach(() => {
    role = new Role(
      mockRoleId,
      mockName,
      mockDescription,
      [...mockPermissions],
      true
    );
  });

  it('should be created with correct properties', () => {
    expect(role).toBeTruthy();
    expect(role.id).toBe(mockRoleId);
    expect(role.name).toBe(mockName);
    expect(role.description).toBe(mockDescription);
    expect(role.permissions).toEqual(mockPermissions);
    expect(role.isActive).toBeTrue();
    expect(role.createdAt).toBeInstanceOf(Date);
    expect(role.updatedAt).toBeInstanceOf(Date);
  });

  describe('updateName', () => {
    it('should update the name and update timestamp', () => {
      const newName = 'Super Admin';
      const oldUpdatedAt = role.updatedAt;
      
      role.updateName(newName);
      
      expect(role.name).toBe(newName);
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should throw error when name is empty', () => {
      expect(() => role.updateName('')).toThrowError('El nombre del rol no puede estar vacío');
      expect(() => role.updateName('   ')).toThrowError('El nombre del rol no puede estar vacío');
    });
  });

  describe('updateDescription', () => {
    it('should update the description and update timestamp', () => {
      const newDescription = 'Updated description';
      const oldUpdatedAt = role.updatedAt;
      
      role.updateDescription(newDescription);
      
      expect(role.description).toBe(newDescription);
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('permissions management', () => {
    it('should add a new permission', () => {
      const newPermission = 'users:delete';
      const oldUpdatedAt = role.updatedAt;
      
      role.addPermission(newPermission);
      
      expect(role.permissions).toContain(newPermission);
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not add duplicate permissions', () => {
      const permission = 'users:read';
      const permissionCount = role.permissions.length;
      
      role.addPermission(permission);
      
      expect(role.permissions.length).toBe(permissionCount);
    });

    it('should remove a permission', () => {
      const permissionToRemove = 'users:read';
      const oldUpdatedAt = role.updatedAt;
      
      role.removePermission(permissionToRemove);
      
      expect(role.permissions).not.toContain(permissionToRemove);
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should do nothing when removing non-existent permission', () => {
      const permissionCount = role.permissions.length;
      
      role.removePermission('non:existent');
      
      expect(role.permissions.length).toBe(permissionCount);
    });
  });

  describe('activation', () => {
    it('should deactivate the role', () => {
      const oldUpdatedAt = role.updatedAt;
      
      role.deactivate();
      
      expect(role.isActive).toBeFalse();
      // Allow for the same timestamp as it might happen in the same millisecond
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should activate the role', () => {
      // First deactivate to test activation
      role.deactivate();
      const oldUpdatedAt = role.updatedAt;
      
      role.activate();
      
      expect(role.isActive).toBeTrue();
      // Allow for the same timestamp as it might happen in the same millisecond
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('toPlainObject', () => {
    it('should return a plain object with role data', () => {
      const plainObject = role.toPlainObject();
      
      expect(plainObject).toEqual({
        id: mockRoleId.value,
        name: mockName,
        description: mockDescription,
        permissions: [...mockPermissions],
        isActive: true,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      });
    });
  });

  it('should use current date as default for timestamps', () => {
    const beforeCreation = new Date();
    const testRole = new Role(
      mockRoleId,
      'Test Role',
      'Test Description'
    );
    const afterCreation = new Date();

    // Allow for the same timestamp as it might happen in the same millisecond
    expect(testRole.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(testRole.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(testRole.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(testRole.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});
