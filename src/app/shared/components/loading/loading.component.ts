import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../../services/global.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  private globalState = inject(GlobalStateService);

  isLoading = this.globalState.globalLoading;
}
