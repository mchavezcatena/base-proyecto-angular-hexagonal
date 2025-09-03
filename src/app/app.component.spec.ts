import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd, convertToParamMap, UrlSegmentGroup } from '@angular/router';
import { InitializationService } from './infrastructure/services/initialization.service';
import { GlobalStateService } from './shared/services/global.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { AUTH_REPOSITORY, AUTH_SERVICE_PORT as AUTH_SERVICE } from './core/application/ports/injection-tokens';
import { AuthService } from './infrastructure/services/auth.service';
import { AuthRepositoryImpl } from './infrastructure/repositories/auth.repository.impl';
import { LoginUseCase } from './core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from './core/application/use-cases/auth/logout.use-case';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockInitializationService: jasmine.SpyObj<InitializationService>;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerEvents: BehaviorSubject<any>;

  beforeEach(async () => {
    // Mock de InitializationService
    mockInitializationService = jasmine.createSpyObj('InitializationService', ['initializeTestData']);
    mockInitializationService.initializeTestData.and.returnValue(Promise.resolve());

    // Mock de GlobalStateService
    mockGlobalState = jasmine.createSpyObj('GlobalStateService',
      [
        'setGlobalLoading',
        'showSuccess',
        'showError',
        'removeNotification',
        'clearAllNotifications',
        'setAuthSession',
        'setAuthError',
        'setAuthLoading',
        'clearAuthError',
        'logout',
        'setTheme',
        'toggleTheme',
        'updateSystemPreference',
        'setMobileMenuOpen',
        'toggleMobileMenu',
        'themeLabel',
        'themeIcon',
        'getCurrentTheme',
        'getThemeIcon',
        'getThemeLabel',
        'getCurrentSession'
      ],
      {
        globalLoading: signal(false),
        notifications: signal([]),
        hasNotifications: signal(false),
        currentSession: signal(null),
        isAuthenticated: signal(false),
        authLoading: signal(false),
        authError: signal(null),
        currentTheme: signal('auto'),
        isDarkMode: signal(false),
        systemPrefersDark: signal(false),
        mobileMenuOpen: signal(false),
        themeState: signal({
          currentTheme: 'auto',
          isDarkMode: false,
          systemPrefersDark: false
        }),
        authState: signal({
          currentSession: null,
          isAuthenticated: false,
          loading: false,
          error: null
        }),
        uiState: signal({
          mobileMenuOpen: false,
          globalLoading: false
        })
      }
    );

    // Mock de Router con eventos
    routerEvents = new BehaviorSubject<any>(new NavigationEnd(1, '/dashboard', '/dashboard'));
    mockRouter = jasmine.createSpyObj('Router',
      [
        'navigate',
        'navigateByUrl',
        'createUrlTree',
        'serializeUrl',
        'parseUrl',
        'isActive'
      ],
      {
        events: routerEvents.asObservable(),
        url: '/dashboard',
        routerState: {
          snapshot: {
            root: {
              firstChild: null
            }
          }
        }
      }
    );

    // Configurar comportamiento de los métodos del Router
    mockRouter.createUrlTree.and.returnValue({
      root: new UrlSegmentGroup([], {}),
      queryParams: {},
      fragment: null,
      queryParamMap: convertToParamMap({})
    });
    mockRouter.serializeUrl.and.returnValue('/dashboard');
    mockRouter.parseUrl.and.returnValue({
      root: new UrlSegmentGroup([], {}),
      queryParams: {},
      fragment: null,
      queryParamMap: convertToParamMap({})
    });
    mockRouter.isActive.and.returnValue(false);

    // Mock de AuthService y AuthRepository
    const mockAuthService = jasmine.createSpyObj('AuthService',
      ['login', 'logout', 'refreshToken', 'getCurrentSession'],
      {
        isAuthenticated: signal(false),
        currentSession: signal(null),
        authLoading: signal(false),
        authError: signal(null)
      }
    );
    const mockAuthRepository = jasmine.createSpyObj('AuthRepository',
      ['authenticate', 'refreshToken', 'logout', 'getCurrentSession']
    );

    // Configurar valores de retorno para los métodos del tema
    mockGlobalState.themeLabel.and.returnValue('Automático');
    mockGlobalState.themeIcon.and.returnValue('🔄');
    mockGlobalState.getCurrentTheme.and.returnValue('auto');
    mockGlobalState.getThemeIcon.and.returnValue('🔄');
    mockGlobalState.getThemeLabel.and.returnValue('Automático');

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'login', component: {} as any },
          { path: 'dashboard', component: {} as any },
          { path: 'users', component: {} as any },
          { path: 'roles', component: {} as any },
          { path: 'assign-roles', component: {} as any }
        ]),
        NavbarComponent,
        FooterComponent,
        NotificationsComponent,
        LoadingComponent
      ],
      providers: [
        { provide: InitializationService, useValue: mockInitializationService },
        { provide: GlobalStateService, useValue: mockGlobalState },
        { provide: Router, useValue: mockRouter },
        { provide: AUTH_SERVICE, useValue: mockAuthService },
        { provide: AUTH_REPOSITORY, useValue: mockAuthRepository },
        { provide: AuthService, useValue: mockAuthService },
        LoginUseCase,
        LogoutUseCase
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial values', () => {
    expect(component.title).toBe('my-angular-app');
    expect(component.showNavbar).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      spyOn(console, 'log');
      await component.ngOnInit();

      expect(mockGlobalState.setGlobalLoading).toHaveBeenCalledWith(true);
      expect(mockInitializationService.initializeTestData).toHaveBeenCalled();
      expect(mockGlobalState.showSuccess).toHaveBeenCalledWith('Aplicación inicializada correctamente');
      expect(mockGlobalState.setGlobalLoading).toHaveBeenCalledWith(false);
      expect(console.log).toHaveBeenCalledWith('AppComponent - Initialization completed');
    });

    it('should handle initialization error', async () => {
      spyOn(console, 'error');
      const testError = new Error('Test error');
      mockInitializationService.initializeTestData.and.rejectWith(testError);

      await component.ngOnInit();

      expect(mockGlobalState.setGlobalLoading).toHaveBeenCalledWith(true);
      expect(console.error).toHaveBeenCalledWith('AppComponent - Initialization failed:', testError);
      expect(mockGlobalState.showError).toHaveBeenCalledWith('Error al inicializar la aplicación');
      expect(mockGlobalState.setGlobalLoading).toHaveBeenCalledWith(false);
    });

    it('should ensure loading is set to false even after error', async () => {
      mockInitializationService.initializeTestData.and.rejectWith(new Error('Test error'));
      await component.ngOnInit();
      expect(mockGlobalState.setGlobalLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation', () => {
    it('should hide navbar on login page', () => {
      routerEvents.next(new NavigationEnd(1, '/login', '/login'));
      expect(component.showNavbar).toBeTrue();
    });

    it('should show navbar on other pages', () => {
      routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
      expect(component.showNavbar).toBeTrue();

      routerEvents.next(new NavigationEnd(1, '/users', '/users'));
      expect(component.showNavbar).toBeTrue();
    });

    it('should handle initial route correctly', async () => {
      Object.defineProperty(mockRouter, 'url', { value: '/login' });
      await component.ngOnInit();
      expect(component.showNavbar).toBeTrue();
    });

    it('should ignore non-NavigationEnd events', () => {
      component.showNavbar = true;
      routerEvents.next({ id: 1, url: '/login' }); // Evento no NavigationEnd
      expect(component.showNavbar).toBeTrue();
    });
  });

  describe('Loading State', () => {
    it('should reflect global loading state', () => {
      (mockGlobalState.globalLoading as any).set(true);
      expect(component.isLoading()).toBeTrue();

      (mockGlobalState.globalLoading as any).set(false);
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('Template Integration', () => {


    it('should hide navbar when showNavbar is false', () => {
      component.showNavbar = false;
      fixture.detectChanges();
      const navbar = fixture.nativeElement.querySelector('app-navbar');
      expect(navbar).toBeFalsy();
    });

    it('should always show footer', () => {
      fixture.detectChanges();
      const footer = fixture.nativeElement.querySelector('app-footer');
      expect(footer).toBeTruthy();
    });
    it('should show navbar when showNavbar is true', () => {
      component.showNavbar = true;
      fixture.detectChanges();
      const navbar = fixture.nativeElement.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });
    it('should always show notifications', () => {
      fixture.detectChanges();
      const notifications = fixture.nativeElement.querySelector('app-notifications');
      expect(notifications).toBeTruthy();
    });

    it('should show loading component', () => {
      fixture.detectChanges();
      const loading = fixture.nativeElement.querySelector('app-loading');
      expect(loading).toBeTruthy();
    });
  });
});
