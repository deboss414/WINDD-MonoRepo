import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  text: string;
  author: {
    id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  parentComment?: mongoose.Types.ObjectId;
  isEdited: boolean;
  subtask: mongoose.Types.ObjectId;
  replies?: IComment[];
}

const CommentSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  subtask: {
    type: Schema.Types.ObjectId,
    ref: 'SubTask',
    required: [true, 'Comment must be associated with a subtask']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CommentSchema.index({ subtask: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ createdAt: -1 });

// Virtual for replies
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Ensure virtuals are included in toJSON and toObject
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

// Pre-find middleware to populate author and replies
CommentSchema.pre('find', function() {
  this.populate({
    path: 'author',
    select: 'firstName lastName email'
  }).populate({
    path: 'replies',
    populate: {
      path: 'author',
      select: 'firstName lastName email'
    }
  });
});

export default mongoose.model<IComment>('Comment', CommentSchema); 