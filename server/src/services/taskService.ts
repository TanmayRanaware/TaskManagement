import { Task, ITask } from '@/models/Task';
import { Project } from '@/models/Project';
import { ActivityLog } from '@/models/ActivityLog';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
  estimatedHours?: number;
  subtasks?: {
    title: string;
    completed?: boolean;
  }[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
  estimatedHours?: number;
  actualHours?: number;
  position?: number;
  subtasks?: {
    title: string;
    completed?: boolean;
  }[];
}

export interface TaskResponse {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId?: string;
  createdById: string;
  dueDate?: Date;
  completedAt?: Date;
  labels: string[];
  attachments: any[];
  subtasks: any[];
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  createdById?: string;
  labels?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export class TaskService {
  static async createTask(
    data: CreateTaskData,
    createdById: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TaskResponse> {
    try {
      // Verify project exists and user has access
      const project = await Project.findById(data.projectId);
      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      if (!project.isMember(new mongoose.Types.ObjectId(createdById))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      // Check if assignee is a project member
      if (data.assigneeId) {
        if (!project.isMember(new mongoose.Types.ObjectId(data.assigneeId))) {
          throw createError('Assignee must be a project member', 400, 'INVALID_ASSIGNEE');
        }
      }

      // Get the next position for the task
      const lastTask = await Task.findOne({ projectId: data.projectId })
        .sort({ position: -1 })
        .select('position');
      const nextPosition = lastTask ? lastTask.position + 1 : 0;

      const task = new Task({
        ...data,
        projectId: new mongoose.Types.ObjectId(data.projectId),
        assigneeId: data.assigneeId ? new mongoose.Types.ObjectId(data.assigneeId) : undefined,
        createdById: new mongoose.Types.ObjectId(createdById),
        position: nextPosition,
      });

      await task.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'task.created',
        entityType: 'task',
        entityId: task._id,
        userId: new mongoose.Types.ObjectId(createdById),
        projectId: new mongoose.Types.ObjectId(data.projectId),
        details: {
          description: 'Task created successfully',
        },
        ipAddress,
        userAgent,
      });

      logger.info('Task created', {
        taskId: task._id,
        projectId: data.projectId,
        createdById,
        title: task.title,
        ipAddress,
      });

      return {
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString(),
        createdById: task.createdById.toString(),
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        labels: task.labels,
        attachments: task.attachments,
        subtasks: task.subtasks,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        position: task.position,
        isArchived: task.isArchived,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      logger.error('Create task error:', error);
      throw error;
    }
  }

  static async getTasks(
    userId: string,
    filters: TaskFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    tasks: TaskResponse[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {
        isArchived: false,
      };

      // Add filters
      if (filters.projectId) {
        query.projectId = new mongoose.Types.ObjectId(filters.projectId);
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.assigneeId) {
        query.assigneeId = new mongoose.Types.ObjectId(filters.assigneeId);
      }
      if (filters.createdById) {
        query.createdById = new mongoose.Types.ObjectId(filters.createdById);
      }
      if (filters.labels && filters.labels.length > 0) {
        query.labels = { $in: filters.labels };
      }
      if (filters.dueDateFrom || filters.dueDateTo) {
        query.dueDate = {};
        if (filters.dueDateFrom) {
          query.dueDate.$gte = filters.dueDateFrom;
        }
        if (filters.dueDateTo) {
          query.dueDate.$lte = filters.dueDateTo;
        }
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ];
      }

      // Get user's projects to filter tasks
      const userProjects = await Project.find({
        $or: [
          { ownerId: new mongoose.Types.ObjectId(userId) },
          { 'members.userId': new mongoose.Types.ObjectId(userId) },
        ],
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);
      query.projectId = { $in: projectIds };

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate('assigneeId', 'firstName lastName username email avatar')
          .populate('createdById', 'firstName lastName username email avatar')
          .populate('projectId', 'name color')
          .sort({ position: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Task.countDocuments(query),
      ]);

      const taskResponses: TaskResponse[] = tasks.map(task => ({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString(),
        createdById: task.createdById.toString(),
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        labels: task.labels,
        attachments: task.attachments,
        subtasks: task.subtasks,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        position: task.position,
        isArchived: task.isArchived,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

      return {
        tasks: taskResponses,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get tasks error:', error);
      throw error;
    }
  }

  static async getTaskById(
    taskId: string,
    userId: string
  ): Promise<TaskResponse> {
    try {
      const task = await Task.findById(taskId)
        .populate('assigneeId', 'firstName lastName username email avatar')
        .populate('createdById', 'firstName lastName username email avatar')
        .populate('projectId', 'name color');

      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      return {
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString(),
        createdById: task.createdById.toString(),
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        labels: task.labels,
        attachments: task.attachments,
        subtasks: task.subtasks,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        position: task.position,
        isArchived: task.isArchived,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      logger.error('Get task by ID error:', error);
      throw error;
    }
  }

  static async updateTask(
    taskId: string,
    data: UpdateTaskData,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TaskResponse> {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      // Check if user can manage tasks
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canManageTasks')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const oldTask = task.toObject();

      // Update task data
      Object.assign(task, data);
      await task.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'task.updated',
        entityType: 'task',
        entityId: task._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: task.projectId,
        details: {
          description: 'Task updated',
          oldValue: oldTask,
          newValue: task.toObject(),
        },
        ipAddress,
        userAgent,
      });

      logger.info('Task updated', {
        taskId,
        userId,
        changes: Object.keys(data),
        ipAddress,
      });

      return {
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString(),
        createdById: task.createdById.toString(),
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        labels: task.labels,
        attachments: task.attachments,
        subtasks: task.subtasks,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        position: task.position,
        isArchived: task.isArchived,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      logger.error('Update task error:', error);
      throw error;
    }
  }

  static async deleteTask(
    taskId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      // Check if user can manage tasks
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canManageTasks')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      // Log activity before deletion
      await ActivityLog.logActivity({
        action: 'task.deleted',
        entityType: 'task',
        entityId: task._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: task.projectId,
        details: {
          description: 'Task deleted',
          oldValue: task.toObject(),
        },
        ipAddress,
        userAgent,
      });

      await Task.findByIdAndDelete(taskId);

      logger.info('Task deleted', {
        taskId,
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Delete task error:', error);
      throw error;
    }
  }

  static async updateTaskPosition(
    taskId: string,
    newPosition: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        throw createError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      // Check if user has access to the project
      const project = await Project.findById(task.projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      const oldPosition = task.position;
      task.position = newPosition;
      await task.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'task.position_changed',
        entityType: 'task',
        entityId: task._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: task.projectId,
        details: {
          description: 'Task position updated',
          oldValue: { position: oldPosition },
          newValue: { position: newPosition },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Task position updated', {
        taskId,
        userId,
        oldPosition,
        newPosition,
        ipAddress,
      });
    } catch (error) {
      logger.error('Update task position error:', error);
      throw error;
    }
  }

  static async getProjectTasks(
    projectId: string,
    userId: string,
    status?: string
  ): Promise<TaskResponse[]> {
    try {
      // Check if user has access to the project
      const project = await Project.findById(projectId);
      if (!project || !project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      const query: any = {
        projectId: new mongoose.Types.ObjectId(projectId),
        isArchived: false,
      };

      if (status) {
        query.status = status;
      }

      const tasks = await Task.find(query)
        .populate('assigneeId', 'firstName lastName username email avatar')
        .populate('createdById', 'firstName lastName username email avatar')
        .sort({ position: 1, createdAt: -1 });

      return tasks.map(task => ({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString(),
        createdById: task.createdById.toString(),
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        labels: task.labels,
        attachments: task.attachments,
        subtasks: task.subtasks,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        position: task.position,
        isArchived: task.isArchived,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    } catch (error) {
      logger.error('Get project tasks error:', error);
      throw error;
    }
  }
}
