export const environment = {
  production: false,
  apiUrl: 'https://api-qa.tudominio.com/api',
  environment: 'qa',
  version: '1.0.0-qa',
  enableLogging: true,
  enableDebugInfo: true,
  features: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: false
  },
  auth: {
    tokenExpirationTime: 3600000, // 1 hora en ms
    refreshTokenExpirationTime: 604800000 // 7 días en ms
  },
  api: {
    timeout: 8000 // 8 segundos para QA
  }
};
