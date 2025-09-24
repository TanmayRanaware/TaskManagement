import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { User } from '@/models/User';
import { createError } from './errorHandler';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401, 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw createError('Access token required', 401, 'MISSING_TOKEN');
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('_id email role isActive');
    
    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Add user to request object
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!roles.includes(req.user.role)) {
      throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without authentication
    }

    // Try to verify token
    try {
      const decoded = verifyAccessToken(token);
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId).select('_id email role isActive');
      
      if (user && user.isActive) {
        req.user = {
          _id: user._id.toString(),
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        };
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
      logger.debug('Optional auth failed:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continue even if there's an error
  }
};

export const requireActiveUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  if (!req.user.isActive) {
    throw createError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  next();
};

export const requireEmailVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const user = await User.findById(req.user._id).select('isEmailVerified');
    
    if (!user) {
      throw createError('User not found', 401, 'USER_NOT_FOUND');
    }

    if (!user.isEmailVerified) {
      throw createError('Email verification required', 403, 'EMAIL_VERIFICATION_REQUIRED');
    }

    next();
  } catch (error) {
    logger.error('Email verification check error:', error);
    next(error);
  }
};
