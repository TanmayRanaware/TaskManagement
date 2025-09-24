import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  projectId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  entityType: 'task' | 'comment' | 'project' | 'user';
  entityId: mongoose.Types.ObjectId;
  action: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  entityType: {
    type: String,
    enum: ['task', 'comment', 'project', 'user'],
    required: true,
    index: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

// Static methods
activityLogSchema.statics.findByProject = function(projectId: mongoose.Types.ObjectId, limit = 50) {
  return this.find({ projectId })
    .populate('actorId', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit);
};

activityLogSchema.statics.findByEntity = function(entityType: string, entityId: mongoose.Types.ObjectId) {
  return this.find({ entityType, entityId })
    .populate('actorId', 'name email avatarUrl')
    .sort({ createdAt: -1 });
};

activityLogSchema.statics.findByActor = function(actorId: mongoose.Types.ObjectId, limit = 50) {
  return this.find({ actorId })
    .populate('projectId', 'name key')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Activity types
export const ACTIVITY_TYPES = {
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_MOVED: 'task.moved',
  TASK_DELETED: 'task.deleted',
  TASK_ASSIGNED: 'task.assigned',
  TASK_UNASSIGNED: 'task.unassigned',
  TASK_DUE_DATE_SET: 'task.due_date_set',
  TASK_DUE_DATE_REMOVED: 'task.due_date_removed',
  TASK_LABEL_ADDED: 'task.label_added',
  TASK_LABEL_REMOVED: 'task.label_removed',
  TASK_WATCHER_ADDED: 'task.watcher_added',
  TASK_WATCHER_REMOVED: 'task.watcher_removed',
  
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_MEMBER_ADDED: 'project.member_added',
  PROJECT_MEMBER_REMOVED: 'project.member_removed',
  PROJECT_MEMBER_ROLE_CHANGED: 'project.member_role_changed',
  
  USER_JOINED: 'user.joined',
  USER_LEFT: 'user.left',
} as const;

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);