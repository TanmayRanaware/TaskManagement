import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Comment routes
router.post('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { comment: {} },
    message: 'Comment created successfully',
  });
}));

router.get('/byTask/:taskId', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { comments: [] },
    message: 'Comments retrieved successfully',
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
}));

export default router;