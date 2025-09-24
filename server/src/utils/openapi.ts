export const generateOpenAPISpec = () => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'A comprehensive task management API with real-time collaboration features',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.taskmanager.com' 
          : 'http://localhost:4000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    paths: {
      '/': {
        get: {
          summary: 'API Root',
          description: 'Get basic API information',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      version: { type: 'string' },
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/healthz': {
        get: {
          summary: 'Health Check',
          description: 'Check the health of the API and its dependencies',
          responses: {
            '200': {
              description: 'Healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                      uptime: { type: 'number' },
                      services: {
                        type: 'object',
                        properties: {
                          database: { type: 'string' },
                          redis: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};