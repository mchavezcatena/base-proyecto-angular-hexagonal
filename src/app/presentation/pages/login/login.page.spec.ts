import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

import { LoginPage } from './login.page';
import { AuthServicePort } from '../../../core/application/ports/auth.service.port';
import { AUTH_SERVICE_PORT } from '../../../core/application/ports/injection-tokens';
import { GlobalStateService } from '../../../shared/services/global.service';
import { AuthSession } from '../../../core/domain/entities/auth-session.entity';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let mockAuthService: jasmine.SpyObj<AuthServicePort>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthServicePort', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const globalStateSpy = jasmine.createSpyObj('GlobalStateService', [
      'setAuthLoading', 'clearAuthError', 'setAuthSession', 'showSuccess', 'setAuthError'
    ], {
      authLoading: signal(false),
      authError: signal<string | null>(null)
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginPage,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'home', component: {} as any },
          { path: 'login', component: LoginPage }
        ])
      ],
      providers: [
        { provide: AUTH_SERVICE_PORT, useValue: authServiceSpy },
        { provide: GlobalStateService, useValue: globalStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AUTH_SERVICE_PORT) as jasmine.SpyObj<AuthServicePort>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockGlobalState = TestBed.inject(GlobalStateService) as jasmine.SpyObj<GlobalStateService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with valid form', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.isLoading()).toBeFalse();
    expect(component.errorMessage()).toBeNull();
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toBe('Iniciar Sesión');
    expect(compiled.querySelector('#email')).toBeTruthy();
    expect(compiled.querySelector('#password')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should render back to home button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector('.btn-back');

    expect(backButton).toBeTruthy();
    expect(backButton?.textContent?.trim()).toBe('← Volver al Inicio');
    expect(backButton?.getAttribute('routerLink')).toBe('/home');
  });

  it('should render test credentials', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const testCredentials = compiled.querySelector('.test-credentials');

    expect(testCredentials).toBeTruthy();
    expect(testCredentials?.querySelector('h3')?.textContent).toBe('Credenciales de Prueba:');

    const credentialTexts = Array.from(testCredentials?.querySelectorAll('p') || [])
      .map(p => p.textContent);

    expect(credentialTexts.some(text => text?.includes('admin@example.com'))).toBeTruthy();
    expect(credentialTexts.some(text => text?.includes('user@example.com'))).toBeTruthy();
  });

  it('should handle successful login', async () => {
    const mockResult = { success: true, session: {} as AuthSession };
    mockAuthService.login.and.returnValue(Promise.resolve(mockResult));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.loginForm.markAsDirty();
    component.loginForm.markAllAsTouched();

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockGlobalState.setAuthSession).toHaveBeenCalled();
    expect(mockGlobalState.showSuccess).toHaveBeenCalledWith('¡Inicio de sesión exitoso!');
  });

  it('should handle failed login', async () => {
    const mockResult = { success: false, error: 'Invalid credentials' };
    mockAuthService.login.and.returnValue(Promise.resolve(mockResult));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    component.loginForm.markAsDirty();
    component.loginForm.markAllAsTouched();

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(mockGlobalState.setAuthError).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should handle login exception', async () => {
    mockAuthService.login.and.returnValue(Promise.reject(new Error('Network error')));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.loginForm.markAsDirty();
    component.loginForm.markAllAsTouched();

    await component.onSubmit();

    expect(mockGlobalState.setAuthError).toHaveBeenCalledWith('Error inesperado. Intente nuevamente.');
  });

  it('should not submit if form is invalid', async () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123' // too short
    });
    component.loginForm.markAsDirty();
    component.loginForm.markAllAsTouched();

    await component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should validate email and password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    // Test invalid email
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTruthy();

    // Test valid email
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();

    // Test short password
    passwordControl?.setValue('123');
    expect(passwordControl?.invalid).toBeTruthy();

    // Test valid password
    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });


});
