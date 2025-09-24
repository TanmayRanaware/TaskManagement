import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Notification routes
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { notifications: [] },
    message: 'Notifications retrieved successfully',
  });
}));

router.post('/read', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Notifications marked as read',
  });
}));

export default router;
