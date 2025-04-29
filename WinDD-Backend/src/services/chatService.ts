import Conversation, { IConversation } from '../models/Conversation';
import Message, { IMessage } from '../models/Message';
import { TaskStatus } from '../shared/types/task.types';
import { getWebSocketService } from './websocketService';

export class ChatService {
  // Get all conversations for a user
  async getConversations(userId: string): Promise<IConversation[]> {
    return Conversation.find({
      'participants.id': userId
    })
    .sort({ updatedAt: -1 })
    .exec();
  }

  // Get a single conversation with its messages
  async getConversation(conversationId: string): Promise<{
    id: string;
    taskId: string;
    taskTitle: string;
    taskStatus: TaskStatus;
    participants: IConversation['participants'];
    messages: IMessage[];
    lastMessage?: IMessage;
    updatedAt: string;
    unreadCount: number;
  }> {
    const [conversation, messages] = await Promise.all([
      Conversation.findById(conversationId).exec(),
      Message.find({ conversationId })
        .sort({ timestamp: 1 })
        .exec()
    ]);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      id: conversation._id.toString(),
      taskId: conversation.taskId,
      taskTitle: conversation.taskTitle,
      taskStatus: conversation.taskStatus,
      participants: conversation.participants,
      messages,
      lastMessage: messages[messages.length - 1] || undefined,
      updatedAt: conversation.updatedAt.toISOString(),
      unreadCount: conversation.unreadCount
    };
  }

  // Create a new conversation
  async createConversation(
    taskId: string,
    taskTitle: string,
    taskStatus: TaskStatus,
    participants: IConversation['participants']
  ): Promise<{
    id: string;
    taskId: string;
    taskTitle: string;
    taskStatus: TaskStatus;
    participants: IConversation['participants'];
    updatedAt: string;
    unreadCount: number;
  }> {
    const conversation = new Conversation({
      taskId,
      taskTitle,
      taskStatus,
      participants,
      unreadCount: 0
    });

    const savedConversation = await conversation.save();
    
    return {
      id: savedConversation._id.toString(),
      taskId: savedConversation.taskId,
      taskTitle: savedConversation.taskTitle,
      taskStatus: savedConversation.taskStatus,
      participants: savedConversation.participants,
      updatedAt: savedConversation.updatedAt.toISOString(),
      unreadCount: savedConversation.unreadCount
    };
  }

  // Send a new message
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    replyTo?: { id: string; senderName: string; content: string }
  ): Promise<IMessage> {
    const message = new Message({
      conversationId,
      senderId,
      senderName,
      content,
      readBy: [senderId],
      replyTo
    });

    // Update conversation's last message and unread count
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: {
          id: message._id,
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp
        },
        updatedAt: new Date(),
        $inc: { unreadCount: 1 }
      }
    ).exec();

    const savedMessage = await message.save();
    
    // Emit new message event
    await getWebSocketService().emitNewMessage(savedMessage);
    
    return savedMessage;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await Promise.all([
      Message.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      ).exec(),
      Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { unreadCount: 0 } }
      ).exec()
    ]);
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    await Message.findByIdAndDelete(messageId).exec();
    
    // Emit message deletion event
    await getWebSocketService().emitMessageDeletion(message.conversationId, messageId);
  }

  // Edit a message
  async editMessage(messageId: string, content: string): Promise<IMessage | null> {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    ).exec();

    if (message) {
      // Emit message update event
      await getWebSocketService().emitMessageUpdate(message);
    }

    return message;
  }
}

export default new ChatService(); 