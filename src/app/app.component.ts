import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { InitializationService } from './infrastructure/services/initialization.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { GlobalStateService } from './shared/services/global.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationsComponent, LoadingComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'my-angular-app';
  showNavbar = true;

  // Inyección moderna
  private initializationService = inject(InitializationService);
  private router = inject(Router);
  private globalState = inject(GlobalStateService);

  // Usar signals del estado global
  isLoading = this.globalState.globalLoading;

  async ngOnInit(): Promise<void> {
    console.log('AppComponent - ngOnInit: Starting...');

    this.globalState.setGlobalLoading(true);

    try {
      // Inicializar datos de prueba
      await this.initializationService.initializeTestData();

      // Verificar la ruta inicial
      this.updateNavbarVisibility(this.router.url);

      // Escuchar cambios de ruta
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.updateNavbarVisibility(event.url);
        });

      console.log('AppComponent - Initialization completed');
      this.globalState.showSuccess('Aplicación inicializada correctamente');
    } catch (error) {
      console.error('AppComponent - Initialization failed:', error);
      this.globalState.showError('Error al inicializar la aplicación');
    } finally {
      this.globalState.setGlobalLoading(false);
    }
  }

  private updateNavbarVisibility(url: string): void {
    this.showNavbar = !url.includes('/login');
  }
}
