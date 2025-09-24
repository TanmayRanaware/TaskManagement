import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Activity routes
router.get('/byProject/:projectId', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { activities: [] },
    message: 'Activity log retrieved successfully',
  });
}));

export default router;
