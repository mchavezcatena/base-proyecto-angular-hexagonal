import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { RoleRepository } from '../../core/domain/repositories/role.repository';
import { Role } from '../../core/domain/entities/role.entity';
import { RoleId } from '../../core/domain/value-objects/role-id.vo';
import { API_CONFIG, ApiResponse, RoleRequest, RoleResponse } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RoleRepositoryImpl implements RoleRepository {
  private roles: Role[] = [];
  private isInitialized = false;

  constructor(private http: HttpClient) {
    this.initializeTestData();
  }

  async findById(id: RoleId): Promise<Role | null> {
    try {
      // Intentar obtener del backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<RoleResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.getById}/${id.value}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findById failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return this.mapResponseToRole(response.data);
      }
    } catch (error) {
      console.warn('Backend findById error, using fallback:', error);
    }

    // Fallback: buscar en datos mock
    const role = this.roles.find(r => r.id.equals(id));
    return role || null;
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      // Intentar verificar nombre en backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<RoleResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.checkName}/${encodeURIComponent(name)}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findByName failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return this.mapResponseToRole(response.data);
      }
    } catch (error) {
      console.warn('Backend findByName error, using fallback:', error);
    }

    // Fallback: buscar en datos mock
    const role = this.roles.find(r => r.name === name);
    return role || null;
  }

  async findAll(): Promise<Role[]> {
    try {
      // Intentar obtener todos los roles del backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<RoleResponse[]>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.getAll}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findAll failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return response.data.map(roleData => this.mapResponseToRole(roleData));
      }
    } catch (error) {
      console.warn('Backend findAll error, using fallback:', error);
    }

    // Fallback: devolver datos mock
    return [...this.roles];
  }

  async save(role: Role): Promise<Role> {
    const existingIndex = this.roles.findIndex(r => r.id.equals(role.id));
    const isUpdate = existingIndex >= 0;

    try {
      const roleData: RoleRequest = {
        name: role.name,
        description: role.description,
        permissions: role.permissions
      };

      let response: ApiResponse<RoleResponse> | null = null;

      if (isUpdate) {
        // Actualizar rol existente
        response = await firstValueFrom(
          this.http.put<ApiResponse<RoleResponse>>(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.update}/${role.id.value}`,
            roleData
          ).pipe(
            timeout(API_CONFIG.timeout),
            catchError((error: HttpErrorResponse) => {
              console.warn('Backend update failed, using fallback:', error.message);
              return of(null);
            })
          )
        );
      } else {
        // Crear nuevo rol
        response = await firstValueFrom(
          this.http.post<ApiResponse<RoleResponse>>(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.create}`,
            roleData
          ).pipe(
            timeout(API_CONFIG.timeout),
            catchError((error: HttpErrorResponse) => {
              console.warn('Backend create failed, using fallback:', error.message);
              return of(null);
            })
          )
        );
      }

      if (response && response.success && response.data) {
        const savedRole = this.mapResponseToRole(response.data);
        // Actualizar también en datos locales
        this.saveToLocal(savedRole);
        return savedRole;
      }
    } catch (error) {
      console.warn('Backend save error, using fallback:', error);
    }

    // Fallback: guardar en datos mock
    return this.saveToLocal(role);
  }

  async delete(id: RoleId): Promise<void> {
    try {
      // Intentar eliminar del backend
      const response = await firstValueFrom(
        this.http.delete<ApiResponse>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roles.delete}/${id.value}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend delete failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success) {
        // También eliminar de datos locales
        this.deleteFromLocal(id);
        return;
      }
    } catch (error) {
      console.warn('Backend delete error, using fallback:', error);
    }

    // Fallback: eliminar de datos mock
    this.deleteFromLocal(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const role = await this.findByName(name);
    return role !== null;
  }

  // Métodos auxiliares para fallback
  private saveToLocal(role: Role): Role {
    const existingIndex = this.roles.findIndex(r => r.id.equals(role.id));

    if (existingIndex >= 0) {
      this.roles[existingIndex] = role;
    } else {
      this.roles.push(role);
    }

    return role;
  }

  private deleteFromLocal(id: RoleId): void {
    const index = this.roles.findIndex(r => r.id.equals(id));
    if (index >= 0) {
      this.roles.splice(index, 1);
    }
  }

  private mapResponseToRole(roleData: RoleResponse): Role {
    return new Role(
      new RoleId(roleData.id),
      roleData.name,
      roleData.description,
      roleData.permissions,
      roleData.isActive,
      new Date(roleData.createdAt)
    );
  }

  // Método para inicializar con datos de prueba
  initializeTestData(): void {
    if (this.isInitialized) return;

    const testRoles = [
      new Role(
        new RoleId('1'),
        'Administrador',
        'Acceso completo al sistema',
        ['create_user', 'edit_user', 'delete_user', 'create_role', 'edit_role', 'delete_role']
      ),
      new Role(
        new RoleId('2'),
        'Editor',
        'Puede crear y editar contenido',
        ['create_user', 'edit_user']
      ),
      new Role(
        new RoleId('3'),
        'Visualizador',
        'Solo puede ver contenido',
        ['view_user']
      )
    ];

    this.roles = testRoles;
    this.isInitialized = true;
  }
}
