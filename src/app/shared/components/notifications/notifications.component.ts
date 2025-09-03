import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../../services/global.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  private globalState = inject(GlobalStateService);

  notifications = this.globalState.notifications;

  removeNotification(id: string): void {
    this.globalState.removeNotification(id);
  }
}
