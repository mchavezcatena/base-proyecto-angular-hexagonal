import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/domain/entities/user.entity';
import { Role } from '../../../core/domain/entities/role.entity';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';

@Component({
  selector: 'app-role-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-assignment-modal.component.html',
  styleUrls: ['./role-assignment-modal.component.scss']
})
export class RoleAssignmentModalComponent implements OnInit {
  @Input() user!: User;
  @Input() roles: Role[] = [];
  @Output() rolesAssigned = new EventEmitter<string[]>();
  @Output() modalClosed = new EventEmitter<void>();

  // Inyección moderna
  private userRepository = inject(UserRepositoryImpl);

  // Signals
  selectedRoleIds = signal(new Set<string>());
  currentUserRoles = signal<string[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  availableRoles = computed(() => this.roles.filter(role => role.isActive));
  selectedRolesCount = computed(() => this.selectedRoleIds().size);
  roleChangesCount = computed(() => {
    const currentSet = new Set(this.currentUserRoles());
    const selectedSet = new Set(Array.from(this.selectedRoleIds()));

    let changes = 0;
    // Roles agregados
    selectedSet.forEach(roleId => {
      if (!currentSet.has(roleId)) {
        changes++;
      }
    });
    // Roles removidos
    currentSet.forEach(roleId => {
      if (!selectedSet.has(roleId)) {
        changes++;
      }
    });
    return changes;
  });
  hasChanges = computed(() => this.roleChangesCount() > 0);

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUserRoles();
  }

  private async loadCurrentUserRoles(): Promise<void> {
    try {
      const roleIds = await this.userRepository.getUserRoles(this.user.id);
      const roleValues = roleIds.map(r => r.value);
      this.currentUserRoles.set(roleValues);

      // Pre-seleccionar los roles actuales del usuario
      const newSelectedRoleIds = new Set(this.selectedRoleIds());
      roleValues.forEach(roleId => {
        newSelectedRoleIds.add(roleId);
      });
      this.selectedRoleIds.set(newSelectedRoleIds);
    } catch (error) {
      console.error('Error loading current user roles:', error);
      // No mostrar error, simplemente continuar sin roles pre-seleccionados
    }
  }

  onRoleSelectionChange(roleId: string, isSelected: boolean): void {
    const newSelectedRoleIds = new Set(this.selectedRoleIds());
    if (isSelected) {
      newSelectedRoleIds.add(roleId);
    } else {
      newSelectedRoleIds.delete(roleId);
    }
    this.selectedRoleIds.set(newSelectedRoleIds);
    this.error.set(null); // Limpiar error al cambiar selección
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds().has(roleId);
  }

  isRoleCurrentlyAssigned(roleId: string): boolean {
    return this.currentUserRoles().includes(roleId);
  }

  onAssignRoles(): void {
    // Validar que al menos un rol esté seleccionado
    if (this.selectedRoleIds().size === 0) {
      this.error.set('Debe seleccionar al menos un rol');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Emitir los roles seleccionados
    const selectedRoleIdsArray = Array.from(this.selectedRoleIds());
    this.rolesAssigned.emit(selectedRoleIdsArray);
  }

  onCancel(): void {
    this.modalClosed.emit();
  }

  // Cerrar modal al hacer clic en el backdrop
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  // Prevenir que el clic en el modal cierre el backdrop
  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // Estos métodos ahora son computed signals, pero mantenemos los métodos para compatibilidad
  getSelectedRolesCount(): number {
    return this.selectedRolesCount();
  }

  getRoleChangesCount(): number {
    return this.roleChangesCount();
  }

  hasChangesMethod(): boolean {
    return this.hasChanges();
  }
}
