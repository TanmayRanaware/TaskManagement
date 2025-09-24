import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'task-manager-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Request ID middleware for Express
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Enhanced logger with request context
export const createRequestLogger = (req: any) => {
  return {
    info: (message: string, meta?: any) => logger.info(message, { 
      requestId: req.requestId, 
      method: req.method, 
      url: req.url,
      ...meta 
    }),
    error: (message: string, meta?: any) => logger.error(message, { 
      requestId: req.requestId, 
      method: req.method, 
      url: req.url,
      ...meta 
    }),
    warn: (message: string, meta?: any) => logger.warn(message, { 
      requestId: req.requestId, 
      method: req.method, 
      url: req.url,
      ...meta 
    }),
  };
};

// Error logger middleware
export const errorLogger = (error: Error, req: any, res: any, next: any) => {
  logger.error('Unhandled Error', {
    error: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
  });
  next(error);
};