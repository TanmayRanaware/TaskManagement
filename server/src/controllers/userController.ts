import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { UserService } from '@/services/userService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class UserController {
  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const user = await UserService.getUserProfile(userId);

    res.json({
      success: true,
      data: { user },
    });
  });

  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const user = await UserService.updateUserProfile(
      userId,
      req.body,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  });

  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const result = await UserService.getAllUsers(page, limit, search, role);

    res.json({
      success: true,
      data: result,
    });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    res.json({
      success: true,
      data: { user },
    });
  });

  static deactivateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await UserService.deactivateUser(id, adminId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  });

  static activateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await UserService.activateUser(id, adminId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'User activated successfully',
    });
  });
}

// Validation middleware
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language must be between 2 and 10 characters'),
  body('preferences.timezone')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Timezone must be between 3 and 50 characters'),
];

export const getAllUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user'),
];
