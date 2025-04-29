import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'in-progress' | 'completed' | 'expired' | 'closed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
  participants: mongoose.Types.ObjectId[];
  subtasks: mongoose.Types.ObjectId[];
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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
    required: [true, 'Task must have a creator']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  subtasks: [{
    type: Schema.Types.ObjectId,
    ref: 'SubTask'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ createdBy: 1 });

// Virtual for task duration
TaskSchema.virtual('duration').get(function() {
  return (this.dueDate as Date).getTime() - (this.createdAt as Date).getTime();
});

// Add after the TaskSchema definition but before the model export
TaskSchema.pre('findOneAndDelete', async function(this: any, next: (err?: Error) => void) {
  try {
    const task = this.getQuery();
    
    // Find and delete all subtasks
    const subtasks = await mongoose.model('SubTask').find({ _id: { $in: task.subtasks } });
    const subtaskIds = subtasks.map(subtask => subtask._id);
    
    // Delete all comments associated with the subtasks
    await mongoose.model('Comment').deleteMany({ subtask: { $in: subtaskIds } });
    
    // Delete the subtasks
    await mongoose.model('SubTask').deleteMany({ _id: { $in: subtaskIds } });
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<ITask>('Task', TaskSchema); 