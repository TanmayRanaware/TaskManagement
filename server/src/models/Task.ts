import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}

export interface ITaskWatcher {
  userId: mongoose.Types.ObjectId;
  addedAt: Date;
  addedBy: mongoose.Types.ObjectId;
}

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeId?: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  labels: string[];
  dueDate?: Date;
  attachments: ITaskAttachment[];
  watchers: ITaskWatcher[];
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  commentCount: number;
  watcherCount: number;
  
  // Methods
  isWatchedBy(userId: mongoose.Types.ObjectId): boolean;
  addWatcher(userId: mongoose.Types.ObjectId, addedBy: mongoose.Types.ObjectId): void;
  removeWatcher(userId: mongoose.Types.ObjectId): void;
  moveToStatus(status: string, movedBy: mongoose.Types.ObjectId): void;
}

const taskAttachmentSchema = new Schema<ITaskAttachment>({
  id: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { _id: false });

const taskWatcherSchema = new Schema<ITaskWatcher>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { _id: false });

const taskSchema = new Schema<ITask>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  status: {
    type: String,
    required: true,
    default: 'backlog',
    index: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true,
  },
  assigneeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  labels: {
    type: [String],
    default: [],
    index: true,
  },
  dueDate: {
    type: Date,
    default: null,
    index: true,
  },
  attachments: {
    type: [taskAttachmentSchema],
    default: [],
  },
  watchers: {
    type: [taskWatcherSchema],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
    index: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes
taskSchema.index({ projectId: 1, status: 1, order: 1 });
taskSchema.index({ projectId: 1, assigneeId: 1 });
taskSchema.index({ projectId: 1, creatorId: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });
taskSchema.index({ projectId: 1, labels: 1 });
taskSchema.index({ projectId: 1, priority: 1 });
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ assigneeId: 1, dueDate: 1 });

// Virtuals
taskSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'taskId',
  count: true,
});

taskSchema.virtual('watcherCount').get(function() {
  return this.watchers.length;
});

// Instance methods
taskSchema.methods.isWatchedBy = function(userId: mongoose.Types.ObjectId): boolean {
  return this.watchers.some((watcher: ITaskWatcher) => 
    watcher.userId.toString() === userId.toString()
  );
};

taskSchema.methods.addWatcher = function(userId: mongoose.Types.ObjectId, addedBy: mongoose.Types.ObjectId): void {
  if (!this.isWatchedBy(userId)) {
    this.watchers.push({
      userId,
      addedAt: new Date(),
      addedBy,
    });
  }
};

taskSchema.methods.removeWatcher = function(userId: mongoose.Types.ObjectId): void {
  this.watchers = this.watchers.filter((watcher: ITaskWatcher) => 
    watcher.userId.toString() !== userId.toString()
  );
};

taskSchema.methods.moveToStatus = function(status: string, movedBy: mongoose.Types.ObjectId): void {
  this.status = status;
  this.updatedAt = new Date();
};

// Static methods
taskSchema.statics.findByProject = function(projectId: mongoose.Types.ObjectId) {
  return this.find({ projectId, isArchived: false }).sort({ order: 1 });
};

taskSchema.statics.findByProjectAndStatus = function(projectId: mongoose.Types.ObjectId, status: string) {
  return this.find({ projectId, status, isArchived: false }).sort({ order: 1 });
};

taskSchema.statics.searchTasks = function(query: string, projectId: mongoose.Types.ObjectId) {
  return this.find({
    $and: [
      { projectId, isArchived: false },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      },
    ],
  }).sort({ updatedAt: -1 });
};

export const Task = mongoose.model<ITask>('Task', taskSchema);