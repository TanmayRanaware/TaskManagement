import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { CommentService } from '@/services/commentService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export class CommentController {
  static createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const comment = await CommentService.createComment(
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment },
    });
  });

  static getTaskComments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await CommentService.getTaskComments(taskId, userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  static getCommentReplies = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CommentService.getCommentReplies(commentId, userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  static updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const comment = await CommentService.updateComment(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment },
    });
  });

  static deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await CommentService.deleteComment(id, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  });

  static addReaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await CommentService.addReaction(id, emoji, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Reaction added successfully',
    });
  });

  static removeReaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user!._id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await CommentService.removeReaction(id, emoji, userId, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Reaction removed successfully',
    });
  });
}

// Validation middleware
export const createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters'),
  body('taskId')
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ObjectId'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Parent ID must be a valid MongoDB ObjectId'),
  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
  body('mentions.*')
    .optional()
    .isMongoId()
    .withMessage('Each mention must be a valid MongoDB ObjectId'),
];

export const updateCommentValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters'),
];

export const addReactionValidation = [
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
];

export const removeReactionValidation = [
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters'),
];

export const getTaskCommentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const getCommentRepliesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];
