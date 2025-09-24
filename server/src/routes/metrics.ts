import { Router } from 'express';
import { getMetrics } from '../middleware/metrics';

const router = Router();

// Prometheus metrics endpoint
router.get('/', getMetrics);

export default router;
