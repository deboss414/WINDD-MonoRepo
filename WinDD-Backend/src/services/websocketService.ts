import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Message, { IMessage } from '../models/Message';

export class WebSocketService {
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // In production, replace with your frontend URL
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join conversation room
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Client ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`Client ${socket.id} left conversation ${conversationId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit new message to conversation room
  async emitNewMessage(message: IMessage) {
    this.io.to(message.conversationId).emit('new_message', message);
  }

  // Emit message update to conversation room
  async emitMessageUpdate(message: IMessage) {
    this.io.to(message.conversationId).emit('message_update', message);
  }

  // Emit message deletion to conversation room
  async emitMessageDeletion(conversationId: string, messageId: string) {
    this.io.to(conversationId).emit('message_deleted', messageId);
  }

  // Emit conversation update to all participants
  async emitConversationUpdate(conversationId: string, update: any) {
    this.io.to(conversationId).emit('conversation_update', update);
  }
}

let webSocketService: WebSocketService;

export const initializeWebSocket = (server: HttpServer) => {
  webSocketService = new WebSocketService(server);
  return webSocketService;
};

export const getWebSocketService = () => {
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return webSocketService;
}; 