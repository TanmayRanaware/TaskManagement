import { Comment, IComment } from '@/models/Comment';
import { Task } from '@/models/Task';
import { Project } from '@/models/Project';
import { ActivityLog } from '@/models/ActivityLog';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface CreateCommentData {
  content: string;
  taskId: string;
  parentId?: string;
  mentions?: string[];
}

export interface UpdateCommentData {
  content?: string;
}

export interface CommentResponse {
  _id: string;
  content: string;
  taskId: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
  parentId?: string;
  mentions: any[];
  attachments: any[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  reactions: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class CommentService {
  static async createComment(
    data: CreateCommentData,
    authorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CommentResponse> {
    try {
      // Verify task exists and user has access
      const task = await Task.findById(data.taskId);
      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(authorId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      // Verify parent comment exists if provided
      if (data.parentId) {
        const parentComment = await Comment.findById(data.parentId);
        if (!parentComment || parentComment.taskId.toString() !== data.taskId) {
          throw createError('Parent comment not found', 404, 'PARENT_COMMENT_NOT_FOUND');
        }
      }

      const comment = new Comment({
        ...data,
        taskId: new mongoose.Types.ObjectId(data.taskId),
        authorId: new mongoose.Types.ObjectId(authorId),
        parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : undefined,
        mentions: data.mentions ? data.mentions.map(id => new mongoose.Types.ObjectId(id)) : [],
      });

      await comment.save();

      // Populate the comment for response
      const populatedComment = await Comment.findById(comment._id)
        .populate('authorId', 'firstName lastName username avatar')
        .populate('mentions', 'firstName lastName username');

      if (!populatedComment) {
        throw createError('Failed to create comment', 500, 'CREATE_COMMENT_FAILED');
      }

      // Log activity
      await ActivityLog.logActivity({
        action: 'comment.created',
        entityType: 'comment',
        entityId: comment._id,
        userId: new mongoose.Types.ObjectId(authorId),
        projectId: task.projectId,
        details: {
          description: 'Comment created',
          taskId: data.taskId,
        },
        ipAddress,
        userAgent,
      });

      logger.info('Comment created', {
        commentId: comment._id,
        taskId: data.taskId,
        authorId,
        ipAddress,
      });

      return {
        _id: populatedComment._id.toString(),
        content: populatedComment.content,
        taskId: populatedComment.taskId.toString(),
        authorId: {
          _id: populatedComment.authorId._id.toString(),
          firstName: populatedComment.authorId.firstName,
          lastName: populatedComment.authorId.lastName,
          username: populatedComment.authorId.username,
          avatar: populatedComment.authorId.avatar,
        },
        parentId: populatedComment.parentId?.toString(),
        mentions: populatedComment.mentions.map(mention => ({
          _id: mention._id.toString(),
          firstName: mention.firstName,
          lastName: mention.lastName,
          username: mention.username,
        })),
        attachments: populatedComment.attachments,
        isEdited: populatedComment.isEdited,
        editedAt: populatedComment.editedAt,
        isDeleted: populatedComment.isDeleted,
        deletedAt: populatedComment.deletedAt,
        reactions: populatedComment.reactions,
        createdAt: populatedComment.createdAt,
        updatedAt: populatedComment.updatedAt,
      };
    } catch (error) {
      logger.error('Create comment error:', error);
      throw error;
    }
  }

  static async getTaskComments(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    comments: CommentResponse[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      // Verify task exists and user has access
      const task = await Task.findById(taskId);
      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        Comment.getTaskComments(new mongoose.Types.ObjectId(taskId), page, limit),
        Comment.countDocuments({
          taskId: new mongoose.Types.ObjectId(taskId),
          isDeleted: false,
          parentId: null,
        }),
      ]);

      const commentResponses: CommentResponse[] = comments.map(comment => ({
        _id: comment._id.toString(),
        content: comment.content,
        taskId: comment.taskId.toString(),
        authorId: {
          _id: comment.authorId._id.toString(),
          firstName: comment.authorId.firstName,
          lastName: comment.authorId.lastName,
          username: comment.authorId.username,
          avatar: comment.authorId.avatar,
        },
        parentId: comment.parentId?.toString(),
        mentions: comment.mentions.map(mention => ({
          _id: mention._id.toString(),
          firstName: mention.firstName,
          lastName: mention.lastName,
          username: mention.username,
        })),
        attachments: comment.attachments,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt,
        isDeleted: comment.isDeleted,
        deletedAt: comment.deletedAt,
        reactions: comment.reactions,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }));

      return {
        comments: commentResponses,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get task comments error:', error);
      throw error;
    }
  }

  static async getCommentReplies(
    commentId: string,
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    replies: CommentResponse[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      // Verify parent comment exists and user has access
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
      }

      const task = await Task.findById(parentComment.taskId);
      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      const skip = (page - 1) * limit;

      const [replies, total] = await Promise.all([
        Comment.getCommentReplies(new mongoose.Types.ObjectId(commentId), page, limit),
        Comment.countDocuments({
          parentId: new mongoose.Types.ObjectId(commentId),
          isDeleted: false,
        }),
      ]);

      const replyResponses: CommentResponse[] = replies.map(reply => ({
        _id: reply._id.toString(),
        content: reply.content,
        taskId: reply.taskId.toString(),
        authorId: {
          _id: reply.authorId._id.toString(),
          firstName: reply.authorId.firstName,
          lastName: reply.authorId.lastName,
          username: reply.authorId.username,
          avatar: reply.authorId.avatar,
        },
        parentId: reply.parentId?.toString(),
        mentions: reply.mentions.map(mention => ({
          _id: mention._id.toString(),
          firstName: mention.firstName,
          lastName: mention.lastName,
          username: mention.username,
        })),
        attachments: reply.attachments,
        isEdited: reply.isEdited,
        editedAt: reply.editedAt,
        isDeleted: reply.isDeleted,
        deletedAt: reply.deletedAt,
        reactions: reply.reactions,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      }));

      return {
        replies: replyResponses,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get comment replies error:', error);
      throw error;
    }
  }

  static async updateComment(
    commentId: string,
    data: UpdateCommentData,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CommentResponse> {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
      }

      // Check if user is the author
      if (comment.authorId.toString() !== userId) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      const oldComment = comment.toObject();

      // Update comment data
      Object.assign(comment, data);
      await comment.save();

      // Populate the comment for response
      const populatedComment = await Comment.findById(comment._id)
        .populate('authorId', 'firstName lastName username avatar')
        .populate('mentions', 'firstName lastName username');

      if (!populatedComment) {
        throw createError('Failed to update comment', 500, 'UPDATE_COMMENT_FAILED');
      }

      // Log activity
      await ActivityLog.logActivity({
        action: 'comment.updated',
        entityType: 'comment',
        entityId: comment._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: comment.taskId,
        details: {
          description: 'Comment updated',
          oldValue: oldComment,
          newValue: comment.toObject(),
        },
        ipAddress,
        userAgent,
      });

      logger.info('Comment updated', {
        commentId,
        userId,
        changes: Object.keys(data),
        ipAddress,
      });

      return {
        _id: populatedComment._id.toString(),
        content: populatedComment.content,
        taskId: populatedComment.taskId.toString(),
        authorId: {
          _id: populatedComment.authorId._id.toString(),
          firstName: populatedComment.authorId.firstName,
          lastName: populatedComment.authorId.lastName,
          username: populatedComment.authorId.username,
          avatar: populatedComment.authorId.avatar,
        },
        parentId: populatedComment.parentId?.toString(),
        mentions: populatedComment.mentions.map(mention => ({
          _id: mention._id.toString(),
          firstName: mention.firstName,
          lastName: mention.lastName,
          username: mention.username,
        })),
        attachments: populatedComment.attachments,
        isEdited: populatedComment.isEdited,
        editedAt: populatedComment.editedAt,
        isDeleted: populatedComment.isDeleted,
        deletedAt: populatedComment.deletedAt,
        reactions: populatedComment.reactions,
        createdAt: populatedComment.createdAt,
        updatedAt: populatedComment.updatedAt,
      };
    } catch (error) {
      logger.error('Update comment error:', error);
      throw error;
    }
  }

  static async deleteComment(
    commentId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
      }

      // Check if user is the author
      if (comment.authorId.toString() !== userId) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      // Soft delete the comment
      comment.softDelete();
      await comment.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'comment.deleted',
        entityType: 'comment',
        entityId: comment._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: comment.taskId,
        details: {
          description: 'Comment deleted',
          oldValue: comment.toObject(),
        },
        ipAddress,
        userAgent,
      });

