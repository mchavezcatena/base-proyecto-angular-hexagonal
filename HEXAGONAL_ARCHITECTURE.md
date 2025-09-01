# Arquitectura Hexagonal - Aplicación Angular

## Descripción

Esta aplicación Angular implementa **Arquitectura Hexagonal** (también conocida como Ports and Adapters), que proporciona una separación clara entre la lógica de negocio y las preocupaciones técnicas.

## Estructura del Proyecto

```
src/app/
├── core/                          # 🔵 DOMINIO (Centro del hexágono)
│   ├── domain/
│   │   ├── entities/              # Entidades de dominio
│   │   │   ├── user.entity.ts
│   │   │   ├── role.entity.ts
│   │   │   └── auth-session.entity.ts
│   │   ├── value-objects/         # Value Objects
│   │   │   ├── user-id.vo.ts
│   │   │   ├── role-id.vo.ts
│   │   │   └── email.vo.ts
│   │   └── repositories/          # Interfaces de repositorios (Puertos)
│   │       ├── user.repository.ts
│   │       ├── role.repository.ts
│   │       └── auth.repository.ts
│   └── application/               # 🟡 APLICACIÓN (Casos de uso)
│       ├── use-cases/             # Casos de uso específicos
│       │   ├── auth/
│       │   ├── user/
│       │   └── role/
│       └── ports/                 # Puertos de servicios
│           ├── auth.service.port.ts
│           ├── user.service.port.ts
│           ├── role.service.port.ts
│           └── injection-tokens.ts
├── infrastructure/                # 🟢 INFRAESTRUCTURA (Adaptadores externos)
│   ├── repositories/              # Implementaciones de repositorios
│   │   ├── user.repository.impl.ts
│   │   ├── role.repository.impl.ts
│   │   └── auth.repository.impl.ts
│   ├── services/                  # Servicios de aplicación
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── initialization.service.ts
│   └── config/
│       └── dependency-injection.config.ts
└── presentation/                  # 🔴 PRESENTACIÓN (UI)
    └── pages/
        ├── login/
        ├── home/
        ├── users/
        └── roles/
```

## Capas de la Arquitectura

### 1. 🔵 Capa de Dominio (Core/Domain)
**Responsabilidad**: Contiene la lógica de negocio pura, independiente de cualquier tecnología.

#### Entidades
- `User`: Representa un usuario del sistema
- `Role`: Representa un rol con permisos
- `AuthSession`: Representa una sesión de autenticación

#### Value Objects
- `UserId`: Identificador único de usuario
- `RoleId`: Identificador único de rol  
- `Email`: Email validado

#### Repository Interfaces (Puertos)
- `UserRepository`: Operaciones de persistencia para usuarios
- `RoleRepository`: Operaciones de persistencia para roles
- `AuthRepository`: Operaciones de autenticación

### 2. 🟡 Capa de Aplicación (Core/Application)
**Responsabilidad**: Coordina las operaciones de dominio y define los casos de uso.

#### Casos de Uso
- **Auth**: `LoginUseCase`, `LogoutUseCase`
- **User**: `CreateUserUseCase`, `GetAllUsersUseCase`, `UpdateUserUseCase`
- **Role**: `CreateRoleUseCase`, `GetAllRolesUseCase`

#### Puertos de Servicios
- `AuthServicePort`: Interface para servicios de autenticación
- `UserServicePort`: Interface para servicios de usuario
- `RoleServicePort`: Interface para servicios de roles

### 3. 🟢 Capa de Infraestructura
**Responsabilidad**: Implementa los adaptadores para tecnologías específicas.

#### Repository Implementations (Adaptadores)
- `UserRepositoryImpl`: Implementación en memoria
- `RoleRepositoryImpl`: Implementación en memoria
- `AuthRepositoryImpl`: Implementación con mock

#### Servicios
- `AuthService`: Implementa `AuthServicePort`
- `UserService`: Implementa `UserServicePort`
- `RoleService`: Implementa `RoleServicePort`

### 4. 🔴 Capa de Presentación
**Responsabilidad**: Maneja la interfaz de usuario y la interacción con el usuario.

#### Páginas
- `LoginPage`: Pantalla de inicio de sesión
- `HomePage`: Dashboard principal
- `UserMaintainerPage`: Gestión de usuarios
- `RoleMaintainerPage`: Gestión de roles

## Principios Aplicados

### 1. **Inversión de Dependencias**
- Las capas internas definen interfaces (puertos)
- Las capas externas implementan esas interfaces (adaptadores)
- El dominio no depende de la infraestructura

### 2. **Separación de Responsabilidades**
- **Dominio**: Lógica de negocio pura
- **Aplicación**: Coordinación y casos de uso
- **Infraestructura**: Detalles técnicos
- **Presentación**: UI y experiencia de usuario

### 3. **Testabilidad**
- El dominio es fácil de testear (sin dependencias externas)
- Los casos de uso se pueden testear con mocks
- Los adaptadores se pueden testear independientemente

## Inyección de Dependencias

La aplicación utiliza el sistema de DI de Angular con tokens de inyección:

```typescript
// Tokens definidos en injection-tokens.ts
export const USER_REPOSITORY = new InjectionToken<UserRepository>('UserRepository');
export const AUTH_SERVICE_PORT = new InjectionToken<AuthServicePort>('AuthServicePort');

// Configuración en dependency-injection.config.ts
{
  provide: USER_REPOSITORY,
  useClass: UserRepositoryImpl
}
```

## Flujo de Datos

```
UI (Presentación) 
    ↓
Service Port (Aplicación)
    ↓  
Use Case (Aplicación)
    ↓
Entity/VO (Dominio)
    ↓
Repository Interface (Dominio)
    ↓
Repository Implementation (Infraestructura)
```

## Beneficios de esta Arquitectura

1. **Mantenibilidad**: Código organizado y fácil de entender
2. **Testabilidad**: Cada capa se puede testear independientemente
3. **Flexibilidad**: Fácil cambio de tecnologías (BD, APIs, UI)
4. **Escalabilidad**: Estructura clara para crecer
5. **Independencia**: El dominio no conoce detalles técnicos

## Credenciales de Prueba

- **Admin**: admin@example.com / admin123
- **Usuario**: user@example.com / user123
- **Test**: test@example.com / test123

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# Ejecutar tests
ng test

# Build para producción
ng build
```

## Próximas Mejoras

- [ ] Implementar persistencia real (API REST)
- [ ] Agregar autenticación JWT
- [ ] Implementar guards de ruta
- [ ] Agregar tests unitarios
- [ ] Implementar internacionalización
- [ ] Agregar logging estructurado
