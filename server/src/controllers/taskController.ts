import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { TaskService } from '@/services/taskService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class TaskController {
  static createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const task = await TaskService.createTask(
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  });

  static getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      projectId: req.query.projectId as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      assigneeId: req.query.assigneeId as string,
      createdById: req.query.createdById as string,
      labels: req.query.labels ? (req.query.labels as string).split(',') : undefined,
      dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
      dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
      search: req.query.search as string,
    };

    const result = await TaskService.getTasks(userId, filters, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  static getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;

    const task = await TaskService.getTaskById(id, userId);

    res.json({
      success: true,
      data: { task },
    });
  });

  static updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const task = await TaskService.updateTask(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  });

  static deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await TaskService.deleteTask(id, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  });

  static updateTaskPosition = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { position } = req.body;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await TaskService.updateTaskPosition(id, position, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Task position updated successfully',
    });
  });

  static getProjectTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!._id;
    const status = req.query.status as string;

    const tasks = await TaskService.getProjectTasks(projectId, userId, status);

    res.json({
      success: true,
      data: { tasks },
    });
  });
}

// Validation middleware
export const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('projectId')
    .isMongoId()
    .withMessage('Project ID must be a valid MongoDB ObjectId'),
  body('assigneeId')
    .optional()
    .isMongoId()
    .withMessage('Assignee ID must be a valid MongoDB ObjectId'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  body('labels.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each label must be between 1 and 50 characters'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Estimated hours must be between 0 and 999'),
  body('subtasks')
    .optional()
    .isArray()
    .withMessage('Subtasks must be an array'),
  body('subtasks.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title must be between 1 and 200 characters'),
  body('subtasks.*.completed')
    .optional()
    .isBoolean()
    .withMessage('Subtask completed must be a boolean'),
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in_progress, completed, or cancelled'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('assigneeId')
    .optional()
    .isMongoId()
    .withMessage('Assignee ID must be a valid MongoDB ObjectId'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  body('labels.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each label must be between 1 and 50 characters'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Estimated hours must be between 0 and 999'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Actual hours must be between 0 and 999'),
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
  body('subtasks')
    .optional()
    .isArray()
    .withMessage('Subtasks must be an array'),
  body('subtasks.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title must be between 1 and 200 characters'),
  body('subtasks.*.completed')
    .optional()
    .isBoolean()
    .withMessage('Subtask completed must be a boolean'),
];

export const updateTaskPositionValidation = [
  body('position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

export const getTasksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('projectId')
    .optional()
    .isMongoId()
    .withMessage('Project ID must be a valid MongoDB ObjectId'),
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in_progress, completed, or cancelled'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  query('assigneeId')
    .optional()
    .isMongoId()
    .withMessage('Assignee ID must be a valid MongoDB ObjectId'),
  query('createdById')
    .optional()
    .isMongoId()
    .withMessage('Created by ID must be a valid MongoDB ObjectId'),
  query('dueDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Due date from must be a valid ISO 8601 date'),
  query('dueDateTo')
    .optional()
    .isISO8601()
    .withMessage('Due date to must be a valid ISO 8601 date'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];
