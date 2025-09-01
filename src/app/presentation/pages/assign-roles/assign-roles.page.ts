import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/domain/entities/user.entity';
import { Role } from '../../../core/domain/entities/role.entity';
import { UserService } from '../../../infrastructure/services/user.service';
import { RoleService } from '../../../infrastructure/services/role.service';
import { AssignRoleToUserUseCase } from '../../../core/application/use-cases/user/assign-role-to-user.use-case';
import { RoleAssignmentModalComponent } from '../../components/role-assignment-modal/role-assignment-modal.component';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';

// Interface para la vista de tabla
interface UserWithRoles {
  user: User;
  roles: Role[];
  loading: boolean;
}

@Component({
  selector: 'app-assign-roles',
  standalone: true,
  imports: [CommonModule, RoleAssignmentModalComponent],
  templateUrl: './assign-roles.page.html',
  styleUrls: ['./assign-roles.page.scss']
})
export class AssignRolesPage implements OnInit {
  // Inyección moderna
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private assignRoleToUserUseCase = inject(AssignRoleToUserUseCase);
  private userRepository = inject(UserRepositoryImpl);

  // Signals
  usersWithRoles = signal<UserWithRoles[]>([]);
  allRoles = signal<Role[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal state
  showModal = signal(false);
  selectedUser = signal<User | null>(null);

  // Computed signals
  hasUsers = computed(() => this.usersWithRoles().length > 0);
  hasError = computed(() => this.error() !== null);
  hasRoles = computed(() => this.allRoles().length > 0);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Cargar usuarios y roles en paralelo
      const [usersResult, rolesResult] = await Promise.all([
        this.userService.getAllUsers(),
        this.roleService.getAllRoles()
      ]);

      if (!usersResult.success) {
        throw new Error(usersResult.error || 'Error al cargar usuarios');
      }

      if (!rolesResult.success) {
        throw new Error(rolesResult.error || 'Error al cargar roles');
      }

      const users = usersResult.users || [];
      const allRoles = rolesResult.roles || [];
      this.allRoles.set(allRoles);

      // Crear la estructura UserWithRoles y cargar roles para cada usuario
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const userWithRoles: UserWithRoles = {
            user,
            roles: [],
            loading: true
          };

          try {
            // Obtener los roles del usuario
            const userRoleIds = await this.userRepository.getUserRoles(user.id);
            userWithRoles.roles = userRoleIds
              .map(roleId => allRoles.find(role => role.id.equals(roleId)))
              .filter(role => role !== undefined) as Role[];
          } catch (error) {
            console.error(`Error loading roles for user ${user.name}:`, error);
            userWithRoles.roles = [];
          } finally {
            userWithRoles.loading = false;
          }

          return userWithRoles;
        })
      );

      this.usersWithRoles.set(usersWithRoles);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Error al cargar datos');
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openRoleAssignmentModal(user: User): void {
    this.selectedUser.set(user);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
  }

  async onRolesAssigned(roleIds: string[]): Promise<void> {
    const selectedUser = this.selectedUser();
    if (!selectedUser) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.assignRoleToUserUseCase.execute({
        userId: selectedUser.id.value,
        roleIds
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al asignar roles');
      }

      // Cerrar modal y recargar datos para mostrar los cambios
      this.closeModal();
      await this.loadData(); // Recargar para mostrar los nuevos roles
      console.log('Roles asignados exitosamente');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Error al asignar roles');
      console.error('Error assigning roles:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async refreshData(): Promise<void> {
    await this.loadData();
  }
}
