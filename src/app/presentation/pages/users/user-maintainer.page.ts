import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserServicePort, USER_SERVICE_PORT } from '../../../core/application';
import { User } from '../../../core/domain/entities/user.entity';
import { GlobalStateService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-user-maintainer-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-maintainer.page.html',
  styleUrls: ['./user-maintainer.page.scss']
})
export class UserMaintainerPage implements OnInit {
  // Inyección moderna
  private userService = inject(USER_SERVICE_PORT);
  private globalState = inject(GlobalStateService);

  // Signals
  users = signal<User[]>([]);
  showCreateForm = signal(false);
  isLoading = signal(false);
  isLoadingUsers = signal(false);
  isDeleting = signal('');
  editingUser = signal<User | null>(null);
  formErrorMessage = signal('');
  userFormData = signal({
    name: '',
    email: ''
  });

  // Computed signals
  isEditMode = computed(() => this.editingUser() !== null);
  formTitle = computed(() => this.isEditMode() ? 'Editar Usuario' : 'Crear Usuario');
  hasUsers = computed(() => this.users().length > 0);

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    this.isLoadingUsers.set(true);
    try {
      const result = await this.userService.getAllUsers();
      if (result.success) {
        this.users.set(result.users || []);
      } else {
        console.error('Error loading users:', result.error);
        this.users.set([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.users.set([]);
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  initializeFormData(): void {
    this.userFormData.set({
      name: '',
      email: ''
    });
    this.formErrorMessage.set('');
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.formErrorMessage.set('');

    try {
      let result;
      const formData = this.userFormData();
      const editingUser = this.editingUser();

      if (editingUser) {
        result = await this.userService.updateUser(
          editingUser.id.value,
          formData.name,
          formData.email
        );
      } else {
        result = await this.userService.createUser(
          formData.name,
          formData.email
        );
      }

      if (result.success) {
        this.showCreateForm.set(false);
        this.editingUser.set(null);
        this.initializeFormData();
        await this.loadUsers();

        // Mostrar notificación de éxito
        const action = editingUser ? 'actualizado' : 'creado';
        this.globalState.showSuccess(`Usuario ${action} exitosamente`);
      } else {
        this.formErrorMessage.set(result.error || 'Error al procesar usuario');
        this.globalState.showError(result.error || 'Error al procesar usuario');
      }
    } catch (error) {
      this.formErrorMessage.set('Error inesperado. Intente nuevamente.');
      console.error('User form error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.userFormData.set({
      name: user.name,
      email: user.email.value
    });
    this.showCreateForm.set(true);
    this.formErrorMessage.set('');
  }

  cancelEdit(): void {
    this.showCreateForm.set(false);
    this.editingUser.set(null);
    this.initializeFormData();
  }

  async deleteUser(userId: string): Promise<void> {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    this.isDeleting.set(userId);
    try {
      const result = await this.userService.deleteUser(userId);
      if (result.success) {
        this.users.update(users => users.filter(user => user.id.value !== userId));
        this.globalState.showSuccess('Usuario eliminado exitosamente');
      } else {
        console.error('Error al eliminar usuario:', result.error);
        this.globalState.showError(result.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      this.globalState.showError('Error inesperado al eliminar usuario');
    } finally {
      this.isDeleting.set('');
    }
  }

  // Métodos helper para el template
  updateFormName(name: string): void {
    this.userFormData.update(data => ({ ...data, name }));
  }

  updateFormEmail(email: string): void {
    this.userFormData.update(data => ({ ...data, email }));
  }
}
