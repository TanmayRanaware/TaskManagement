import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { validatePasswordStrength } from '../utils/password';
import { createError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';

export const authController = {
  signup: async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw createError('Password does not meet requirements', 400, 'PASSWORD_WEAK');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw createError('User already exists', 409, 'USER_EXISTS');
    }

    // Create new user
    const user = new User({
      email,
      name,
      passwordHash: password, // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      roles: user.roles,
    });

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      tokenPair.refreshToken
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens: tokenPair,
      },
      message: 'User created successfully',
    });
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user and include password hash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      roles: user.roles,
    });

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      tokenPair.refreshToken
    );

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens: tokenPair,
      },
      message: 'Login successful',
    });
  },

  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh_token:${payload.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Get user
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const tokenPair = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      roles: user.roles,
    });

    // Update refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      tokenPair.refreshToken
    );

    res.json({
      success: true,
      data: {
        tokens: tokenPair,
      },
      message: 'Tokens refreshed successfully',
    });
  },

  logout: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const user = (req as any).user;

    if (refreshToken) {
      // Remove refresh token from Redis
      await redisClient.del(`refresh_token:${user.userId}`);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  },

  requestPasswordReset: async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
      return;
    }

    // TODO: Implement email sending
    // For now, just return success
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  },

  resetPassword: async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // TODO: Implement password reset token verification
    // For now, just return success
    res.json({
      success: true,
      message: 'Password reset successful',
    });
  },
};
