import mongoose, { Document, Schema } from 'mongoose';

export interface ISubTaskInput {
  title: string;
  description?: string;
  status: 'in-progress' | 'completed' | 'expired' | 'closed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  progress?: number;
  comments?: mongoose.Types.ObjectId[];
}

export interface ISubTask extends Document, ISubTaskInput {
  task: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubTaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'expired', 'closed'],
    default: 'in-progress',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Subtask must have a creator']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Subtask must belong to a task']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
SubTaskSchema.index({ status: 1 });
SubTaskSchema.index({ priority: 1 });
SubTaskSchema.index({ dueDate: 1 });
SubTaskSchema.index({ assignedTo: 1 });
SubTaskSchema.index({ createdBy: 1 });
SubTaskSchema.index({ task: 1 });

SubTaskSchema.pre('findOneAndDelete', async function(this: any, next: (err?: Error) => void) {
  try {
    const subtask = this.getQuery();
    // Delete all comments associated with this subtask
    await mongoose.model('Comment').deleteMany({ subtask: subtask._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<ISubTask>('SubTask', SubTaskSchema); 