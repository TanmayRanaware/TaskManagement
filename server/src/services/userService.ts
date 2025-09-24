import { User } from '@/models/User';
import { ActivityLog } from '@/models/ActivityLog';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      taskUpdates?: boolean;
      projectUpdates?: boolean;
    };
    language?: string;
    timezone?: string;
  };
}

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      return {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  static async updateUserProfile(
    userId: string,
    data: UpdateUserData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserProfile> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Check if username is being changed and if it's available
      if (data.username && data.username !== user.username) {
        const existingUser = await User.findOne({
          username: data.username,
          _id: { $ne: userId },
        });

        if (existingUser) {
          throw createError('Username already taken', 409, 'USERNAME_EXISTS');
        }
      }

      // Update user data
      const updateData: any = {};
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.username) updateData.username = data.username;
      if (data.preferences) {
        updateData.preferences = {
          ...user.preferences,
          ...data.preferences,
          notifications: {
            ...user.preferences.notifications,
            ...data.preferences.notifications,
          },
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw createError('Failed to update user', 500, 'UPDATE_FAILED');
      }

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.updated',
        entityType: 'user',
        entityId: updatedUser._id,
        userId: updatedUser._id,
        details: {
          description: 'User profile updated',
          oldValue: user.toObject(),
          newValue: updatedUser.toObject(),
        },
        ipAddress,
        userAgent,
      });

      logger.info('User profile updated', {
        userId,
        changes: Object.keys(updateData),
        ipAddress,
      });

      return {
        _id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }

  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      // Add search filter
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
        ];
      }

      // Add role filter
      if (role) {
        query.role = role;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query),
      ]);

      const userProfiles: UserProfile[] = users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return {
        users: userProfiles,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<UserProfile> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      return {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  static async deactivateUser(
    userId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (user.role === 'admin') {
        throw createError('Cannot deactivate admin user', 403, 'CANNOT_DEACTIVATE_ADMIN');
      }

      user.isActive = false;
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.deactivated',
        entityType: 'user',
        entityId: user._id,
        userId: new mongoose.Types.ObjectId(adminId),
        details: {
          description: 'User account deactivated',
        },
        ipAddress,
        userAgent,
      });

      logger.info('User deactivated', {
        userId,
        adminId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Deactivate user error:', error);
      throw error;
    }
  }

  static async activateUser(
    userId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      user.isActive = true;
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'user.activated',
        entityType: 'user',
        entityId: user._id,
        userId: new mongoose.Types.ObjectId(adminId),
        details: {
          description: 'User account activated',
        },
        ipAddress,
        userAgent,
      });

      logger.info('User activated', {
        userId,
        adminId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Activate user error:', error);
      throw error;
    }
  }
}
