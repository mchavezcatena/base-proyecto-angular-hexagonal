import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  // Inyección moderna
  public authService = inject(AuthService);

  // Usar directamente el signal del servicio
  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    console.log('HomePage - ngOnInit: Starting...');

    // Forzar la verificación del estado de autenticación
    this.authService.checkAuthState();

    console.log('HomePage - ngOnInit: Completed, isAuthenticated =', this.isAuthenticated());
  }

  IsAuth(): boolean {
    const finalState = this.authService.isAuthenticated();
    console.log('HomePage - IsAuth called:', {
      finalState,
      sessionExists: this.authService.getCurrentSession() !== null
    });

    return finalState;
  }

  // Método para forzar la actualización del estado (útil para debugging)
  forceUpdateAuthState(): void {
    console.log('HomePage - forceUpdateAuthState: Forcing update...');
    this.authService.checkAuthState();
    console.log('HomePage - forceUpdateAuthState: Updated to:', this.authService.isAuthenticated());
  }
}
