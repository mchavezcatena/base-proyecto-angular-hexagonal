import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginPage } from './login.page';
import { AuthServicePort } from '../../../core/application/ports/auth.service.port';
import { AUTH_SERVICE_PORT } from '../../../core/application/ports/injection-tokens';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let mockAuthService: jasmine.SpyObj<AuthServicePort>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthServicePort', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginPage, FormsModule, RouterTestingModule],
      providers: [
        { provide: AUTH_SERVICE_PORT, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AUTH_SERVICE_PORT) as jasmine.SpyObj<AuthServicePort>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.email).toBe('');
    expect(component.credentials.password).toBe('');
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
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
    expect(backButton?.getAttribute('ng-reflect-router-link')).toBe('/home');
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
    const mockResult = { success: true };
    mockAuthService.login.and.returnValue(Promise.resolve(mockResult));

    component.credentials.email = 'test@example.com';
    component.credentials.password = 'password123';

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle failed login', async () => {
    const mockResult = { success: false, error: 'Invalid credentials' };
    mockAuthService.login.and.returnValue(Promise.resolve(mockResult));

    component.credentials.email = 'test@example.com';
    component.credentials.password = 'wrongpassword';

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle login exception', async () => {
    mockAuthService.login.and.returnValue(Promise.reject(new Error('Network error')));

    component.credentials.email = 'test@example.com';
    component.credentials.password = 'password123';

    await component.onSubmit();

    expect(component.errorMessage).toBe('Error inesperado. Intente nuevamente.');
    expect(component.isLoading).toBeFalse();
  });

  it('should not submit if already loading', async () => {
    component.isLoading = true;

    await component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should show loading state during login', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    mockAuthService.login.and.returnValue(loginPromise);

    component.credentials.email = 'test@example.com';
    component.credentials.password = 'password123';

    const submitPromise = component.onSubmit();

    expect(component.isLoading).toBeTruthy();

    resolveLogin!({ success: true });
    await submitPromise;

    expect(component.isLoading).toBeFalse();
  });
});
