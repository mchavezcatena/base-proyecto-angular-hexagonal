# 🔐 Sistema de Gestión de Tokens

## 📋 Resumen

Se ha implementado un sistema completo de gestión de tokens Bearer que:

- **🔑 Gestiona tokens automáticamente** en todas las peticiones HTTP
- **💾 Persiste tokens** en localStorage para mantener sesiones
- **🔄 Inyecta Bearer tokens** automáticamente en todas las peticiones a la API
- **⚡ Fallback automático** a string vacío cuando no hay token
- **🛡️ Manejo de errores 401** con refresh automático (preparado para implementar)

## 🏗️ Arquitectura Implementada

### 1. **TokenService** (`src/app/infrastructure/services/token.service.ts`)
Servicio centralizado que maneja:
- ✅ Almacenamiento seguro de tokens en localStorage
- ✅ Verificación de expiración de tokens
- ✅ Observables para reactividad
- ✅ Limpieza automática de tokens expirados

### 2. **AuthInterceptor** (`src/app/infrastructure/interceptors/auth.interceptor.ts`)
Interceptor HTTP que:
- ✅ Inyecta automáticamente `Authorization: Bearer {token}` en todas las peticiones
- ✅ Solo aplica a peticiones hacia tu API (baseUrl)
- ✅ Envía string vacío cuando no hay token: `Authorization: Bearer `
- ✅ Preparado para manejo de errores 401 y refresh automático

### 3. **Repositorios Actualizados**
- ✅ **AuthRepository**: Guarda tokens automáticamente tras login/refresh
- ✅ **UserRepository**: Recibe Bearer token automáticamente
- ✅ **RoleRepository**: Recibe Bearer token automáticamente

## 🚀 Funcionamiento

### 🔄 Flujo de Autenticación
```
1. Usuario hace login
2. Backend devuelve { token, refreshToken, expiresAt }
3. TokenService guarda tokens en localStorage
4. Todas las peticiones posteriores incluyen: Authorization: Bearer {token}
```

### 📡 Peticiones HTTP Automáticas
```typescript
// Antes (manual):
headers: { 'Authorization': `Bearer ${token}` }

// Ahora (automático):
// El interceptor inyecta automáticamente:
// Authorization: Bearer abc123token...
// o
// Authorization: Bearer  (si no hay token)
```

### 💾 Persistencia
```typescript
// Los tokens persisten entre recargas de página
// Se cargan automáticamente desde localStorage
// Se limpian automáticamente al expirar
```

## 📋 Contratos de API

### 🔐 Headers Automáticos
Todas las peticiones a tu API ahora incluyen automáticamente:

```http
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Usuario",
  "email": "usuario@example.com"
}
```

### ⚠️ Sin Token
Si no hay token, se envía:
```http
POST /api/users
Authorization: Bearer 
Content-Type: application/json
```

## 🛠️ Uso en tu Backend

### ✅ Endpoints que DEBEN manejar tokens:
```
GET    /api/users              → Requiere Bearer token
POST   /api/users              → Requiere Bearer token
PUT    /api/users/:id          → Requiere Bearer token
DELETE /api/users/:id          → Requiere Bearer token
GET    /api/roles              → Requiere Bearer token
POST   /api/roles              → Requiere Bearer token
PUT    /api/roles/:id          → Requiere Bearer token
DELETE /api/roles/:id          → Requiere Bearer token
GET    /api/auth/current       → Requiere Bearer token
POST   /api/auth/logout        → Requiere Bearer token
```

### 🔓 Endpoints SIN token requerido:
```
POST   /api/auth/login         → NO requiere token (obvio)
POST   /api/auth/refresh-token → Usa refreshToken en body
```

## 🔧 Configuración

### 📍 Cambiar URL de API
```typescript
// En src/app/infrastructure/config/api.config.ts
export const API_CONFIG = {
  baseUrl: 'https://tu-backend.com/api', // 👈 Solo estas URLs reciben tokens
  // ...
};
```

### ⏱️ Configurar Timeout
```typescript
// En api.config.ts
export const API_CONFIG = {
  timeout: 10000, // 10 segundos
  // ...
};
```

## 🔍 Testing y Debug

### Ver Tokens en Consola
```typescript
// En cualquier componente
constructor(private tokenService: TokenService) {
  console.log('Token actual:', this.tokenService.getCurrentToken());
  console.log('¿Autenticado?:', this.tokenService.isAuthenticated());
}
```

### Ver Headers en Network Tab
1. Abre DevTools (F12)
2. Ve a Network
3. Haz cualquier petición a tu API
4. Verás: `Authorization: Bearer {token}`

### Logs Automáticos
El sistema muestra logs cuando:
```
✅ "Backend authentication successful" - Token guardado
⚠️ "Backend authentication failed, using fallback" - Sin token
🔄 "Token loaded from localStorage" - Sesión restaurada
```

## 🛡️ Seguridad

### ✅ Características de Seguridad
- **Tokens en localStorage**: Persisten entre sesiones
- **Verificación de expiración**: Tokens expirados se limpian automáticamente
- **Solo API propia**: Tokens solo se envían a tu baseUrl
- **Limpieza en logout**: Tokens se eliminan completamente

### ⚠️ Consideraciones
- **localStorage**: Accesible por JavaScript (considera httpOnly cookies para mayor seguridad)
- **HTTPS**: Asegúrate de usar HTTPS en producción
- **Refresh tokens**: Implementa rotación de refresh tokens en tu backend

## 🚀 Próximos Pasos Recomendados

### 1. Implementar Refresh Automático
```typescript
// En AuthInterceptor, el método refreshToken() está preparado
// Solo necesitas implementar la llamada HTTP real
```

### 2. Agregar Logout Automático
```typescript
// Cuando recibas 401 sin refresh token válido
// Redirigir automáticamente al login
```

### 3. Notificaciones de Expiración
```typescript
// Mostrar warning cuando el token esté próximo a expirar
if (tokenService.isTokenNearExpiration()) {
  // Mostrar notificación al usuario
}
```

## 📝 Ejemplo de Implementación Backend

### Node.js/Express Middleware
```javascript
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token requerido' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Aplicar a rutas protegidas
app.get('/api/users', verifyToken, getUsersController);
app.post('/api/users', verifyToken, createUserController);
```

## ✅ Estado Actual

- **✅ Compilación exitosa**
- **✅ Tokens se inyectan automáticamente**
- **✅ Persistencia entre sesiones**
- **✅ Fallback a string vacío**
- **✅ Limpieza automática en logout**
- **✅ Compatible con arquitectura hexagonal**

Tu aplicación ahora maneja tokens de forma completamente automática y profesional. 🎉
