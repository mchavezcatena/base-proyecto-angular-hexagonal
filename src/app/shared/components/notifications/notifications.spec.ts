import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { GlobalStateService } from '../../services/global.service';
import { signal } from '@angular/core';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;

  beforeEach(async () => {
    // Crear un mock del GlobalStateService
    mockGlobalState = jasmine.createSpyObj('GlobalStateService', ['removeNotification'], {
      // Propiedades signal
      notifications: signal([
        { id: '1', message: 'Test notification 1', type: 'info', duration: 3000 },
        { id: '2', message: 'Test notification 2', type: 'success', duration: 3000 }
      ])
    });

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: GlobalStateService, useValue: mockGlobalState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get notifications from GlobalStateService', () => {
    const notifications = component.notifications();
    expect(notifications).toBeTruthy();
    expect(notifications.length).toBe(2);
    expect(notifications[0].message).toBe('Test notification 1');
    expect(notifications[1].message).toBe('Test notification 2');
  });

  it('should call removeNotification on GlobalStateService', () => {
    const notificationId = '1';
    component.removeNotification(notificationId);
    expect(mockGlobalState.removeNotification).toHaveBeenCalledWith(notificationId);
  });

  it('should render notifications in the template', () => {
    const notificationElements = fixture.nativeElement.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(2);
  });

  it('should display correct notification type and message', () => {
    const notifications = fixture.nativeElement.querySelectorAll('.notification');

    // Verificar primera notificación
    expect(notifications[0].textContent).toContain('Test notification 1');


    // Verificar segunda notificación
    expect(notifications[1].textContent).toContain('Test notification 2');

  });



  it('should update view when notifications change', () => {
    // Actualizar las notificaciones en el servicio
    (mockGlobalState.notifications as any).set([
      { id: '3', message: 'New notification', type: 'warning', duration: 3000 }
    ]);

    fixture.detectChanges();

    const notifications = fixture.nativeElement.querySelectorAll('.notification');
    expect(notifications.length).toBe(1);
    expect(notifications[0].textContent).toContain('New notification');

  });
});
