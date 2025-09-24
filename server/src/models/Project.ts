import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface IProjectColumn {
  id: string;
  name: string;
  order: number;
  color?: string;
  taskLimit?: number;
}

export interface IProjectSettings {
  allowGuestComments?: boolean;
  autoArchive?: boolean;
  defaultAssignee?: mongoose.Types.ObjectId;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
  };
}

export interface IProject extends Document {
  name: string;
  key: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: IProjectMember[];
  columns: IProjectColumn[];
  settings: IProjectSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  memberCount: number;
  
  // Methods
  isMember(userId: mongoose.Types.ObjectId): boolean;
  getMemberRole(userId: mongoose.Types.ObjectId): string | null;
  canManage(userId: mongoose.Types.ObjectId): boolean;
  addMember(userId: mongoose.Types.ObjectId, role: string): void;
  removeMember(userId: mongoose.Types.ObjectId): void;
}

const projectMemberSchema = new Schema<IProjectMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const projectColumnSchema = new Schema<IProjectColumn>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  taskLimit: {
    type: Number,
    default: null,
  },
}, { _id: false });

const projectSettingsSchema = new Schema<IProjectSettings>({
  allowGuestComments: {
    type: Boolean,
    default: false,
  },
  autoArchive: {
    type: Boolean,
    default: false,
  },
  defaultAssignee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
  },
}, { _id: false });

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  members: [projectMemberSchema],
  columns: {
    type: [projectColumnSchema],
    default: [
      { id: 'backlog', name: 'Backlog', order: 0, color: '#6B7280' },
      { id: 'in-progress', name: 'In Progress', order: 1, color: '#3B82F6' },
      { id: 'review', name: 'Review', order: 2, color: '#F59E0B' },
      { id: 'done', name: 'Done', order: 3, color: '#10B981' },
    ],
  },
  settings: {
    type: projectSettingsSchema,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
projectSchema.index({ key: 1 });
projectSchema.index({ ownerId: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ isActive: 1 });

// Virtuals
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Instance methods
projectSchema.methods.isMember = function(userId: mongoose.Types.ObjectId): boolean {
  return this.members.some((member: IProjectMember) => 
    member.userId.toString() === userId.toString()
  );
};

projectSchema.methods.getMemberRole = function(userId: mongoose.Types.ObjectId): string | null {
  const member = this.members.find((member: IProjectMember) => 
    member.userId.toString() === userId.toString()
  );
  return member ? member.role : null;
};

projectSchema.methods.canManage = function(userId: mongoose.Types.ObjectId): boolean {
  if (this.ownerId.toString() === userId.toString()) return true;
  
  const member = this.members.find((member: IProjectMember) => 
    member.userId.toString() === userId.toString()
  );
  
  return member ? ['owner', 'admin'].includes(member.role) : false;
};

projectSchema.methods.addMember = function(userId: mongoose.Types.ObjectId, role: string): void {
  const existingMember = this.members.find((member: IProjectMember) => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
  } else {
    this.members.push({
      userId,
      role: role as 'owner' | 'admin' | 'member',
      joinedAt: new Date(),
    });
  }
};

projectSchema.methods.removeMember = function(userId: mongoose.Types.ObjectId): void {
  this.members = this.members.filter((member: IProjectMember) => 
    member.userId.toString() !== userId.toString()
  );
};

// Static methods
projectSchema.statics.findByKey = function(key: string) {
  return this.findOne({ key: key.toUpperCase(), isActive: true });
};

projectSchema.statics.findUserProjects = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { ownerId: userId },
      { 'members.userId': userId },
    ],
    isActive: true,
  }).sort({ updatedAt: -1 });
};

export const Project = mongoose.model<IProject>('Project', projectSchema);