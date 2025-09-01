import { Injectable, signal, computed, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthSession } from '../../core/domain/entities/auth-session.entity';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { Email } from '../../core/domain/value-objects/email.vo';

// ===== TYPES =====
export type Theme = 'light' | 'dark' | 'auto';

// ===== INTERFACES DE ESTADO =====
export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  lastLoginAttempt: Date | null;
}

export interface ThemeState {
  currentTheme: Theme;
  isDarkMode: boolean;
  systemPrefersDark: boolean;
}

export interface UIState {
  mobileMenuOpen: boolean;
  notifications: AppNotification[];
  globalLoading: boolean;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

// ===== ESTADOS INICIALES =====
const initialAuthState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
  lastLoginAttempt: null
};

const initialThemeState: ThemeState = {
  currentTheme: 'auto',
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
};

const initialUIState: UIState = {
  mobileMenuOpen: false,
  notifications: [],
  globalLoading: false
};

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
  // ===== SIGNALS PRIVADOS =====
  private readonly _authState = signal<AuthState>(initialAuthState);
  private readonly _themeState = signal<ThemeState>(initialThemeState);
  private readonly _uiState = signal<UIState>(initialUIState);

  // ===== AUTH SELECTORS =====
  readonly authState = this._authState.asReadonly();
  readonly currentSession = computed(() => this._authState().session);
  readonly isAuthenticated = computed(() => {
    const session = this._authState().session;
    return session !== null && session.isValid();
  });
  readonly authLoading = computed(() => this._authState().isLoading);
  readonly authError = computed(() => this._authState().error);

  // ===== THEME SELECTORS =====
  readonly themeState = this._themeState.asReadonly();
  readonly currentTheme = computed(() => this._themeState().currentTheme);
  readonly isDarkMode = computed(() => this._themeState().isDarkMode);
  readonly systemPrefersDark = computed(() => this._themeState().systemPrefersDark);

  // ===== UI SELECTORS =====
  readonly uiState = this._uiState.asReadonly();
  readonly mobileMenuOpen = computed(() => this._uiState().mobileMenuOpen);
  readonly notifications = computed(() => this._uiState().notifications);
  readonly globalLoading = computed(() => this._uiState().globalLoading);
  readonly hasNotifications = computed(() => this._uiState().notifications.length > 0);

  // ===== COMPUTED DERIVADOS =====
  readonly themeIcon = computed(() => {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🔄';
      default: return '🔄';
    }
  });

  readonly themeLabel = computed(() => {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return 'Modo Claro';
      case 'dark': return 'Modo Oscuro';
      case 'auto': return 'Automático';
      default: return 'Automático';
    }
  });

  // ===== OBSERVABLES PARA COMPATIBILIDAD =====
  readonly authState$ = toObservable(this.isAuthenticated);
  readonly currentTheme$ = toObservable(this.currentTheme);
  readonly isDarkMode$ = toObservable(this.isDarkMode);

  constructor() {
    this.initializeFromStorage();
    this.setupEffects();
    this.setupMediaQueryListener();
  }

  // ===== AUTH ACTIONS =====
  setAuthSession(session: AuthSession | null): void {
    this._authState.update(state => ({
      ...state,
      session,
      error: null,
      lastLoginAttempt: session ? new Date() : state.lastLoginAttempt
    }));
  }

  setAuthLoading(loading: boolean): void {
    this._authState.update(state => ({
      ...state,
      isLoading: loading
    }));
  }

  setAuthError(error: string | null): void {
    this._authState.update(state => ({
      ...state,
      error,
      isLoading: false
    }));
  }

  clearAuthError(): void {
    this.setAuthError(null);
  }

  logout(): void {
    this._authState.update(state => ({
      ...state,
      session: null,
      error: null,
      isLoading: false
    }));
    this.clearSessionFromStorage();
  }

  // ===== THEME ACTIONS =====
  setTheme(theme: Theme): void {
    this._themeState.update(state => ({
      ...state,
      currentTheme: theme,
      isDarkMode: this.calculateIsDarkMode(theme, state.systemPrefersDark)
    }));
    localStorage.setItem('preferred-theme', theme);
  }

  toggleTheme(): void {
    const current = this.currentTheme();
    let newTheme: Theme;

    switch (current) {
      case 'light': newTheme = 'dark'; break;
      case 'dark': newTheme = 'auto'; break;
      case 'auto': newTheme = 'light'; break;
      default: newTheme = 'light'; break;
    }

    this.setTheme(newTheme);
  }

  updateSystemPreference(prefersDark: boolean): void {
    this._themeState.update(state => ({
      ...state,
      systemPrefersDark: prefersDark,
      isDarkMode: state.currentTheme === 'auto' ? prefersDark : state.isDarkMode
    }));
  }

  // ===== UI ACTIONS =====
  setMobileMenuOpen(open: boolean): void {
    this._uiState.update(state => ({
      ...state,
      mobileMenuOpen: open
    }));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggleMobileMenu(): void {
    const isOpen = this.mobileMenuOpen();
    this.setMobileMenuOpen(!isOpen);
  }

  setGlobalLoading(loading: boolean): void {
    this._uiState.update(state => ({
      ...state,
      globalLoading: loading
    }));
  }

  // ===== NOTIFICATION ACTIONS =====
  showSuccess(message: string, duration = 5000): string {
    return this.addNotification({ type: 'success', message, duration });
  }

  showError(message: string, duration = 8000): string {
    return this.addNotification({ type: 'error', message, duration });
  }

  showWarning(message: string, duration = 6000): string {
    return this.addNotification({ type: 'warning', message, duration });
  }

  showInfo(message: string, duration = 4000): string {
    return this.addNotification({ type: 'info', message, duration });
  }

  removeNotification(id: string): void {
    this._uiState.update(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }

  clearAllNotifications(): void {
    this._uiState.update(state => ({
      ...state,
      notifications: []
    }));
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====
  getCurrentTheme(): Theme {
    return this.currentTheme();
  }

  getCurrentSession(): AuthSession | null {
    return this.currentSession();
  }

  checkAuthState(): void {
    this.loadSessionFromStorage();
  }

  getThemeIcon(): string {
    return this.themeIcon();
  }

  getThemeLabel(): string {
    return this.themeLabel();
  }

  // ===== MÉTODOS PRIVADOS =====
  private addNotification(notification: Omit<AppNotification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const newNotification: AppNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    this._uiState.update(state => ({
      ...state,
      notifications: [...state.notifications, newNotification]
    }));

    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    return id;
  }

  private calculateIsDarkMode(theme: Theme, systemPrefersDark: boolean): boolean {
    switch (theme) {
      case 'light': return false;
      case 'dark': return true;
      case 'auto': return systemPrefersDark;
      default: return false;
    }
  }

  private initializeFromStorage(): void {
    // Cargar tema
    const savedTheme = localStorage.getItem('preferred-theme') as Theme;
    if (savedTheme) {
      this._themeState.update(state => ({
        ...state,
        currentTheme: savedTheme,
        isDarkMode: this.calculateIsDarkMode(savedTheme, state.systemPrefersDark)
      }));
    }

    // Cargar sesión
    this.loadSessionFromStorage();
  }

  private loadSessionFromStorage(): void {
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        const reconstructedSession = new AuthSession(
          new UserId(parsed.userId),
          new Email(parsed.email),
          parsed.token,
          parsed.refreshToken,
          new Date(parsed.expiresAt),
          new Date(parsed.createdAt)
        );

        if (reconstructedSession.isValid()) {
          this.setAuthSession(reconstructedSession);
        } else {
          this.clearSessionFromStorage();
        }
      }
    } catch (error) {
      console.error('Error loading session from storage:', error);
      this.clearSessionFromStorage();
    }
  }

  private clearSessionFromStorage(): void {
    localStorage.removeItem('auth_session');
  }

  private setupEffects(): void {
    // Effect para aplicar tema al documento
    effect(() => {
      const isDark = this.isDarkMode();
      const theme = this.currentTheme();

      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-dark', isDark.toString());

      this.updateThemeColor(isDark);
    });

    // Effect para persistir sesión
    effect(() => {
      const session = this.currentSession();
      if (session) {
        try {
          localStorage.setItem('auth_session', JSON.stringify(session.toPlainObject()));
        } catch (error) {
          console.error('Error saving session to storage:', error);
        }
      }
    });
  }

  private setupMediaQueryListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.updateSystemPreference(e.matches);
    });
  }

  private updateThemeColor(isDark: boolean): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = isDark ? '#111827' : '#ffffff';

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // ===== DEBUG =====
  getFullState() {
    return {
      auth: this._authState(),
      theme: this._themeState(),
      ui: this._uiState()
    };
  }
}
