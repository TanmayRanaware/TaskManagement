import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// User routes
router.get('/me', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: (req as any).user },
    message: 'User profile retrieved successfully',
  });
}));

router.patch('/me', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'User profile updated successfully',
  });
}));

router.get('/search', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { users: [] },
    message: 'Users retrieved successfully',
  });
}));

export default router;