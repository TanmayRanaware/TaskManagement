export { connectDatabase, disconnectDatabase } from './database';
export { connectRedis, disconnectRedis, getRedisClient, cacheService } from './redis';

export const config = {
  // Server configuration
  port: process.env.PORT || 8080,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanagement',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // File upload
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Email configuration
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'TaskManagement <noreply@taskmanagement.com>',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || './logs/app.log',
  
  // Feature flags
  features: {
    realTimeUpdates: process.env.FEATURE_REAL_TIME_UPDATES === 'true',
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
    fileUploads: process.env.FEATURE_FILE_UPLOADS === 'true',
    analytics: process.env.FEATURE_ANALYTICS === 'true',
  },
};
