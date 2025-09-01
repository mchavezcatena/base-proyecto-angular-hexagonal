export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  environment: 'development',
  version: '1.0.0-dev',
  enableLogging: true,
  enableDebugInfo: true,
  features: {
    enableAnalytics: false,
    enableErrorTracking: false,
    enablePerformanceMonitoring: false
  },
  auth: {
    tokenExpirationTime: 3600000, // 1 hora en ms
    refreshTokenExpirationTime: 604800000 // 7 días en ms
  },
  api: {
    timeout: 5000 // 5 segundos
  }
};
