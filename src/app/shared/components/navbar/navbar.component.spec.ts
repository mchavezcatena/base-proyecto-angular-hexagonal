import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { GlobalStateService } from '../../services/global.service';
import { AUTH_SERVICE_PORT } from '../../../core/application';
import { AuthService } from '../../../infrastructure/services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockRouter: any;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAuthServicePort: any;
  let routerEvents: Subject<any>;

  beforeEach(async () => {
    // Create mock services
    routerEvents = new Subject();
    mockRouter = {
      events: routerEvents.asObservable(),
      navigate: jasmine.createSpy('navigate'),
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('')
    };

    const mockActivatedRoute = {
      snapshot: {},
      params: of({}),
      queryParams: of({}),
      fragment: of({}),
      data: of({})
    };

    const mockCurrentSession = {
      userId: { value: '123' },
      email: { value: 'test@example.com' },
      token: 'test-token',
      user: {
        id: { value: '123' },
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user']
      }
    };

    mockGlobalState = jasmine.createSpyObj('GlobalStateService', [
      'setAuthSession',
      'setAuthLoading',
      'logout',
      'toggleMobileMenu',
      'setMobileMenuOpen',
      'toggleTheme',
      'setAuthError'
    ], {
      currentSession: jasmine.createSpy().and.returnValue(mockCurrentSession),
      mobileMenuOpen: jasmine.createSpy().and.returnValue(false),
      currentTheme: jasmine.createSpy().and.returnValue('light'),
      isDarkMode: jasmine.createSpy().and.returnValue(false),
      themeIcon: jasmine.createSpy().and.returnValue('light_mode'),
      themeLabel: jasmine.createSpy().and.returnValue('Modo Claro')
    });

    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockAuthServicePort = jasmine.createSpyObj('AuthServicePort', ['getCurrentSession']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GlobalStateService, useValue: mockGlobalState },
        { provide: AUTH_SERVICE_PORT, useValue: mockAuthServicePort },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            fragment: of({}),
            data: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set up router subscription', () => {
    // Trigger router event
    routerEvents.next(new NavigationEnd(1, '/test', '/test'));
    fixture.detectChanges();

    expect(mockGlobalState.setMobileMenuOpen).toHaveBeenCalledWith(false);
    expect(mockGlobalState.setAuthSession).toHaveBeenCalled();
  });

  it('should call logout and navigate to home', fakeAsync(async () => {
    mockAuthService.logout.and.returnValue(Promise.resolve({ success: true } as any));
    
    await component.logout();
    tick();
    
    expect(mockGlobalState.setAuthLoading).toHaveBeenCalledWith(true);
    expect(mockAuthService.logout).toHaveBeenCalledWith('123');
    expect(mockGlobalState.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(mockGlobalState.setAuthLoading).toHaveBeenCalledWith(false);
  }));

  it('should handle logout error', fakeAsync(async () => {
    const error = new Error('Logout failed');
    mockAuthService.logout.and.returnValue(Promise.reject(error));
    
    await component.logout();
    tick();
    
    expect(mockGlobalState.setAuthError).toHaveBeenCalledWith('Error al cerrar sesión');
  }));

  it('should toggle mobile menu', () => {
    component.toggleMobileMenu();
    expect(mockGlobalState.toggleMobileMenu).toHaveBeenCalled();
  });

  it('should close mobile menu', () => {
    component.closeMobileMenu();
    expect(mockGlobalState.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(mockGlobalState.toggleTheme).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    (component as any).routerSubscription = { unsubscribe: unsubscribeSpy };
    
    component.ngOnDestroy();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});