import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleAssignmentModalComponent } from './role-assignment-modal.component';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { User } from '../../../core/domain/entities/user.entity';
import { Role } from '../../../core/domain/entities/role.entity';
import { UserId } from '../../../core/domain/value-objects/user-id.vo';
import { Email } from '../../../core/domain/value-objects/email.vo';
import { RoleId } from '../../../core/domain/value-objects/role-id.vo';

describe('RoleAssignmentModalComponent', () => {
  let component: RoleAssignmentModalComponent;
  let fixture: ComponentFixture<RoleAssignmentModalComponent>;
  let mockUserRepository: jasmine.SpyObj<UserRepositoryImpl>;

  // Datos de prueba
  const mockUser = new User(
    new UserId('user1'),
    'test@example.com',
    new Email('test@example.com'),
    true
  );
  const mockRoles = [
    new Role(new RoleId('role1'), 'Admin', 'Admin role', []),
    new Role(new RoleId('role2'), 'User', 'User role', []),
    new Role(new RoleId('role3'), 'Guest', 'Guest role', [])
  ];

  beforeEach(async () => {
    // Crear mock del repositorio
    mockUserRepository = jasmine.createSpyObj('UserRepositoryImpl', ['getUserRoles']);
    mockUserRepository.getUserRoles.and.returnValue(Promise.resolve([new RoleId('role1')]));

    await TestBed.configureTestingModule({
      imports: [RoleAssignmentModalComponent],
      providers: [
        { provide: UserRepositoryImpl, useValue: mockUserRepository }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleAssignmentModalComponent);
    component = fixture.componentInstance;

    // Configurar inputs
    component.user = mockUser;
    component.roles = mockRoles;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ===== INITIALIZATION TESTS =====
  describe('Initialization', () => {
    it('should load current user roles on init', async () => {
      await component.ngOnInit();
      expect(mockUserRepository.getUserRoles).toHaveBeenCalledWith(mockUser.id);
      expect(component.currentUserRoles()).toEqual(['role1']);
      expect(component.selectedRoleIds().has('role1')).toBeTrue();
    });

    it('should handle error when loading user roles', async () => {
      // Configurar el mock para rechazar antes de inicializar el componente
      mockUserRepository.getUserRoles.and.rejectWith(new Error('Test error'));
      spyOn(console, 'error');

      // Reinicializar el componente para que use el nuevo mock
      component.currentUserRoles.set([]); // Limpiar roles actuales
      component.selectedRoleIds.set(new Set()); // Limpiar roles seleccionados

      await component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading current user roles:',
        jasmine.any(Error)
      );
      expect(component.currentUserRoles()).toEqual([]);
      expect(component.selectedRoleIds().size).toBe(0);
    });
  });

  // ===== COMPUTED SIGNALS TESTS =====
  describe('Computed Signals', () => {
    it('should filter active roles', () => {
      const availableRoles = component.availableRoles();
      expect(availableRoles.length).toBe(3);
      expect(availableRoles.some(role => !role.isActive)).toBeFalse();
    });

    it('should count selected roles', () => {
      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.selectedRolesCount()).toBe(2);
    });

    it('should calculate role changes count', async () => {
      await component.ngOnInit(); // Carga role1 como rol actual

      // Sin cambios
      expect(component.roleChangesCount()).toBe(0);

      // Agregar un nuevo rol
      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.roleChangesCount()).toBe(1);

      // Quitar un rol existente y agregar uno nuevo
      component.selectedRoleIds.set(new Set(['role2']));
      expect(component.roleChangesCount()).toBe(2);
    });

    it('should detect if there are changes', async () => {
      await component.ngOnInit();
      expect(component.hasChanges()).toBeFalse();

      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.hasChanges()).toBeTrue();
    });
  });

  // ===== ROLE SELECTION TESTS =====
  describe('Role Selection', () => {
    it('should handle role selection changes', () => {
      // Agregar rol
      component.onRoleSelectionChange('role1', true);
      expect(component.selectedRoleIds().has('role1')).toBeTrue();
      expect(component.error()).toBeNull();

      // Quitar rol
      component.onRoleSelectionChange('role1', false);
      expect(component.selectedRoleIds().has('role1')).toBeFalse();
    });

    it('should check if role is selected', () => {
      component.selectedRoleIds.set(new Set(['role1']));
      expect(component.isRoleSelected('role1')).toBeTrue();
      expect(component.isRoleSelected('role2')).toBeFalse();
    });

    it('should check if role is currently assigned', () => {
      component.currentUserRoles.set(['role1']);
      expect(component.isRoleCurrentlyAssigned('role1')).toBeTrue();
      expect(component.isRoleCurrentlyAssigned('role2')).toBeFalse();
    });
  });

  // ===== FORM SUBMISSION TESTS =====
  describe('Form Submission', () => {
    it('should validate role selection before assignment', () => {
      component.selectedRoleIds.set(new Set());
      component.onAssignRoles();
      expect(component.error()).toBe('Debe seleccionar al menos un rol');
      expect(component.loading()).toBeFalse();
    });

    it('should emit selected roles on valid assignment', () => {
      spyOn(component.rolesAssigned, 'emit');
      component.selectedRoleIds.set(new Set(['role1', 'role2']));

      component.onAssignRoles();

      expect(component.error()).toBeNull();
      expect(component.loading()).toBeTrue();
      expect(component.rolesAssigned.emit).toHaveBeenCalledWith(['role1', 'role2']);
    });
  });

  // ===== MODAL INTERACTION TESTS =====
  describe('Modal Interaction', () => {
    it('should emit close event on cancel', () => {
      spyOn(component.modalClosed, 'emit');
      component.onCancel();
      expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should close modal on backdrop click', () => {
      spyOn(component.modalClosed, 'emit');
      const target = document.createElement('div');
      const mockEvent = {
        target: target,
        currentTarget: target, // Debe ser el mismo elemento para simular click en el backdrop
        stopPropagation: () => {}
      } as unknown as MouseEvent;

      component.onBackdropClick(mockEvent);
      expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should not close modal when clicking modal content', () => {
      spyOn(component.modalClosed, 'emit');
      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as unknown as MouseEvent;

      component.onModalClick(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.modalClosed.emit).not.toHaveBeenCalled();
    });
  });

  // ===== COMPATIBILITY METHODS TESTS =====
  describe('Compatibility Methods', () => {
    it('should return selected roles count', () => {
      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.getSelectedRolesCount()).toBe(2);
    });

    it('should return role changes count', async () => {
      await component.ngOnInit();
      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.getRoleChangesCount()).toBe(1);
    });

    it('should return if has changes', async () => {
      await component.ngOnInit();
      component.selectedRoleIds.set(new Set(['role1', 'role2']));
      expect(component.hasChangesMethod()).toBeTrue();
    });
  });
});
