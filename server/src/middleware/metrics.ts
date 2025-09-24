import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram } from 'prom-client';

// Create custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const tasksCreated = new Counter({
  name: 'tasks_created_total',
  help: 'Total number of tasks created',
  labelNames: ['project_id'],
});

export const tasksUpdated = new Counter({
  name: 'tasks_updated_total',
  help: 'Total number of tasks updated',
  labelNames: ['project_id'],
});

export const tasksMoved = new Counter({
  name: 'tasks_moved_total',
  help: 'Total number of tasks moved',
  labelNames: ['project_id', 'from_status', 'to_status'],
});

export const commentsCreated = new Counter({
  name: 'comments_created_total',
  help: 'Total number of comments created',
  labelNames: ['task_id'],
});

export const usersRegistered = new Counter({
  name: 'users_registered_total',
  help: 'Total number of users registered',
});

export const projectsCreated = new Counter({
  name: 'projects_created_total',
  help: 'Total number of projects created',
});

export const taskMoveLatency = new Histogram({
  name: 'task_move_latency_seconds',
  help: 'Latency of task move operations in seconds',
  labelNames: ['project_id'],
  buckets: [0.1, 0.2, 0.5, 1, 2, 5],
});

// Prometheus middleware
export const prometheusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Get route pattern for better metrics
  const route = req.route?.path || req.path;
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
};

// Metrics endpoint handler
export const getMetrics = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end('Error generating metrics');
  }
};
