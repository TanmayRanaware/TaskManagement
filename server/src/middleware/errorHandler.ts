import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export interface AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  message: string;
  stack?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500, code?: string): CustomError => {
  return new CustomError(message, statusCode, code);
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || 'INTERNAL_ERROR';

  // Handle different types of errors
  if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    
    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details: validationErrors,
      },
    });
    return;
  }

  // Handle MongoDB duplicate key error
  if (error.code === '11000') {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    message = 'Resource already exists';
  }

  // Handle MongoDB validation error
  if ((error as any).name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  // Handle MongoDB cast error
  if ((error as any).name === 'CastError') {
    statusCode = 400;
    code = 'CAST_ERROR';
    message = 'Invalid ID format';
  }

  // Handle JWT errors
  if ((error as any).name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if ((error as any).name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Handle Multer errors
  if ((error as any).name === 'MulterError') {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    message = 'File upload error';
  }

  // Handle rate limit errors
  if (error.message && error.message.includes('Too many requests')) {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests';
  }

  // Log error
  logger.error('Error occurred', {
    error: error.stack,
    statusCode,
    code,
    message,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: (req as any).requestId,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};