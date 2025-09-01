// src/app/shared/components/navbar/navbar.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthServicePort, AUTH_SERVICE_PORT } from '../../../core/application';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GlobalStateService } from '../../services/global.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Inyección de dependencias
  private authService = inject(AUTH_SERVICE_PORT);
  private authServiceConcrete = inject(AuthService);
  private globalState = inject(GlobalStateService);
  private router = inject(Router);

  // Usar signals del estado global
  currentSession = this.globalState.currentSession;
  isMobileMenuOpen = this.globalState.mobileMenuOpen;
  currentTheme = this.globalState.currentTheme;
  isDarkMode = this.globalState.isDarkMode;
  themeIcon = this.globalState.themeIcon;
  themeLabel = this.globalState.themeLabel;

  // Solo mantener suscripción del router
  private routerSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.updateSession();
    this.setupRouterSubscription();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    document.body.style.overflow = '';
  }

  private updateSession(): void {
    const session = this.authService.getCurrentSession();
    this.globalState.setAuthSession(session);
  }

  async logout(): Promise<void> {
    const session = this.currentSession();
    if (session) {
      console.log('NavbarComponent - logout: Starting logout...');
      this.globalState.setAuthLoading(true);

      try {
        await this.authServiceConcrete.logout(session.userId.value);
        this.globalState.logout();
        this.closeMobileMenu();
        console.log('NavbarComponent - logout: Completed');
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Logout error:', error);
        this.globalState.setAuthError('Error al cerrar sesión');
      } finally {
        this.globalState.setAuthLoading(false);
      }
    }
  }

  toggleMobileMenu(): void {
    this.globalState.toggleMobileMenu();
  }

  closeMobileMenu(): void {
    this.globalState.setMobileMenuOpen(false);
  }

  toggleTheme(): void {
    this.globalState.toggleTheme();
  }

  private setupRouterSubscription(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
        this.updateSession();
      });
  }
}
