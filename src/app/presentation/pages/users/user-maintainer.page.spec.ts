import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { UserMaintainerPage } from './user-maintainer.page';
import { UserServicePort } from '../../../core/application/ports/user.service.port';
import { USER_SERVICE_PORT } from '../../../core/application/ports/injection-tokens';
import { User } from '../../../core/domain/entities/user.entity';
import { UserId } from '../../../core/domain/value-objects/user-id.vo';
import { Email } from '../../../core/domain/value-objects/email.vo';

describe('UserMaintainerPage', () => {
  let component: UserMaintainerPage;
  let fixture: ComponentFixture<UserMaintainerPage>;
  let mockUserService: jasmine.SpyObj<UserServicePort>;

  const mockUser = new User(
    new UserId('1'),
    'John Doe',
    new Email('john@example.com'),
    true
  );

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserServicePort', [
      'getAllUsers',
      'createUser',
      'updateUser',
      'deleteUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [UserMaintainerPage, FormsModule],
      providers: [
        { provide: USER_SERVICE_PORT, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMaintainerPage);
    component = fixture.componentInstance;
    mockUserService = TestBed.inject(USER_SERVICE_PORT) as jasmine.SpyObj<UserServicePort>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.users).toEqual([]);
    expect(component.showCreateForm).toBeFalse();
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingUsers).toBeFalse();
    expect(component.editingUser).toBeNull();
    expect(component.formErrorMessage).toBe('');
  });

  it('should load users on init', async () => {
    mockUserService.getAllUsers.and.returnValue(Promise.resolve({ success: true, data: [mockUser] }));

    await component.ngOnInit();

    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(component.users).toEqual([mockUser]);
    expect(component.isLoadingUsers).toBeFalse();
  });

  it('should handle error when loading users', async () => {
    mockUserService.getAllUsers.and.returnValue(Promise.resolve({ success: false, error: 'Error loading users' }));

    await component.ngOnInit();

    expect(component.users).toEqual([]);
    expect(component.isLoadingUsers).toBeFalse();
  });

  it('should toggle create form visibility', () => {
    expect(component.showCreateForm).toBeFalse();

    component.showCreateForm = true;
    fixture.detectChanges();

    expect(component.showCreateForm).toBeTrue();
  });

  it('should initialize form data correctly', () => {
    expect(component.userFormData).toEqual({
      name: '',
      email: ''
    });
  });

  it('should create user successfully', async () => {
    component.userFormData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    mockUserService.createUser.and.returnValue(Promise.resolve({ success: true, data: mockUser }));
    mockUserService.getAllUsers.and.returnValue(Promise.resolve({ success: true, data: [mockUser] }));

    await component.onSubmit();

    expect(mockUserService.createUser).toHaveBeenCalledWith('Test User', 'test@example.com');
    expect(component.showCreateForm).toBeFalse();
    expect(component.formErrorMessage).toBe('');
  });

  it('should handle create user error', async () => {
    component.userFormData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    mockUserService.createUser.and.returnValue(Promise.resolve({ success: false, error: 'Creation failed' }));

    await component.onSubmit();

    expect(component.formErrorMessage).toBe('Creation failed');
    expect(component.showCreateForm).toBeTrue();
  });

  it('should edit user', () => {
    component.editUser(mockUser);

    expect(component.editingUser).toBe(mockUser);
    expect(component.showCreateForm).toBeTrue();
    expect(component.userFormData.name).toBe(mockUser.name);
    expect(component.userFormData.email).toBe(mockUser.email.value);
  });

  it('should update user successfully', async () => {
    component.editingUser = mockUser;
    component.userFormData = {
      name: 'Updated User',
      email: 'updated@example.com'
    };

    mockUserService.updateUser.and.returnValue(Promise.resolve({ success: true, data: mockUser }));
    mockUserService.getAllUsers.and.returnValue(Promise.resolve({ success: true, data: [mockUser] }));

    await component.onSubmit();

    expect(mockUserService.updateUser).toHaveBeenCalledWith(
      mockUser.id.value,
      'Updated User',
      'updated@example.com'
    );
    expect(component.showCreateForm).toBeFalse();
    expect(component.editingUser).toBeNull();
  });

  it('should cancel edit', () => {
    component.editingUser = mockUser;
    component.showCreateForm = true;

    component.cancelEdit();

    expect(component.showCreateForm).toBeFalse();
    expect(component.editingUser).toBeNull();
    expect(component.formErrorMessage).toBe('');
  });

  it('should delete user successfully', async () => {
    component.users = [mockUser];
    mockUserService.deleteUser.and.returnValue(Promise.resolve({ success: true }));

    await component.deleteUser(mockUser.id.value);

    expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id.value);
    expect(component.users).toEqual([]);
  });

  it('should handle delete user error', async () => {
    const consoleSpy = spyOn(console, 'error');
    mockUserService.deleteUser.and.returnValue(Promise.resolve({ success: false, error: 'Delete failed' }));

    await component.deleteUser(mockUser.id.value);

    expect(consoleSpy).toHaveBeenCalledWith('Error al eliminar usuario:', 'Delete failed');
  });

  it('should render page header', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.page-header h1')?.textContent).toBe('Gestión de Usuarios');
    expect(compiled.querySelector('.btn-primary')?.textContent?.trim()).toBe('Nuevo Usuario');
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

  it('should show empty state when no users', () => {
    component.isLoadingUsers = false;
    component.users = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')?.textContent?.trim()).toBe('No hay usuarios registrados');
  });

  it('should show loading state', () => {
    component.isLoadingUsers = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading')?.textContent?.trim()).toBe('Cargando usuarios...');
  });

  it('should render user cards when users exist', () => {
    component.isLoadingUsers = false;
    component.users = [mockUser];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const userCards = compiled.querySelectorAll('.user-card');

    expect(userCards.length).toBe(1);
    expect(userCards[0].querySelector('h3')?.textContent).toBe(mockUser.name);
    expect(userCards[0].querySelector('.user-email')?.textContent).toBe(mockUser.email.value);
  });

  it('should show form validation errors', async () => {
    component.showCreateForm = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;

    // Trigger validation by touching fields without entering values
    nameInput.focus();
    nameInput.blur();
    emailInput.focus();
    emailInput.blur();

    fixture.detectChanges();
    await fixture.whenStable();

    const errorMessages = compiled.querySelectorAll('.error-message');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should disable submit button when form is invalid', () => {
    component.showCreateForm = true;
    component.userFormData = { name: '', email: '' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', async () => {
    component.showCreateForm = true;
    component.userFormData = { name: 'Test User', email: 'test@example.com' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;

    nameInput.value = 'Test User';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton.disabled).toBeFalse();
  });
});
