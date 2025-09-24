import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  mentions: mongoose.Types.ObjectId[];
  parentId?: mongoose.Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  replies: IComment[];
  replyCount: number;
  
  // Methods
  addMention(userId: mongoose.Types.ObjectId): void;
  removeMention(userId: mongoose.Types.ObjectId): void;
  edit(body: string): void;
}

const commentSchema = new Schema<IComment>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  mentions: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    index: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
commentSchema.index({ taskId: 1, createdAt: 1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ mentions: 1 });

// Virtuals
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { createdAt: 1 } },
});

commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
  count: true,
});

// Instance methods
commentSchema.methods.addMention = function(userId: mongoose.Types.ObjectId): void {
  if (!this.mentions.includes(userId)) {
    this.mentions.push(userId);
  }
};

commentSchema.methods.removeMention = function(userId: mongoose.Types.ObjectId): void {
  this.mentions = this.mentions.filter(
    (mention: mongoose.Types.ObjectId) => mention.toString() !== userId.toString()
  );
};

commentSchema.methods.edit = function(body: string): void {
  this.body = body;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Static methods
commentSchema.statics.findByTask = function(taskId: mongoose.Types.ObjectId) {
  return this.find({ taskId, parentId: null })
    .populate('authorId', 'name email avatarUrl')
    .populate('mentions', 'name email')
    .populate({
      path: 'replies',
      populate: {
        path: 'authorId',
        select: 'name email avatarUrl',
      },
    })
    .sort({ createdAt: 1 });
};

commentSchema.statics.findByAuthor = function(authorId: mongoose.Types.ObjectId) {
  return this.find({ authorId }).sort({ createdAt: -1 });
};

commentSchema.statics.findMentions = function(userId: mongoose.Types.ObjectId) {
  return this.find({ mentions: userId }).sort({ createdAt: -1 });
};

export const Comment = mongoose.model<IComment>('Comment', commentSchema);