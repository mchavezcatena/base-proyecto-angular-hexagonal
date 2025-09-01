import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RoleServicePort, ROLE_SERVICE_PORT } from '../../../core/application';
import { Role } from '../../../core/domain/entities/role.entity';

@Component({
  selector: 'app-role-maintainer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-maintainer.page.html',
  styleUrls: ['./role-maintainer.page.scss']


})
export class RoleMaintainerPage implements OnInit {
  // Inyección moderna
  private roleService = inject(ROLE_SERVICE_PORT);
  private fb = inject(FormBuilder);

  // Signals
  roles = signal<Role[]>([]);
  showCreateForm = signal(false);
  editingRole = signal<Role | null>(null);
  isLoading = signal(false);
  isLoadingRoles = signal(false);
  isDeleting = signal('');
  formErrorMessage = signal('');

  // Formulario reactivo
  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    permissions: this.fb.array([])
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
    if (this.isLoading() || this.roleForm.invalid) return;

    this.isLoading.set(true);
    this.formErrorMessage.set('');

    try {
      let result;
      const formValue = this.roleForm.value;
      const editingRole = this.editingRole();

      if (editingRole) {
        result = await this.roleService.updateRole(
          editingRole.id.value,
          formValue.name,
          formValue.description
        );
      } else {
        const selectedPermissions = this.getSelectedPermissions();
        result = await this.roleService.createRole(
          formValue.name,
          formValue.description,
          selectedPermissions
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
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.initializePermissions(role.permissions);
    this.showCreateForm.set(true);
    this.formErrorMessage.set('');
  }

  cancelEdit(): void {
    this.editingRole.set(null);
    this.showCreateForm.set(false);
    this.roleForm.reset();
    this.initializePermissions([]);
    this.formErrorMessage.set('');
  }

  initializePermissions(selectedPermissions: string[] = []): void {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    permissionsArray.clear();

    this.availablePermissions.forEach(permission => {
      permissionsArray.push(
        this.fb.control(selectedPermissions.includes(permission.key))
      );
    });
  }

  onPermissionChange(index: number, event: any): void {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    permissionsArray.at(index).setValue(event.target.checked);
  }

  getSelectedPermissions(): string[] {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    return this.availablePermissions
      .filter((permission, index) => permissionsArray.at(index).value)
      .map(permission => permission.key);
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

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
    this.initializePermissions();
  }

  // Getters para facilitar el acceso a los controles en el template
  get name() { return this.roleForm.get('name'); }
  get description() { return this.roleForm.get('description'); }
  get permissions() { return this.roleForm.get('permissions') as FormArray; }

  isPermissionSelected(index: number): boolean {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    return permissionsArray.at(index)?.value || false;
  }
}
