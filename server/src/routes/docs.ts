import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPISpec } from '../utils/openapi';

const router = Router();

// Generate OpenAPI specification
const openAPISpec = generateOpenAPISpec();

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openAPISpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Manager API Documentation',
}));

// Serve OpenAPI JSON
router.get('/json', (req, res) => {
  res.json(openAPISpec);
});

// Serve OpenAPI YAML
router.get('/yaml', (req, res) => {
  const yaml = require('js-yaml');
  res.setHeader('Content-Type', 'text/yaml');
  res.send(yaml.dump(openAPISpec));
});

export default router;
