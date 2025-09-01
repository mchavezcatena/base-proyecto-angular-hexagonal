import { InjectionToken } from '@angular/core';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthServicePort } from './auth.service.port';
import { UserServicePort } from './user.service.port';
import { RoleServicePort } from './role.service.port';

// Repository tokens
export const USER_REPOSITORY = new InjectionToken<UserRepository>('UserRepository');
export const ROLE_REPOSITORY = new InjectionToken<RoleRepository>('RoleRepository');
export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');

// Service tokens
export const AUTH_SERVICE_PORT = new InjectionToken<AuthServicePort>('AuthServicePort');
export const USER_SERVICE_PORT = new InjectionToken<UserServicePort>('UserServicePort');
export const ROLE_SERVICE_PORT = new InjectionToken<RoleServicePort>('RoleServicePort');
