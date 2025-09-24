import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { setupSocketHandlers } from './sockets/socketHandlers';

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    
    // Connect to databases
    logger.info('Connecting to databases...');
    await connectDatabase();
    await connectRedis();
    logger.info('Database connections established');

    // Start HTTP server
    logger.info('Starting HTTP server...');
    server.listen(Number(PORT), HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📚 API Documentation: http://${HOST}:${PORT}/docs`);
      logger.info(`🏥 Health Check: http://${HOST}:${PORT}/healthz`);
      logger.info(`📊 Metrics: http://${HOST}:${PORT}/metrics`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
      
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
