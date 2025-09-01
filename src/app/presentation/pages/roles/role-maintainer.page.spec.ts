import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

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
      imports: [RoleMaintainerPage, FormsModule],
      providers: [
        { provide: ROLE_SERVICE_PORT, useValue: roleServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleMaintainerPage);
    component = fixture.componentInstance;
    mockRoleService = TestBed.inject(ROLE_SERVICE_PORT) as jasmine.SpyObj<RoleServicePort>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.roles).toEqual([]);
    expect(component.showCreateForm).toBeFalse();
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingRoles).toBeFalse();
    expect(component.editingRole).toBeNull();
    expect(component.formErrorMessage).toBe('');
  });

  it('should load roles on init', async () => {
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, data: [mockRole] }));

    await component.ngOnInit();

    expect(mockRoleService.getAllRoles).toHaveBeenCalled();
    expect(component.roles).toEqual([mockRole]);
    expect(component.isLoadingRoles).toBeFalse();
  });

  it('should handle error when loading roles', async () => {
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: false, error: 'Error loading roles' }));

    await component.ngOnInit();

    expect(component.roles).toEqual([]);
    expect(component.isLoadingRoles).toBeFalse();
  });

  it('should toggle create form visibility', () => {
    expect(component.showCreateForm).toBeFalse();

    component.showCreateForm = true;
    fixture.detectChanges();

    expect(component.showCreateForm).toBeTrue();
  });

  it('should initialize form data correctly', () => {
    expect(component.roleFormData).toEqual({
      name: '',
      description: '',
      permissions: []
    });
  });

  it('should handle permission change', () => {
    const mockEvent = { target: { checked: true } } as any;

    component.onPermissionChange('users.read', mockEvent);

    expect(component.roleFormData.permissions).toContain('users.read');
  });

  it('should remove permission when unchecked', () => {
    component.roleFormData.permissions = ['users.read', 'users.write'];
    const mockEvent = { target: { checked: false } } as any;

    component.onPermissionChange('users.read', mockEvent);

    expect(component.roleFormData.permissions).not.toContain('users.read');
    expect(component.roleFormData.permissions).toContain('users.write');
  });

  it('should create role successfully', async () => {
    component.roleFormData = {
      name: 'Test Role',
      description: 'Test Description',
      permissions: ['users.read']
    };

    mockRoleService.createRole.and.returnValue(Promise.resolve({ success: true, data: mockRole }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, data: [mockRole] }));

    await component.onSubmit();

    expect(mockRoleService.createRole).toHaveBeenCalledWith('Test Role', 'Test Description', ['users.read']);
    expect(component.showCreateForm).toBeFalse();
    expect(component.formErrorMessage).toBe('');
  });

  it('should handle create role error', async () => {
    component.roleFormData = {
      name: 'Test Role',
      description: 'Test Description',
      permissions: ['users.read']
    };

    mockRoleService.createRole.and.returnValue(Promise.resolve({ success: false, error: 'Creation failed' }));

    await component.onSubmit();

    expect(component.formErrorMessage).toBe('Creation failed');
    expect(component.showCreateForm).toBeTrue();
  });

  it('should edit role', () => {
    component.editRole(mockRole);

    expect(component.editingRole).toBe(mockRole);
    expect(component.showCreateForm).toBeTrue();
    expect(component.roleFormData.name).toBe(mockRole.name);
    expect(component.roleFormData.description).toBe(mockRole.description);
    expect(component.roleFormData.permissions).toEqual(mockRole.permissions);
  });

  it('should update role successfully', async () => {
    component.editingRole = mockRole;
    component.roleFormData = {
      name: 'Updated Role',
      description: 'Updated Description',
      permissions: ['users.read', 'users.write']
    };

    mockRoleService.updateRole.and.returnValue(Promise.resolve({ success: true, data: mockRole }));
    mockRoleService.getAllRoles.and.returnValue(Promise.resolve({ success: true, data: [mockRole] }));

    await component.onSubmit();

    expect(mockRoleService.updateRole).toHaveBeenCalledWith(
      mockRole.id.value,
      'Updated Role',
      'Updated Description'
    );
    expect(component.showCreateForm).toBeFalse();
    expect(component.editingRole).toBeNull();
  });

  it('should cancel edit', () => {
    component.editingRole = mockRole;
    component.showCreateForm = true;

    component.cancelEdit();

    expect(component.showCreateForm).toBeFalse();
    expect(component.editingRole).toBeNull();
    expect(component.formErrorMessage).toBe('');
  });

  it('should delete role successfully', async () => {
    component.roles = [mockRole];
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ success: true }));

    await component.deleteRole(mockRole.id.value);

    expect(mockRoleService.deleteRole).toHaveBeenCalledWith(mockRole.id.value);
    expect(component.roles).toEqual([]);
  });

  it('should handle delete role error', async () => {
    const consoleSpy = spyOn(console, 'error');
    mockRoleService.deleteRole.and.returnValue(Promise.resolve({ success: false, error: 'Delete failed' }));

    await component.deleteRole(mockRole.id.value);

    expect(consoleSpy).toHaveBeenCalledWith('Error al eliminar rol:', 'Delete failed');
  });

  it('should get permission label', () => {
    expect(component.getPermissionLabel('users.create')).toBe('Crear Usuarios');
    expect(component.getPermissionLabel('users.read')).toBe('Ver Usuarios');
    expect(component.getPermissionLabel('users.update')).toBe('Editar Usuarios');
    expect(component.getPermissionLabel('users.delete')).toBe('Eliminar Usuarios');
    expect(component.getPermissionLabel('unknown.permission')).toBe('unknown.permission');
  });

  it('should render page header', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.page-header h1')?.textContent).toBe('Gestión de Roles');
    expect(compiled.querySelector('.btn-primary')?.textContent?.trim()).toBe('Nuevo Rol');
  });

  it('should show create form when button clicked', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-primary') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(component.showCreateForm).toBeTrue();
    expect(compiled.querySelector('.form-section')).toBeTruthy();
  });

  it('should show empty state when no roles', () => {
    component.isLoadingRoles = false;
    component.roles = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')?.textContent?.trim()).toBe('No hay roles registrados');
  });

  it('should show loading state', () => {
    component.isLoadingRoles = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading')?.textContent?.trim()).toBe('Cargando roles...');
  });

  it('should render role cards when roles exist', () => {
    component.isLoadingRoles = false;
    component.roles = [mockRole];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const roleCards = compiled.querySelectorAll('.role-card');

    expect(roleCards.length).toBe(1);
    expect(roleCards[0].querySelector('h3')?.textContent).toBe(mockRole.name);
    expect(roleCards[0].querySelector('.role-description')?.textContent).toBe(mockRole.description);
  });
});
