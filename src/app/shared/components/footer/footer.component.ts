import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlobalStateService } from '../../services/global.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // Inyección del servicio global
  private globalState = inject(GlobalStateService);

  // Signals para el tema
  isDarkMode = this.globalState.isDarkMode;
  currentTheme = this.globalState.currentTheme;
}
