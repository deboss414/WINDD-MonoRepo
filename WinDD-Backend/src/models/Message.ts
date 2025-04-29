import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  readBy: string[];
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }],
  replyTo: {
    id: String,
    senderName: String,
    content: String
  }
}, {
  timestamps: true
});

// Index for faster queries
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ senderId: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema); 