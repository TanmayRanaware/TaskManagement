import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`User ${user.email} connected via Socket.IO`);

    // Join project rooms
    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${user.email} joined project ${projectId}`);
    });

    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.info(`User ${user.email} left project ${projectId}`);
    });

    // Task events
    socket.on('task_created', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('task_created', data);
    });

    socket.on('task_updated', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('task_updated', data);
    });

    socket.on('task_moved', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('task_moved', data);
    });

    socket.on('task_deleted', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('task_deleted', data);
    });

    // Comment events
    socket.on('comment_created', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('comment_created', data);
    });

    // Typing indicators
    socket.on('typing_start', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('typing_start', {
        userId: user.userId,
        userName: user.name,
        taskId: data.taskId,
      });
    });

    socket.on('typing_stop', (data: any) => {
      socket.to(`project:${data.projectId}`).emit('typing_stop', {
        userId: user.userId,
        userName: user.name,
        taskId: data.taskId,
      });
    });

    // Notification events
    socket.on('notification_push', (data: any) => {
      socket.to(`user:${data.userId}`).emit('notification_push', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${user.email} disconnected from Socket.IO`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.info('Socket.IO handlers configured');
};