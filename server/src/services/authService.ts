import { User } from '@/models/User';
import { ActivityLog } from '@/models/ActivityLog';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt';
import { comparePassword, validatePasswordStrength } from '@/utils/password';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
    preferences: any;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async register(data: RegisterData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw createError('Password validation failed', 400, 'PASSWORD_VALIDATION_FAILED', {
          details: passwordValidation.errors,
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: data.email.toLowerCase() },
          { username: data.username },
        ],
      });

      if (existingUser) {
        if (existingUser.email === data.email.toLowerCase()) {
          throw createError('Email already registered', 409, 'EMAIL_EXISTS');
        } else {
          throw createError('Username already taken', 409, 'USERNAME_EXISTS');
        }
      }

      // Create new user
      const user = new User({
        email: data.email.toLowerCase(),
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        tokenVersion: 1,
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.registered',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        details: {
          description: 'User registered successfully',
        },
        ipAddress,
        userAgent,
      });

      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email,
        ipAddress,
      });

      return {
        user: {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  static async login(data: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: data.emailOrUsername.toLowerCase() },
          { username: data.emailOrUsername },
        ],
      }).select('+password');

      if (!user) {
        throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (!user.isActive) {
        throw createError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      // Verify password
      const isPasswordValid = await comparePassword(data.password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.login',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        details: {
          description: 'User logged in successfully',
        },
        ipAddress,
        userAgent,
      });

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        ipAddress,
      });

      return {
        user: {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user and verify token version
      const user = await User.findById(decoded.userId).select('+tokenVersion');
      if (!user) {
        throw createError('User not found', 401, 'USER_NOT_FOUND');
      }

      if (!user.isActive) {
        throw createError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      logger.info('Tokens refreshed successfully', {
        userId: user._id,
        ipAddress,
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  static async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Increment token version to invalidate all existing tokens
      await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.logout',
        entityType: 'user',
        entityId: new mongoose.Types.ObjectId(userId),
        userId: new mongoose.Types.ObjectId(userId),
        details: {
          description: 'User logged out successfully',
        },
        ipAddress,
        userAgent,
      });

      logger.info('User logged out successfully', {
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw createError('Password validation failed', 400, 'PASSWORD_VALIDATION_FAILED', {
          details: passwordValidation.errors,
        });
      }

      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
      }

      // Update password and increment token version
      user.password = newPassword;
      user.tokenVersion += 1;
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.password_changed',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        details: {
          description: 'User changed password',
        },
        ipAddress,
        userAgent,
      });

      logger.info('Password changed successfully', {
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  static async verifyEmail(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (user.isEmailVerified) {
        throw createError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
      }

      user.isEmailVerified = true;
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.email_verified',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        details: {
          description: 'User verified email address',
        },
        ipAddress,
        userAgent,
      });

      logger.info('Email verified successfully', {
        userId,
        email: user.email,
        ipAddress,
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }
}
