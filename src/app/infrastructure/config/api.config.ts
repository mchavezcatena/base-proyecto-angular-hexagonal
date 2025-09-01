import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  timeout: environment.api?.timeout || 5000, // Timeout configurable por ambiente
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh-token',
      current: '/auth/current'
    },
    users: {
      getAll: '/users',
      getById: '/users',
      create: '/users',
      update: '/users',
      delete: '/users',
      checkEmail: '/users/check-email'
    },
    roles: {
      getAll: '/roles',
      getById: '/roles',
      create: '/roles',
      update: '/roles',
      delete: '/roles',
      checkName: '/roles/check-name'
    }
  }
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}
