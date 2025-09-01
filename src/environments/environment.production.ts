export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',
  environment: 'production',
  version: '1.0.0',
  enableLogging: false,
  enableDebugInfo: false,
  features: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true
  },
  auth: {
    tokenExpirationTime: 7200000, // 2 horas en ms
    refreshTokenExpirationTime: 604800000 // 7 días en ms
  },
  api: {
    timeout: 5000 // 5 segundos para producción
  }
};
