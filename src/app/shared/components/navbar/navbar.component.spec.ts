import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { AuthServicePort } from '../../../core/application/ports/auth.service.port';
import { AUTH_SERVICE_PORT } from '../../../core/application/ports/injection-tokens';
import { AuthSession } from '../../../core/domain/entities/auth-session.entity';
import { Email } from '../../../core/domain/value-objects/email.vo';
import { UserId } from '../../../core/domain/value-objects/user-id.vo';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthServicePort>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthServicePort', [
      'getCurrentSession',
      'logout'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of()
    });

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AUTH_SERVICE_PORT, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AUTH_SERVICE_PORT) as jasmine.SpyObj<AuthServicePort>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no session', () => {
    mockAuthService.getCurrentSession.and.returnValue(null);

    component.ngOnInit();

    expect(component.currentSession).toBeNull();
    expect(mockAuthService.getCurrentSession).toHaveBeenCalled();
  });

  it('should initialize with existing session', () => {
    const mockSession = new AuthSession(
      new UserId('123'),
      new Email('test@example.com'),
      'mock-token',
      'mock-refresh-token',
      new Date(Date.now() + 3600000), // 1 hour from now
      new Date()
    );
    mockAuthService.getCurrentSession.and.returnValue(mockSession);

    component.ngOnInit();

    expect(component.currentSession).toBe(mockSession);
  });

  it('should logout successfully', async () => {
    const mockSession = new AuthSession(
      new UserId('123'),
      new Email('test@example.com'),
      'mock-token',
      'mock-refresh-token',
      new Date(Date.now() + 3600000), // 1 hour from now
      new Date()
    );
    component.currentSession = mockSession;
    mockAuthService.logout.and.returnValue(Promise.resolve({ success: true }));

    await component.logout();

    expect(mockAuthService.logout).toHaveBeenCalledWith('123');
    expect(component.currentSession).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should not logout if no current session', async () => {
    component.currentSession = null;

    await component.logout();

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should show login button when no session', () => {
    component.currentSession = null;
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('.btn-primary');
    expect(loginButton).toBeTruthy();
    expect(loginButton.textContent.trim()).toBe('Iniciar Sesión');
  });

  it('should show user menu when session exists', () => {
    const mockSession = new AuthSession(
      new UserId('123'),
      new Email('test@example.com'),
      'mock-token',
      'mock-refresh-token',
      new Date(Date.now() + 3600000), // 1 hour from now
      new Date()
    );
    component.currentSession = mockSession;
    fixture.detectChanges();

    const userEmail = fixture.nativeElement.querySelector('.user-email');
    const logoutButton = fixture.nativeElement.querySelector('.btn-outline');

    expect(userEmail).toBeTruthy();
    expect(userEmail.textContent.trim()).toBe('test@example.com');
    expect(logoutButton).toBeTruthy();
    expect(logoutButton.textContent.trim()).toBe('Cerrar Sesión');
  });

  it('should show navigation links when session exists', () => {
    const mockSession = new AuthSession(
      new UserId('123'),
      new Email('test@example.com'),
      'mock-token',
      'mock-refresh-token',
      new Date(Date.now() + 3600000), // 1 hour from now
      new Date()
    );
    component.currentSession = mockSession;
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(3);
    expect(navLinks[0].textContent.trim()).toBe('Inicio');
    expect(navLinks[1].textContent.trim()).toBe('Usuarios');
    expect(navLinks[2].textContent.trim()).toBe('Roles');
  });

  it('should not show navigation links when no session', () => {
    component.currentSession = null;
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(0);
  });
});
