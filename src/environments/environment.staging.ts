export const environment = {
  production: false,
  apiUrl: 'https://api-staging.tudominio.com/api',
  environment: 'staging',
  version: '1.0.0-staging',
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
    timeout: 6000 // 6 segundos para staging
  }
};
