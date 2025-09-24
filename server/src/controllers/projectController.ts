import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { ProjectService } from '@/services/projectService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class ProjectController {
  static createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const project = await ProjectService.createProject(
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  });

  static getUserProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await ProjectService.getUserProjects(userId, page, limit, status);

    res.json({
      success: true,
      data: result,
    });
  });

  static getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;

    const project = await ProjectService.getProjectById(id, userId);

    res.json({
      success: true,
      data: { project },
    });
  });

  static updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const project = await ProjectService.updateProject(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  });

  static deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await ProjectService.deleteProject(id, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  static addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await ProjectService.addMember(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Member added successfully',
    });
  });

  static removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, memberId } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await ProjectService.removeMember(
      id,
      memberId,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  });

  static updateMemberRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await ProjectService.updateMemberRole(
      id,
      memberId,
      role,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Member role updated successfully',
    });
  });
}

// Validation middleware
export const createProjectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('settings.allowMemberInvites')
    .optional()
    .isBoolean()
    .withMessage('allowMemberInvites must be a boolean'),
  body('settings.defaultTaskStatus')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Default task status must be between 1 and 50 characters'),
  body('settings.taskLabels')
    .optional()
    .isArray()
    .withMessage('Task labels must be an array'),
  body('settings.taskLabels.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each task label must be between 1 and 50 characters'),
];

export const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'completed'])
    .withMessage('Status must be active, archived, or completed'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('settings.allowMemberInvites')
    .optional()
    .isBoolean()
    .withMessage('allowMemberInvites must be a boolean'),
  body('settings.defaultTaskStatus')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Default task status must be between 1 and 50 characters'),
  body('settings.taskLabels')
    .optional()
    .isArray()
    .withMessage('Task labels must be an array'),
  body('settings.taskLabels.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each task label must be between 1 and 50 characters'),
];

export const addMemberValidation = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('role')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
];

export const updateMemberRoleValidation = [
  body('role')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
];

export const getUserProjectsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'archived', 'completed'])
    .withMessage('Status must be active, archived, or completed'),
];
