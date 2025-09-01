import { Injectable, signal, computed, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';

  // Signals
  public currentTheme = signal<Theme>('auto');
  public isDarkMode = computed(() => {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return false;
      case 'dark':
        return true;
      case 'auto':
      default:
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Observables para compatibilidad hacia atrás
  public currentTheme$ = toObservable(this.currentTheme);
  public isDarkMode$ = toObservable(this.isDarkMode);

  constructor() {
    this.initializeTheme();
    this.setupMediaQueryListener();

    // Effect para aplicar cambios de tema automáticamente
    effect(() => {
      this.applyThemeToDocument();
    });
  }

  private initializeTheme(): void {
    // Cargar tema guardado o usar 'auto' por defecto
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const theme = savedTheme || 'auto';

    this.setTheme(theme);
  }

  private setupMediaQueryListener(): void {
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'auto') {
        // El computed signal se actualizará automáticamente
        // Forzar actualización del DOM
        this.applyThemeToDocument();
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    // El effect se encargará de aplicar los cambios al documento
  }

  toggleTheme(): void {
    const currentTheme = this.currentTheme();
    let newTheme: Theme;

    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'auto';
        break;
      case 'auto':
      default:
        newTheme = 'light';
        break;
    }

    this.setTheme(newTheme);
  }

  // Este método ya no es necesario porque isDarkMode es un computed signal

  private applyThemeToDocument(): void {
    const isDark = this.isDarkMode();
    const theme = this.currentTheme();

    // Aplicar clase al documento
    document.documentElement.classList.toggle('dark', isDark);

    // Aplicar atributo data-theme para mayor flexibilidad
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-dark', isDark.toString());

    // Actualizar meta theme-color para navegadores móviles
    this.updateThemeColor(isDark);
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

  getCurrentTheme(): Theme {
    return this.currentTheme();
  }

  isDarkModeValue(): boolean {
    return this.isDarkMode();
  }

  getThemeIcon(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
      default:
        return '🔄';
    }
  }

  getThemeLabel(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return 'Modo Claro';
      case 'dark':
        return 'Modo Oscuro';
      case 'auto':
      default:
        return 'Automático';
    }
  }
}
