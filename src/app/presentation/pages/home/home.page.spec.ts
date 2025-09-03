import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal, WritableSignal } from '@angular/core';

import { HomePage } from './home.page';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { GlobalStateService } from '../../../shared/services/global.service';
import { LoginUseCase } from '../../../core/application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../../core/application/use-cases/auth/logout.use-case';
import { AUTH_REPOSITORY } from '../../../core/application';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;
  let mockAuthRepository: jasmine.SpyObj<any>;
  let isAuthenticatedSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    mockAuthRepository = jasmine.createSpyObj('AuthRepository', ['login', 'logout', 'getCurrentSession']);
    isAuthenticatedSignal = signal(false);

    mockGlobalState = jasmine.createSpyObj('GlobalStateService', [
      'setAuthLoading',
      'clearAuthError',
      'setAuthSession',
      'logout',
      'getCurrentSession',
      'checkAuthState'
    ], {
      isAuthenticated: signal(false),
      authState$: signal(false),
      authLoading: signal(false),
      authError: signal<string | null>(null)
    });

    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login',
      'logout',
      'getCurrentSession',
      'isAuthenticatedValue',
      'refreshToken',
      'getAuthState',
      'checkAuthState'
    ]);

    // Configurar el signal de isAuthenticated
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      get: () => isAuthenticatedSignal
    });

    await TestBed.configureTestingModule({
      imports: [
        HomePage,
        RouterTestingModule.withRoutes([
          { path: 'home', component: HomePage }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GlobalStateService, useValue: mockGlobalState },
        { provide: AUTH_REPOSITORY, useValue: mockAuthRepository },
        LoginUseCase,
        LogoutUseCase
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check auth state on init', () => {
    component.ngOnInit();
    expect(mockAuthService.checkAuthState).toHaveBeenCalled();
  });

  it('should return correct auth state', () => {
    isAuthenticatedSignal.set(true);
    let salida: any = {
      "_userId": {
        "_value": "1"
      },
      "_email": {
        "_value": "admin@example.com"
      },
      "_token": "token_4lzy8uqi9qq_1756822445390",
      "_refreshToken": "refresh_q7absebtwk_1756822445390",
      "_expiresAt": "2025-09-03T14:14:05.390Z",
      "_createdAt": "2025-09-02T14:14:05.390Z"
    };

    mockAuthService.getCurrentSession.and.returnValue(salida);

    expect(component.IsAuth()).toBeTruthy();
    expect(mockAuthService.getCurrentSession).toHaveBeenCalled();
  });

  it('should force update auth state', () => {
    component.forceUpdateAuthState();
    expect(mockAuthService.checkAuthState).toHaveBeenCalled();
  });
});
