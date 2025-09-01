# 🔗 Integración con Backend

## 📋 Resumen

La aplicación ahora está configurada para conectarse con endpoints de backend reales, manteniendo un sistema de **fallback automático** a datos mock en caso de que el backend no esté disponible.

## ⚙️ Configuración

### 📍 Endpoints Configurados

Los endpoints están definidos en `src/app/infrastructure/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: environment.apiUrl, // ⚠️ Configurado por ambiente
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
```

## 🔄 Funcionamiento del Fallback

### ✅ Flujo Normal (Backend Disponible)
1. La aplicación intenta conectarse al backend
2. Si la respuesta es exitosa, usa los datos del backend
3. Los datos se sincronizan con el almacenamiento local

### ⚠️ Flujo de Fallback (Backend No Disponible)
1. Si el backend no responde en 5 segundos
2. Si hay errores de conexión
3. Si el backend devuelve errores
4. **Automáticamente** usa los datos mock locales
5. La aplicación sigue funcionando normalmente

## 📡 Contratos de API Esperados

### 🔐 Autenticación

#### POST `/auth/login`
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Usuario",
      "email": "user@example.com",
      "isActive": true
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

#### POST `/auth/logout`
```json
// Request
{
  "userId": "1"
}

// Response
{
  "success": true
}
```

### 👥 Usuarios

#### GET `/users`
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### POST `/users`
```json
// Request
{
  "name": "Nuevo Usuario",
  "email": "nuevo@example.com"
}

// Response
{
  "success": true,
  "data": {
    "id": "2",
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 🔐 Roles

#### GET `/roles`
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Administrador",
      "description": "Acceso completo",
      "permissions": ["create_user", "edit_user"],
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## 🚀 Cómo Usar

### 1. Configurar tu Backend
Edita `src/app/infrastructure/config/api.config.ts` y cambia la `baseUrl` por la URL de tu backend:

```typescript
export const API_CONFIG = {
  baseUrl: environment.apiUrl, // ⚠️ Configurado por ambiente
  timeout: environment.api?.timeout || 5000, // Timeout configurable por ambiente
};
```

### 2. Implementar los Endpoints
Tu backend debe implementar los endpoints listados arriba con los contratos de datos especificados.

### 3. Probar la Integración
1. **Con Backend:** La aplicación usará datos reales
2. **Sin Backend:** La aplicación funcionará con datos mock
3. **Logs en Consola:** Verás warnings cuando use fallback

## 🔍 Debugging

### Ver Logs de Fallback
Abre las herramientas de desarrollador (F12) y revisa la consola. Verás mensajes como:

```
Backend authentication failed, using fallback: Connection timeout
Backend findAll failed, using fallback: 404 Not Found
```

### Verificar Funcionamiento
1. **Con Backend Activo:** No deberías ver warnings de fallback
2. **Sin Backend:** Verás warnings pero la app funciona normalmente
3. **Datos Sincronizados:** Los cambios se guardan localmente cuando el backend falla

## 📝 Notas Importantes

- ⏱️ **Timeout:** 5 segundos por petición
- 🔄 **Retry:** No hay reintentos automáticos (puede agregarse)
- 💾 **Persistencia:** Los datos mock no persisten entre recargas
- 🔐 **Seguridad:** Tokens se manejan en memoria (considera localStorage para persistencia)

## 🛠️ Personalización

### Cambiar Timeout
```typescript
// En api.config.ts
export const API_CONFIG = {
  timeout: 10000, // 10 segundos
  // ...
};
```

### Agregar Nuevos Endpoints
```typescript
// En api.config.ts
endpoints: {
  // ... existentes
  newModule: {
    getAll: '/new-module',
    create: '/new-module'
  }
}
```

### Modificar Manejo de Errores
Edita los archivos en `src/app/infrastructure/repositories/` para personalizar el comportamiento de fallback.
