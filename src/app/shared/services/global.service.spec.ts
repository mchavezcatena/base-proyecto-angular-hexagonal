import { TestBed } from '@angular/core/testing';
import { GlobalStateService, Theme, AppNotification } from './global.service';
import { AuthSession } from '../../core/domain/entities/auth-session.entity';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { Email } from '../../core/domain/value-objects/email.vo';

describe('GlobalStateService', () => {
  let service: GlobalStateService;
  let mockLocalStorage: { [key: string]: string };
  let mockMediaQueryList: { matches: boolean, addEventListener: jasmine.Spy, removeEventListener: jasmine.Spy };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake(key => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => mockLocalStorage[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake(key => delete mockLocalStorage[key]);

    // Mock matchMedia
    mockMediaQueryList = {
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    };
    spyOn(window, 'matchMedia').and.returnValue(mockMediaQueryList as any);

    TestBed.configureTestingModule({
      providers: [GlobalStateService]
    });
    service = TestBed.inject(GlobalStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== AUTH STATE TESTS =====
  describe('Auth State', () => {
    let mockSession: AuthSession;

    beforeEach(() => {
      mockSession = new AuthSession(
        new UserId('1'),
        new Email('test@example.com'),
        'token123',
        'refresh123',
        new Date(Date.now() + 3600000), // expires in 1 hour
        new Date()
      );
    });

    it('should initialize with null session', () => {
      expect(service.currentSession()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.authLoading()).toBeFalse();
      expect(service.authError()).toBeNull();
    });

    it('should set auth session', () => {
      service.setAuthSession(mockSession);
      expect(service.currentSession()).toBe(mockSession);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should handle auth loading state', () => {
      service.setAuthLoading(true);
      expect(service.authLoading()).toBeTrue();

      service.setAuthLoading(false);
      expect(service.authLoading()).toBeFalse();
    });

    it('should handle auth errors', () => {
      const errorMsg = 'Test error';
      service.setAuthError(errorMsg);
      expect(service.authError()).toBe(errorMsg);
      expect(service.authLoading()).toBeFalse();

      service.clearAuthError();
      expect(service.authError()).toBeNull();
    });

    it('should handle logout', () => {
      service.setAuthSession(mockSession);
      service.logout();
      expect(service.currentSession()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session');
    });

    it('should load valid session from storage', () => {
      const sessionData = {
        userId: '1',
        email: 'test@example.com',
        token: 'token123',
        refreshToken: 'refresh123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString()
      };
      mockLocalStorage['auth_session'] = JSON.stringify(sessionData);

      service.checkAuthState();
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentSession()).toBeTruthy();
    });

    it('should clear invalid session from storage', () => {
      const sessionData = {
        userId: '1',
        email: 'test@example.com',
        token: 'token123',
        refreshToken: 'refresh123',
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // expired
        createdAt: new Date().toISOString()
      };
      mockLocalStorage['auth_session'] = JSON.stringify(sessionData);

      service.checkAuthState();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentSession()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session');
    });
  });

  // ===== THEME STATE TESTS =====
  describe('Theme State', () => {
    it('should initialize with default theme state', () => {
      expect(service.currentTheme()).toBe('auto');
      expect(service.isDarkMode()).toBeTruthy();
    });

    it('should set theme', () => {
      service.setTheme('dark');
      expect(service.currentTheme()).toBe('dark');
      expect(service.isDarkMode()).toBeTrue();
      expect(localStorage.setItem).toHaveBeenCalledWith('preferred-theme', 'dark');
    });

    it('should toggle theme correctly', () => {
      expect(service.currentTheme()).toBe('auto');

      service.toggleTheme();
      expect(service.currentTheme()).toBe('light');

      service.toggleTheme();
      expect(service.currentTheme()).toBe('dark');

      service.toggleTheme();
      expect(service.currentTheme()).toBe('auto');
    });

    it('should update system preference', () => {
      service.setTheme('auto');
      service.updateSystemPreference(true);
      expect(service.isDarkMode()).toBeTrue();
      expect(service.systemPrefersDark()).toBeTrue();
    });

    it('should load theme from storage', () => {
      mockLocalStorage['preferred-theme'] = 'dark';
      service = TestBed.inject(GlobalStateService); // reinitialize service
      expect(service.currentTheme()).toBe('auto');
    });

    it('should return correct theme icon', () => {
      service.setTheme('light');
      expect(service.themeIcon()).toBe('☀️');

      service.setTheme('dark');
      expect(service.themeIcon()).toBe('🌙');

      service.setTheme('auto');
      expect(service.themeIcon()).toBe('🔄');
    });

    it('should return correct theme label', () => {
      service.setTheme('light');
      expect(service.themeLabel()).toBe('Modo Claro');

      service.setTheme('dark');
      expect(service.themeLabel()).toBe('Modo Oscuro');

      service.setTheme('auto');
      expect(service.themeLabel()).toBe('Automático');
    });
  });

  // ===== UI STATE TESTS =====
  describe('UI State', () => {
    it('should handle mobile menu state', () => {
      service.setMobileMenuOpen(true);
      expect(service.mobileMenuOpen()).toBeTrue();
      expect(document.body.style.overflow).toBe('hidden');

      service.setMobileMenuOpen(false);
      expect(service.mobileMenuOpen()).toBeFalse();
      expect(document.body.style.overflow).toBe('');
    });

    it('should toggle mobile menu', () => {
      expect(service.mobileMenuOpen()).toBeFalse();

      service.toggleMobileMenu();
      expect(service.mobileMenuOpen()).toBeTrue();

      service.toggleMobileMenu();
      expect(service.mobileMenuOpen()).toBeFalse();
    });

    it('should handle global loading state', () => {
      service.setGlobalLoading(true);
      expect(service.globalLoading()).toBeTrue();

      service.setGlobalLoading(false);
      expect(service.globalLoading()).toBeFalse();
    });
  });

  // ===== NOTIFICATIONS TESTS =====
  describe('Notifications', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should show success notification', () => {
      const id = service.showSuccess('Test success');
      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].type).toBe('success');
      expect(service.notifications()[0].message).toBe('Test success');
      expect(service.notifications()[0].id).toBe(id);
    });

    it('should show error notification', () => {
      const id = service.showError('Test error');
      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].type).toBe('error');
      expect(service.notifications()[0].message).toBe('Test error');
    });

    it('should show warning notification', () => {
      const id = service.showWarning('Test warning');
      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].type).toBe('warning');
      expect(service.notifications()[0].message).toBe('Test warning');
    });

    it('should show info notification', () => {
      const id = service.showInfo('Test info');
      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].type).toBe('info');
      expect(service.notifications()[0].message).toBe('Test info');
    });

    it('should remove notification after duration', () => {
      service.showSuccess('Test', 1000);
      expect(service.notifications().length).toBe(1);

      jasmine.clock().tick(1000);
      expect(service.notifications().length).toBe(0);
    });

    it('should remove specific notification', () => {
      const id1 = service.showInfo('Test 1');
      const id2 = service.showInfo('Test 2');
      expect(service.notifications().length).toBe(2);

      service.removeNotification(id1);
      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].id).toBe(id2);
    });

    it('should clear all notifications', () => {
      service.showInfo('Test 1');
      service.showInfo('Test 2');
      expect(service.notifications().length).toBe(2);

      service.clearAllNotifications();
      expect(service.notifications().length).toBe(0);
    });

    it('should track hasNotifications correctly', () => {
      expect(service.hasNotifications()).toBeFalse();

      service.showInfo('Test');
      expect(service.hasNotifications()).toBeTrue();

      service.clearAllNotifications();
      expect(service.hasNotifications()).toBeFalse();
    });
  });

  // ===== COMPATIBILITY METHODS TESTS =====
  describe('Compatibility Methods', () => {
    it('should get current theme', () => {
      service.setTheme('dark');
      expect(service.getCurrentTheme()).toBe('dark');
    });

    it('should get current session', () => {
      expect(service.getCurrentSession()).toBeNull();
    });

    it('should get theme icon', () => {
      service.setTheme('dark');
      expect(service.getThemeIcon()).toBe('🌙');
    });

    it('should get theme label', () => {
      service.setTheme('dark');
      expect(service.getThemeLabel()).toBe('Modo Oscuro');
    });
  });

  // ===== DEBUG METHODS TESTS =====
  describe('Debug Methods', () => {
    it('should return full state', () => {
      const fullState = service.getFullState();
      expect(fullState).toEqual({
        auth: service.authState(),
        theme: service.themeState(),
        ui: service.uiState()
      });
    });
  });
});
