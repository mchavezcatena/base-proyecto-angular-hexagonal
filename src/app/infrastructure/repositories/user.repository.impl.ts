import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { UserRepository } from '../../core/domain/repositories/user.repository';
import { User } from '../../core/domain/entities/user.entity';
import { UserId } from '../../core/domain/value-objects/user-id.vo';
import { Email } from '../../core/domain/value-objects/email.vo';
import { RoleId } from '../../core/domain/value-objects/role-id.vo';
import { API_CONFIG, ApiResponse, UserRequest, UserResponse } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryImpl implements UserRepository {
  private users: User[] = [];
  private userRoles: Map<string, string[]> = new Map(); // userId -> roleIds
  private isInitialized = false;

  constructor(private http: HttpClient) {
    this.initializeTestData();
  }

  async findById(id: UserId): Promise<User | null> {
    try {
      // Intentar obtener del backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<UserResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.getById}/${id.value}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findById failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return this.mapResponseToUser(response.data);
      }
    } catch (error) {
      console.warn('Backend findById error, using fallback:', error);
    }

    // Fallback: buscar en datos mock
    const user = this.users.find(u => u.id.equals(id));
    return user || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      // Intentar verificar email en backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<UserResponse>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.checkEmail}/${encodeURIComponent(email.value)}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findByEmail failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return this.mapResponseToUser(response.data);
      }
    } catch (error) {
      console.warn('Backend findByEmail error, using fallback:', error);
    }

    // Fallback: buscar en datos mock
    const user = this.users.find(u => u.email.equals(email));
    return user || null;
  }

  async findAll(): Promise<User[]> {
    try {
      // Intentar obtener todos los usuarios del backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<UserResponse[]>>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.getAll}`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend findAll failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return response.data.map(userData => this.mapResponseToUser(userData));
      }
    } catch (error) {
      console.warn('Backend findAll error, using fallback:', error);
    }

    // Fallback: devolver datos mock
    return [...this.users];
  }

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id.equals(user.id));
    const isUpdate = existingIndex >= 0;

    try {
      const userData: UserRequest = {
        name: user.name,
        email: user.email.value
      };

      let response: ApiResponse<UserResponse> | null = null;

      if (isUpdate) {
        // Actualizar usuario existente
        response = await firstValueFrom(
          this.http.put<ApiResponse<UserResponse>>(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.update}/${user.id.value}`,
            userData
          ).pipe(
            timeout(API_CONFIG.timeout),
            catchError((error: HttpErrorResponse) => {
              console.warn('Backend update failed, using fallback:', error.message);
              return of(null);
            })
          )
        );
      } else {
        // Crear nuevo usuario
        response = await firstValueFrom(
          this.http.post<ApiResponse<UserResponse>>(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.create}`,
            userData
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
        const savedUser = this.mapResponseToUser(response.data);
        // Actualizar también en datos locales
        this.saveToLocal(savedUser);
        return savedUser;
      }
    } catch (error) {
      console.warn('Backend save error, using fallback:', error);
    }

    // Fallback: guardar en datos mock
    return this.saveToLocal(user);
  }

  async delete(id: UserId): Promise<void> {
    try {
      // Intentar eliminar del backend
      const response = await firstValueFrom(
        this.http.delete<ApiResponse>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.delete}/${id.value}`
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

  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async assignRoles(userId: UserId, roleIds: RoleId[]): Promise<void> {
    try {
      // Intentar asignar roles en el backend
      const roleIdsStr = roleIds.map(r => r.value);
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(
          `${API_CONFIG.baseUrl}/users/${userId.value}/roles`,
          { roleIds: roleIdsStr }
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend assignRoles failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success) {
        // También actualizar datos locales
        this.userRoles.set(userId.value, roleIdsStr);
        return;
      }
    } catch (error) {
      console.warn('Backend assignRoles error, using fallback:', error);
    }

    // Fallback: guardar en datos locales
    this.userRoles.set(userId.value, roleIds.map(r => r.value));
  }

  async getUserRoles(userId: UserId): Promise<RoleId[]> {
    try {
      // Intentar obtener roles del backend
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ roleIds: string[] }>>(
          `${API_CONFIG.baseUrl}/users/${userId.value}/roles`
        ).pipe(
          timeout(API_CONFIG.timeout),
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend getUserRoles failed, using fallback:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success && response.data) {
        return response.data.roleIds.map(id => new RoleId(id));
      }
    } catch (error) {
      console.warn('Backend getUserRoles error, using fallback:', error);
    }

    // Fallback: obtener de datos locales
    const roleIds = this.userRoles.get(userId.value) || [];
    return roleIds.map(id => new RoleId(id));
  }

  // Métodos auxiliares para fallback
  private saveToLocal(user: User): User {
    const existingIndex = this.users.findIndex(u => u.id.equals(user.id));

    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }

    return user;
  }

  private deleteFromLocal(id: UserId): void {
    const index = this.users.findIndex(u => u.id.equals(id));
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  private mapResponseToUser(userData: UserResponse): User {
    return new User(
      new UserId(userData.id),
      userData.name,
      new Email(userData.email),
      userData.isActive,
      new Date(userData.createdAt)
    );
  }

  // Método para inicializar con datos de prueba
  initializeTestData(): void {
    if (this.isInitialized) return;

    const testUsers = [
      new User(
        new UserId('1'),
        'Juan Pérez',
        new Email('juan@example.com')
      ),
      new User(
        new UserId('2'),
        'María García',
        new Email('maria@example.com')
      ),
      new User(
        new UserId('3'),
        'Carlos López',
        new Email('carlos@example.com')
      )
    ];

    this.users = testUsers;
    this.isInitialized = true;
  }
}
