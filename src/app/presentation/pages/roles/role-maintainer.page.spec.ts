import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';

import { RoleMaintainerPage } from './role-maintainer.page';
import { RoleServicePort } from '../../../core/application/ports/role.service.port';
import { ROLE_SERVICE_PORT } from '../../../core/application/ports/injection-tokens';
import { Role } from '../../../core/domain/entities/role.entity';
import { RoleId } from '../../../core/domain/value-objects/role-id.vo';

describe('RoleMaintainerPage', () => {
  let component: RoleMaintainerPage;
  let fixture: ComponentFixture<RoleMaintainerPage>;
  let mockRoleService: jasmine.SpyObj<RoleServicePort>;

  const mockRole = new Role(
    new RoleId('1'),
    'Admin',
    'Administrator role',
    ['users.create', 'users.read', 'users.update', 'users.delete'],
    true
  );

  beforeEach(async () => {
    const roleServiceSpy = jasmine.createSpyObj('RoleServicePort', [
      'getAllRoles',
      'createRole',
      'updateRole',
      'deleteRole'
    ]);

    await TestBed.configureTestingModule({
      imports: [RoleMaintainerPage, ReactiveFormsModule],
      providers: [
        { provide: ROLE_SERVICE_PORT, useValue: roleServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleMaintainerPage);
    component = fixture.componentInstance;
    mockRoleService = TestBed.inject(ROLE_SERVICE_PORT) as jasmine.SpyObj<RoleServicePort>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.roles()).toEqual([]);
    expect(component.showCreateForm()).toBeFalse();
    expect(component.isLoading()).toBeFalse();
    expect(component.isLoadingRoles()).toBeFalse();
    expect(component.editingRole()).toBeNull();
    expect(component.formErrorMessage()).toBe('');
    expect(component.roleForm).toBeTruthy();
  });

  it('should load roles on init', async () => {
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [mockRole] }));

    await component.ngOnInit();

    expect(mockRoleService.getAllRoles).toHaveBeenCalled();
    expect(component.roles()).toEqual([mockRole]);
    expect(component.isLoadingRoles()).toBeFalse();
  });

  it('should handle error when loading roles', async () => {
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: false, error: 'Load error' }));

    await component.ngOnInit();

    expect(component.roles()).toEqual([]);
    expect(component.formErrorMessage()).toBe('Load error');
  });

  it('should show create form', () => {
    component.showCreateForm.set(true);
    expect(component.showCreateForm()).toBeTruthy();
    expect(component.editingRole()).toBeNull();
    expect(component.isEditMode()).toBeFalsy();
  });

  it('should reset form data on show create form', () => {
    component.showCreateForm.set(true);

    const formValue = component.roleForm.value;
    expect(formValue.name).toBe('');
    expect(formValue.description).toBe('');
    expect(component.formTitle()).toBe('Crear Rol');
  });

  it('should handle permission changes', () => {
    const mockEvent = { target: { checked: true } } as any;
    component.onPermissionChange(0, mockEvent);

    // Should trigger form update logic
    expect(component.roleForm.get('permissions')).toBeTruthy();
  });

  it('should cancel form', () => {
    component.showCreateForm.set(true);
    component.editingRole.set(mockRole);

    // Call the actual method from the component
    component.cancelEdit();

    expect(component.showCreateForm()).toBeFalsy();
    expect(component.editingRole()).toBeNull();
    expect(component.formErrorMessage()).toBe('');
  });

  it('should create role successfully', async () => {
    mockRoleService.createRole.and.returnValue(Promise.resolve({ success: true, role: mockRole }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [mockRole] }));

    component.roleForm.patchValue({
      name: 'Test Role',
      description: 'Test Description'
    });

    await component.onSubmit();

    expect(mockRoleService.createRole).toHaveBeenCalled();
    expect(component.showCreateForm()).toBeFalsy();
    expect(component.formErrorMessage()).toBe('');
  });

  it('should handle create role error', async () => {
    mockRoleService.createRole.and.returnValue(Promise.resolve({ success: false, error: 'Create error' }));

    component.roleForm.patchValue({
      name: 'Test Role',
      description: 'Test Description'
    });

    await component.onSubmit();

    expect(component.formErrorMessage()).toBe('Create error');
    expect(component.showCreateForm()).toBeTruthy();
  });

  it('should edit role', () => {
    component.editRole(mockRole);

    expect(component.editingRole()).toBe(mockRole);
    expect(component.showCreateForm()).toBeTruthy();
    expect(component.isEditMode()).toBeTruthy();
    expect(component.formTitle()).toBe('Editar Rol');
    expect(component.roleForm.get('name')?.value).toBe(mockRole.name);
    expect(component.roleForm.get('description')?.value).toBe(mockRole.description);
  });

  it('should update role successfully', async () => {
    component.editingRole.set(mockRole);
    mockRoleService.updateRole.and.returnValue(Promise.resolve({ success: true, role: mockRole }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [mockRole] }));

    component.roleForm.patchValue({
      name: 'Updated Role',
      description: 'Updated Description'
    });

    await component.onSubmit();

    expect(mockRoleService.updateRole).toHaveBeenCalled();
    expect(component.showCreateForm()).toBeFalsy();
    expect(component.editingRole()).toBeNull();
  });

  it('should delete role successfully', async () => {
    component.roles.set([mockRole]);
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ success: true }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [] }));

    await component.deleteRole(mockRole.id.value);

    expect(mockRoleService.deleteRole).toHaveBeenCalledWith(mockRole.id.value);
    expect(component.roles()).toEqual([]);
  });

  it('should handle delete role error', async () => {
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ success: false, error: 'Delete error' }));

    await component.deleteRole(mockRole.id.value);

    expect(component.formErrorMessage()).toBe('Delete error');
  });

  it('should validate form correctly', () => {
    // Empty form should be invalid
    expect(component.roleForm.valid).toBeFalsy();

    // Valid form
    component.roleForm.patchValue({
      name: 'Valid Role',
      description: 'Valid description with enough characters'
    });
    expect(component.roleForm.valid).toBeTruthy();

    // Invalid name (too short)
    component.roleForm.patchValue({
      name: 'A',
      description: 'Valid description with enough characters'
    });
    expect(component.roleForm.get('name')?.invalid).toBeTruthy();

    // Invalid description (too short)
    component.roleForm.patchValue({
      name: 'Valid Role',
      description: 'Short'
    });
    expect(component.roleForm.get('description')?.invalid).toBeTruthy();
  });

  it('should have computed signals working correctly', () => {
    // Test isEditMode
    expect(component.isEditMode()).toBeFalsy();
    component.editingRole.set(mockRole);
    expect(component.isEditMode()).toBeTruthy();

    // Test formTitle
    expect(component.formTitle()).toBe('Editar Rol');
    component.editingRole.set(null);
    expect(component.formTitle()).toBe('Crear Rol');

    // Test hasRoles
    expect(component.hasRoles()).toBeFalsy();
    component.roles.set([mockRole]);
    expect(component.hasRoles()).toBeTruthy();
  });

  it('should not submit invalid form', async () => {
    // Leave form empty (invalid)
    await component.onSubmit();

    expect(mockRoleService.createRole).not.toHaveBeenCalled();
    expect(mockRoleService.updateRole).not.toHaveBeenCalled();
  });

  it('should handle loading states correctly', async () => {
    // Test loadRoles loading state
    const getAllRolesPromise = Promise.resolve({ success: true, data: [mockRole] });
    mockRoleService.getAllRoles.and.returnValue(getAllRolesPromise);

    const loadPromise = component.loadRoles();
    expect(component.isLoadingRoles()).toBeTruthy();

    await loadPromise;
    expect(component.isLoadingRoles()).toBeFalsy();
  });

  it('should handle availablePermissions', () => {
    expect(component.availablePermissions).toBeDefined();
    expect(Array.isArray(component.availablePermissions)).toBeTruthy();
    expect(component.availablePermissions.length).toBeGreaterThan(0);
  });
});
