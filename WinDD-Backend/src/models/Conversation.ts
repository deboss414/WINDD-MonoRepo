import mongoose, { Document, Schema } from 'mongoose';
import { TaskStatus } from '../shared/types/task.types';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'member';
    lastSeen?: Date;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
  };
  updatedAt: Date;
  unreadCount: number;
}

const ConversationSchema = new Schema<IConversation>({
  taskId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  taskStatus: { type: String, required: true },
  participants: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    role: { type: String, enum: ['owner', 'member'], required: true },
    lastSeen: Date
  }],
  lastMessage: {
    id: String,
    content: String,
    senderId: String,
    senderName: String,
    timestamp: Date
  },
  updatedAt: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for faster queries
ConversationSchema.index({ taskId: 1 });
ConversationSchema.index({ 'participants.id': 1 });
ConversationSchema.index({ updatedAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema); 