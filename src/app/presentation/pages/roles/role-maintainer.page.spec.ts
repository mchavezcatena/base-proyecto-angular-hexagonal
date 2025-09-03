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
    expect(component.formErrorMessage()).toBe('');
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
    // Initialize permissions array first
    const permissionsArray = component.roleForm.get('permissions') as any;
    permissionsArray.clear();
    permissionsArray.push(component['fb'].control(false));
    
    const mockEvent = { target: { checked: true } } as any;
    component.onPermissionChange(0, mockEvent);

    // Verify the permission was updated
    expect(permissionsArray.at(0).value).toBe(true);
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
    // Mock the service responses
    mockRoleService.createRole.and.returnValue(Promise.resolve({ success: true, role: mockRole }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [mockRole] }));
  
    // Show the form
    component.showCreateForm.set(true);
    
    // Set up the form with valid data
    component.roleForm.patchValue({
      name: 'Test Role',
      description: 'Test Description'
    });
    
    // Initialize permissions with some values
    const permissionsArray = component.roleForm.get('permissions') as any;
    permissionsArray.clear();
    // Add a permission control for each available permission
    component.availablePermissions.forEach(() => {
      permissionsArray.push(component['fb'].control(false));
    });
    // Set the first permission to true
    permissionsArray.at(0).setValue(true);
    
    // Manually mark form as touched to ensure validation runs
    component.roleForm.markAllAsTouched();
    
    // Submit the form
    await component.onSubmit();
    
    // Get the expected selected permissions
    const selectedPermissions = [component.availablePermissions[0].key];
    
    // Verify the service was called with the correct parameters
    expect(mockRoleService.createRole).toHaveBeenCalledWith(
      'Test Role',
      'Test Description',
      selectedPermissions
    );
    
    // Verify the form was reset
    expect(component.showCreateForm()).toBeFalsy();
    expect(component.formErrorMessage()).toBe('');
  });

  it('should handle create role error', async () => {
    // Mock a successful response with error
    mockRoleService.createRole.and.returnValue(Promise.resolve({ 
      success: false, 
      error: 'Create error' 
    }));

    // Set up form with valid data
    component.roleForm.patchValue({
      name: 'Test Role',
      description: 'Test Description'
    });
    
    // Initialize permissions
    const permissionsArray = component.roleForm.get('permissions') as any;
    permissionsArray.clear();
    component.availablePermissions.forEach(() => {
      permissionsArray.push(component['fb'].control(false));
    });

    await component.onSubmit();

    // The component should show the error from the response
    expect(component.formErrorMessage()).toBe('Create error');
    expect(component.showCreateForm()).toBeFalsy();
  });
  
  it('should handle unexpected errors', async () => {
    // Mock a rejected promise to simulate an unexpected error
    mockRoleService.createRole.and.returnValue(Promise.reject(new Error('Network error')));

    // Set up form with valid data
    component.roleForm.patchValue({
      name: 'Test Role',
      description: 'Test Description'
    });
    
    // Initialize permissions
    const permissionsArray = component.roleForm.get('permissions') as any;
    permissionsArray.clear();
    component.availablePermissions.forEach(() => {
      permissionsArray.push(component['fb'].control(false));
    });

    await component.onSubmit();

    // The component should show the generic error message
    expect(component.formErrorMessage()).toBe('Error inesperado. Intente nuevamente.');
    expect(component.showCreateForm()).toBeFalsy();
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
    // Configurar el mock para que retorne una lista inicial con el rol
    component.roles.set([mockRole]);

    // Mock de window.confirm para que retorne true
    spyOn(window, 'confirm').and.returnValue(true);

    // Configurar los mocks del servicio
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ success: true }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles: [] }));

    // Ejecutar el método de borrado
    await component.deleteRole(mockRole.id.value);

    // Verificar que se llamó a confirm
    expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar este rol?');

    // Verificar que se llamó al servicio con el ID correcto
    expect(mockRoleService.deleteRole).toHaveBeenCalledWith(mockRole.id.value);

    // Verificar que se llamó a getAllRoles después del borrado
    expect(mockRoleService.getAllRoles).toHaveBeenCalled();

    // Verificar que la lista de roles está vacía después del borrado
    expect(component.roles()).toEqual([]);

    // Verificar que isDeleting se resetea
    expect(component.isDeleting()).toBe('');
  });

  it('should handle delete role error', async () => {
    // 1. Simulamos que el usuario confirma la eliminación
    spyOn(window, 'confirm').and.returnValue(true);
    
    // 2. Espiamos el método alert
    const alertSpy = spyOn(window, 'alert');
    
    // 3. Configuramos el mock para que falle
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ 
      success: false, 
      error: 'Delete error' 
    }));
  
    // 4. Llamamos al método
    await component.deleteRole(mockRole.id.value);
  
    // 5. Verificamos que se mostró el mensaje de confirmación
    expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar este rol?');
    
    // 6. Verificamos que se llamó al servicio con el ID correcto
    expect(mockRoleService.deleteRole).toHaveBeenCalledWith(mockRole.id.value);
    
    // 7. Verificamos que se mostró el mensaje de error en un alert
    expect(alertSpy).toHaveBeenCalledWith('Delete error');
    
    // 8. Verificamos que se reseteó el estado de carga
    expect(component.isDeleting()).toBe('');
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
