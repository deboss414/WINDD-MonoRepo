import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { config } from './config';
import userRoutes from './routes/user';
import userManagementRoutes from './routes/userManagement';
import taskRoutes from './routes/taskRoutes';
import chatRoutes from './routes/chatRoutes';
import { requestLogger, mongooseLogger } from './middleware/logging';
import { initializeWebSocket } from './services/websocketService';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Enable mongoose query logging
mongooseLogger();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);  // Add request logging middleware

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const port = parseInt(config.PORT as string, 10);
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 