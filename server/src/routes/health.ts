import { Router } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check MongoDB connection
    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        healthCheck.services.database = 'healthy';
      } else {
        healthCheck.services.database = 'unhealthy';
      }
    } catch (error) {
      healthCheck.services.database = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis connection
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.ping();
        healthCheck.services.redis = 'healthy';
      } else {
        healthCheck.services.redis = 'unhealthy';
      }
    } catch (error) {
      healthCheck.services.redis = 'unhealthy';
      logger.error('Redis health check failed:', error);
    }

    // Determine overall health
    const allServicesHealthy = Object.values(healthCheck.services).every(
      status => status === 'healthy'
    );

    const statusCode = allServicesHealthy ? 200 : 503;
    healthCheck.status = allServicesHealthy ? 'healthy' : 'unhealthy';

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    const readinessCheck = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: false,
        redis: false,
      },
    };

    // Check MongoDB readiness
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      readinessCheck.services.database = true;
    }

    // Check Redis readiness
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      readinessCheck.services.redis = true;
    }

    const isReady = Object.values(readinessCheck.services).every(Boolean);
    const statusCode = isReady ? 200 : 503;
    readinessCheck.status = isReady ? 'ready' : 'not ready';

    res.status(statusCode).json(readinessCheck);
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;