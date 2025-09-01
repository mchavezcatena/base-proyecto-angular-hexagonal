import { Provider } from '@angular/core';

// Injection tokens from core application barrel export
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  AUTH_REPOSITORY,
  AUTH_SERVICE_PORT,
  USER_SERVICE_PORT,
  ROLE_SERVICE_PORT
} from '../../core/application';

// Infrastructure implementations from barrel export
import {
  UserRepositoryImpl,
  RoleRepositoryImpl,
  AuthRepositoryImpl,
  AuthService,
  UserService,
  RoleService
} from '../index';

export const INFRASTRUCTURE_PROVIDERS: Provider[] = [
  // Repository bindings
  {
    provide: USER_REPOSITORY,
    useClass: UserRepositoryImpl
  },
  {
    provide: ROLE_REPOSITORY,
    useClass: RoleRepositoryImpl
  },
  {
    provide: AUTH_REPOSITORY,
    useClass: AuthRepositoryImpl
  },

  // Service bindings
  {
    provide: AUTH_SERVICE_PORT,
    useClass: AuthService
  },
  {
    provide: USER_SERVICE_PORT,
    useClass: UserService
  },
  {
    provide: ROLE_SERVICE_PORT,
    useClass: RoleService
  }
];
