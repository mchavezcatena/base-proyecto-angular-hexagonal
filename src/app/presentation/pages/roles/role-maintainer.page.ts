import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleServicePort, ROLE_SERVICE_PORT } from '../../../core/application';
import { Role } from '../../../core/domain/entities/role.entity';

@Component({
  selector: 'app-role-maintainer-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-maintainer.page.html',
  styleUrls: ['./role-maintainer.page.scss']


})
export class RoleMaintainerPage implements OnInit {
  // Inyección moderna
  private roleService = inject(ROLE_SERVICE_PORT);

  // Signals
  roles = signal<Role[]>([]);
  showCreateForm = signal(false);
  editingRole = signal<Role | null>(null);
  isLoading = signal(false);
  isLoadingRoles = signal(false);
  isDeleting = signal('');
  formErrorMessage = signal('');
  roleFormData = signal({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Computed signals
  isEditMode = computed(() => this.editingRole() !== null);
  formTitle = computed(() => this.isEditMode() ? 'Editar Rol' : 'Crear Rol');
  hasRoles = computed(() => this.roles().length > 0);

  availablePermissions = [
    { key: 'create_user', label: 'Crear Usuario' },
    { key: 'edit_user', label: 'Editar Usuario' },
    { key: 'delete_user', label: 'Eliminar Usuario' },
    { key: 'view_user', label: 'Ver Usuario' },
    { key: 'create_role', label: 'Crear Rol' },
    { key: 'edit_role', label: 'Editar Rol' },
    { key: 'delete_role', label: 'Eliminar Rol' },
    { key: 'view_role', label: 'Ver Rol' },
    { key: 'assign_role', label: 'Asignar Rol' },
    { key: 'manage_system', label: 'Administrar Sistema' }
  ];

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    this.isLoadingRoles.set(true);
    try {
      const result = await this.roleService.getAllRoles();
      if (result.success && result.roles) {
        this.roles.set(result.roles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      this.isLoadingRoles.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.formErrorMessage.set('');

    try {
      let result;
      const formData = this.roleFormData();
      const editingRole = this.editingRole();

      if (editingRole) {
        result = await this.roleService.updateRole(
          editingRole.id.value,
          formData.name,
          formData.description
        );
      } else {
        result = await this.roleService.createRole(
          formData.name,
          formData.description,
          formData.permissions
        );
      }

      if (result.success) {
        await this.loadRoles();
        this.cancelEdit();
      } else {
        this.formErrorMessage.set(result.error || 'Error al guardar rol');
      }
    } catch (error) {
      this.formErrorMessage.set('Error inesperado. Intente nuevamente.');
      console.error('Error saving role:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  editRole(role: Role): void {
    this.editingRole.set(role);
    this.roleFormData.set({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    this.showCreateForm.set(true);
    this.formErrorMessage.set('');
  }

  cancelEdit(): void {
    this.editingRole.set(null);
    this.showCreateForm.set(false);
    this.roleFormData.set({ name: '', description: '', permissions: [] });
    this.formErrorMessage.set('');
  }

  onPermissionChange(permission: string, event: any): void {
    const formData = this.roleFormData();
    if (event.target.checked) {
      if (!formData.permissions.includes(permission)) {
        this.roleFormData.update(data => ({
          ...data,
          permissions: [...data.permissions, permission]
        }));
      }
    } else {
      this.roleFormData.update(data => ({
        ...data,
        permissions: data.permissions.filter(p => p !== permission)
      }));
    }
  }

  getPermissionLabel(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.label : permissionKey;
  }

  async deleteRole(roleId: string): Promise<void> {
    if (!confirm('¿Está seguro de que desea eliminar este rol?')) {
      return;
    }

    this.isDeleting.set(roleId);
    try {
      const result = await this.roleService.deleteRole(roleId);
      if (result.success) {
        await this.loadRoles();
      } else {
        alert(result.error || 'Error al eliminar rol');
      }
    } catch (error) {
      alert('Error inesperado al eliminar rol');
      console.error('Error deleting role:', error);
    } finally {
      this.isDeleting.set('');
    }
  }

  // Métodos helper para el template
  updateFormName(name: string): void {
    this.roleFormData.update(data => ({ ...data, name }));
  }

  updateFormDescription(description: string): void {
    this.roleFormData.update(data => ({ ...data, description }));
  }

  isPermissionSelected(permission: string): boolean {
    return this.roleFormData().permissions.includes(permission);
  }
}