      logger.info('Comment deleted', {
        commentId,
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Delete comment error:', error);
      throw error;
    }
  }

  static async addReaction(
    commentId: string,
    emoji: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
      }

      // Check if user has access to the task
      const task = await Task.findById(comment.taskId);
      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      comment.addReaction(new mongoose.Types.ObjectId(userId), emoji);
      await comment.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'comment.reaction_added',
        entityType: 'comment',
        entityId: comment._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: task.projectId,
        details: {
          description: 'Reaction added to comment',
          newValue: { emoji },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Reaction added to comment', {
        commentId,
        userId,
        emoji,
        ipAddress,
      });
    } catch (error) {
      logger.error('Add reaction error:', error);
      throw error;
    }
  }

  static async removeReaction(
    commentId: string,
    emoji: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
      }

      // Check if user has access to the task
      const task = await Task.findById(comment.taskId);
      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      comment.removeReaction(new mongoose.Types.ObjectId(userId), emoji);
      await comment.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'comment.reaction_removed',
        entityType: 'comment',
        entityId: comment._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: task.projectId,
        details: {
          description: 'Reaction removed from comment',
          oldValue: { emoji },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Reaction removed from comment', {
        commentId,
        userId,
        emoji,
        ipAddress,
      });
    } catch (error) {
      logger.error('Remove reaction error:', error);
      throw error;
    }
  }
}
