import 'express-async-errors';
import dotenv from 'dotenv';
import { server, initializeApp } from './app';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Initialize database connections
    console.log('Connecting to databases...');
    try {
      await initializeApp();
      console.log('Database connections established');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      throw dbError;
    }

    // Start HTTP server
    console.log('Starting HTTP server...');
    server.listen(Number(PORT), HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api/v1/docs`);
      logger.info(`🏥 Health Check: http://${HOST}:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
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

// Start the server
startServer();

export default server;
