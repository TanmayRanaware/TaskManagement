import { Project, IProject } from '@/models/Project';
import { ActivityLog } from '@/models/ActivityLog';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  settings?: {
    isPublic?: boolean;
    allowMemberInvites?: boolean;
    defaultTaskStatus?: string;
    taskLabels?: string[];
  };
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  status?: 'active' | 'archived' | 'completed';
  settings?: {
    isPublic?: boolean;
    allowMemberInvites?: boolean;
    defaultTaskStatus?: string;
    taskLabels?: string[];
  };
}

export interface ProjectMemberData {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface ProjectResponse {
  _id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  ownerId: string;
  members: any[];
  settings: any;
  statistics: any;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectService {
  static async createProject(
    data: CreateProjectData,
    ownerId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ProjectResponse> {
    try {
      const project = new Project({
        ...data,
        ownerId: new mongoose.Types.ObjectId(ownerId),
      });

      await project.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'project.created',
        entityType: 'project',
        entityId: project._id,
        userId: project._id,
        projectId: project._id,
        details: {
          description: 'Project created successfully',
        },
        ipAddress,
        userAgent,
      });

      logger.info('Project created', {
        projectId: project._id,
        ownerId,
        name: project.name,
        ipAddress,
      });

      return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        ownerId: project.ownerId.toString(),
        members: project.members,
        settings: project.settings,
        statistics: project.statistics,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    } catch (error) {
      logger.error('Create project error:', error);
      throw error;
    }
  }

  static async getUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    projects: ProjectResponse[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {
        $or: [
          { ownerId: new mongoose.Types.ObjectId(userId) },
          { 'members.userId': new mongoose.Types.ObjectId(userId) },
        ],
      };

      if (status) {
        query.status = status;
      }

      const [projects, total] = await Promise.all([
        Project.find(query)
          .populate('ownerId', 'firstName lastName username email')
          .populate('members.userId', 'firstName lastName username email avatar')
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        Project.countDocuments(query),
      ]);

      const projectResponses: ProjectResponse[] = projects.map(project => ({
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        ownerId: project.ownerId.toString(),
        members: project.members,
        settings: project.settings,
        statistics: project.statistics,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }));

      return {
        projects: projectResponses,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get user projects error:', error);
      throw error;
    }
  }

  static async getProjectById(
    projectId: string,
    userId: string
  ): Promise<ProjectResponse> {
    try {
      const project = await Project.findById(projectId)
        .populate('ownerId', 'firstName lastName username email')
        .populate('members.userId', 'firstName lastName username email avatar');

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has access to the project
      if (!project.isMember(new mongoose.Types.ObjectId(userId))) {
        throw createError('Access denied', 403, 'ACCESS_DENIED');
      }

      return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        ownerId: project.ownerId.toString(),
        members: project.members,
        settings: project.settings,
        statistics: project.statistics,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    } catch (error) {
      logger.error('Get project by ID error:', error);
      throw error;
    }
  }

  static async updateProject(
    projectId: string,
    data: UpdateProjectData,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ProjectResponse> {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has permission to edit
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canEdit')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const oldProject = project.toObject();

      // Update project data
      Object.assign(project, data);
      await project.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'project.updated',
        entityType: 'project',
        entityId: project._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: project._id,
        details: {
          description: 'Project updated',
          oldValue: oldProject,
          newValue: project.toObject(),
        },
        ipAddress,
        userAgent,
      });

      logger.info('Project updated', {
        projectId,
        userId,
        changes: Object.keys(data),
        ipAddress,
      });

      return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        ownerId: project.ownerId.toString(),
        members: project.members,
        settings: project.settings,
        statistics: project.statistics,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    } catch (error) {
      logger.error('Update project error:', error);
      throw error;
    }
  }

  static async deleteProject(
    projectId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has permission to delete
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canDelete')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      // Log activity before deletion
      await ActivityLog.logActivity({
        action: 'project.deleted',
        entityType: 'project',
        entityId: project._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: project._id,
        details: {
          description: 'Project deleted',
          oldValue: project.toObject(),
        },
        ipAddress,
        userAgent,
      });

      await Project.findByIdAndDelete(projectId);

      logger.info('Project deleted', {
        projectId,
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Delete project error:', error);
      throw error;
    }
  }

  static async addMember(
    projectId: string,
    memberData: ProjectMemberData,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has permission to invite
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canInvite')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      project.addMember(
        new mongoose.Types.ObjectId(memberData.userId),
        memberData.role
      );
      await project.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'project.member_added',
        entityType: 'project',
        entityId: project._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: project._id,
        details: {
          description: 'Member added to project',
          newValue: { userId: memberData.userId, role: memberData.role },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Member added to project', {
        projectId,
        userId,
        memberId: memberData.userId,
        role: memberData.role,
        ipAddress,
      });
    } catch (error) {
      logger.error('Add member error:', error);
      throw error;
    }
  }

  static async removeMember(
    projectId: string,
    memberUserId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has permission to manage members
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canInvite')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      project.removeMember(new mongoose.Types.ObjectId(memberUserId));
      await project.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'project.member_removed',
        entityType: 'project',
        entityId: project._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: project._id,
        details: {
          description: 'Member removed from project',
          oldValue: { userId: memberUserId },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Member removed from project', {
        projectId,
        userId,
        memberId: memberUserId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Remove member error:', error);
      throw error;
    }
  }

  static async updateMemberRole(
    projectId: string,
    memberUserId: string,
    role: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw createError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Check if user has permission to manage members
      if (!project.hasPermission(new mongoose.Types.ObjectId(userId), 'canInvite')) {
        throw createError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      const oldRole = project.getMemberRole(new mongoose.Types.ObjectId(memberUserId));
      project.updateMemberRole(new mongoose.Types.ObjectId(memberUserId), role);
      await project.save();

      // Log activity
      await ActivityLog.logActivity({
        action: 'project.member_role_changed',
        entityType: 'project',
        entityId: project._id,
        userId: new mongoose.Types.ObjectId(userId),
        projectId: project._id,
        details: {
          description: 'Member role updated',
          oldValue: { userId: memberUserId, role: oldRole },
          newValue: { userId: memberUserId, role },
        },
        ipAddress,
        userAgent,
      });

      logger.info('Member role updated', {
        projectId,
        userId,
        memberId: memberUserId,
        oldRole,
        newRole: role,
        ipAddress,
      });
    } catch (error) {
      logger.error('Update member role error:', error);
      throw error;
    }
  }
}
