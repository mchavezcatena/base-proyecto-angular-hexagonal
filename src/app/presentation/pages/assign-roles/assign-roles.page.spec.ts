import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AssignRolesPage } from './assign-roles.page';

import { of, throwError } from 'rxjs';
import { AssignRoleToUserUseCase } from '../../../core/application/use-cases/user/assign-role-to-user.use-case';
import { User, Role, UserId, Email, RoleId } from '../../../core/domain';
import { UserService, RoleService, UserRepositoryImpl } from '../../../infrastructure';


describe('AssignRolesPage', () => {
  let component: AssignRolesPage;
  let fixture: ComponentFixture<AssignRolesPage>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let assignRoleUseCaseSpy: jasmine.SpyObj<AssignRoleToUserUseCase>;
  let userRepositorySpy: jasmine.SpyObj<UserRepositoryImpl>;

  let mockUser: User;
  let mockRole: Role;

  beforeEach(() => {
    // Create a test user
    const userId = new UserId('user-1');
    const userEmail = new Email('test@example.com');
    mockUser = new User(userId, 'Test User', userEmail, true);
    
    // Create a test role
    const roleId = new RoleId('role-1');
    mockRole = new Role(roleId, 'Admin', 'Administrator role', [], true);
  });

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers']);
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['getAllRoles']);
    assignRoleUseCaseSpy = jasmine.createSpyObj('AssignRoleToUserUseCase', ['execute']);
    userRepositorySpy = jasmine.createSpyObj('UserRepositoryImpl', ['getUserRoles']);

    await TestBed.configureTestingModule({
      imports: [AssignRolesPage],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: AssignRoleToUserUseCase, useValue: assignRoleUseCaseSpy },
        { provide: UserRepositoryImpl, useValue: userRepositorySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignRolesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadData', () => {
    it('should load users and roles successfully', fakeAsync(() => {
      // Arrange
      const users = [mockUser];
      const roles = [mockRole];
      
      userServiceSpy.getAllUsers.and.returnValue(Promise.resolve({ success: true, users }));
      roleServiceSpy.getAllRoles.and.returnValue(Promise.resolve({ success: true, roles }));
      userRepositorySpy.getUserRoles.and.returnValue(Promise.resolve([mockRole.id]));

      // Act
      component.loadData();
      tick();

      // Assert
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBeNull();
      expect(component.usersWithRoles().length).toBe(1);
      expect(component.allRoles().length).toBe(1);
      expect(component.hasUsers()).toBeTrue();
      expect(component.hasRoles()).toBeTrue();
    }));

    it('should handle error when loading users fails', fakeAsync(() => {
      // Arrange
      const errorMessage = 'Failed to load users';
      userServiceSpy.getAllUsers.and.returnValue(Promise.resolve({ 
        success: false, 
        error: errorMessage 
      }));

      // Act
      component.loadData();
      tick();

      // Assert
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBe(errorMessage);
    }));
  });

  describe('role assignment', () => {
    beforeEach(() => {
      // Setup initial data
      component['usersWithRoles'].set([{ 
        user: mockUser, 
        roles: [], 
        loading: false 
      }]);
      component['allRoles'].set([mockRole]);
    });

    it('should open role assignment modal', () => {
      // Act
      component.openRoleAssignmentModal(mockUser);

      // Assert
      expect(component.showModal()).toBeTrue();
      expect(component.selectedUser()).toEqual(mockUser);
    });

    it('should close role assignment modal', () => {
      // Act
      component.openRoleAssignmentModal(mockUser);
      component.closeModal();

      // Assert
      expect(component.showModal()).toBeFalse();
      expect(component.selectedUser()).toBeNull();
    });

    it('should assign roles to user successfully', fakeAsync(() => {
      // Arrange
      const roleIds = ['role-1'];
      assignRoleUseCaseSpy.execute.and.returnValue(Promise.resolve({ success: true }));
      spyOn(component, 'loadData').and.returnValue(Promise.resolve());
      
      // Act
      component.openRoleAssignmentModal(mockUser);
      component.onRolesAssigned(roleIds);
      tick();

      // Assert
      expect(assignRoleUseCaseSpy.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        roleIds
      });
      expect(component.loadData).toHaveBeenCalled();
      expect(component.showModal()).toBeFalse();
    }));

    it('should handle error when assigning roles fails', fakeAsync(() => {
      // Arrange
      const roleIds = ['role-1'];
      const errorMessage = 'Failed to assign roles';
      assignRoleUseCaseSpy.execute.and.returnValue(Promise.resolve({ 
        success: false, 
        error: errorMessage 
      }));
      
      // Act
      component.openRoleAssignmentModal(mockUser);
      component.onRolesAssigned(roleIds);
      tick();

      // Assert
      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBeFalse();
    }));
  });

  it('should refresh data', fakeAsync(() => {
    // Arrange
    spyOn(component, 'loadData').and.callThrough();
    
    // Act
    component.refreshData();
    tick();

    // Assert
    expect(component.loadData).toHaveBeenCalled();
  }));
});
