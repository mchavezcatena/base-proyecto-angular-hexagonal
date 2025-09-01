import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../../services/global.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div
          class="notification"
          [class]="'notification--' + notification.type"
          (click)="removeNotification(notification.id)">

          <div class="notification__icon">
            @switch (notification.type) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @case ('info') { ℹ️ }
            }
          </div>

          <div class="notification__content">
            <p>{{ notification.message }}</p>
            <small>{{ notification.timestamp | date:'HH:mm:ss' }}</small>
          </div>

          <button
            class="notification__close"
            (click)="removeNotification(notification.id)"
            aria-label="Cerrar notificación">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.3s ease;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification:hover {
      transform: translateX(-4px);
    }

    .notification--success {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      color: #065f46;
    }

    .notification--error {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
    }

    .notification--warning {
      background: #fefbf2;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }

    .notification--info {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }

    .notification__icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notification__content {
      flex: 1;
    }

    .notification__content p {
      margin: 0 0 4px 0;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
    }

    .notification__content small {
      opacity: 0.7;
      font-size: 12px;
    }

    .notification__close {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      opacity: 0.5;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: opacity 0.2s ease, background-color 0.2s ease;
    }

    .notification__close:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.1);
    }

    /* Dark mode styles */
    :host-context(.dark) .notification--success {
      background: #064e3b;
      border-left-color: #10b981;
      color: #a7f3d0;
    }

    :host-context(.dark) .notification--error {
      background: #7f1d1d;
      border-left-color: #ef4444;
      color: #fecaca;
    }

    :host-context(.dark) .notification--warning {
      background: #78350f;
      border-left-color: #f59e0b;
      color: #fde68a;
    }

    :host-context(.dark) .notification--info {
      background: #1e3a8a;
      border-left-color: #3b82f6;
      color: #bfdbfe;
    }

    :host-context(.dark) .notification__close:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class NotificationsComponent {
  private globalState = inject(GlobalStateService);

  notifications = this.globalState.notifications;

  removeNotification(id: string): void {
    this.globalState.removeNotification(id);
  }
}
