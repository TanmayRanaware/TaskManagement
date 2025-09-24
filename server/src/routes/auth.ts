import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authController } from '../controllers/authController';

const router = Router();

// Authentication routes
router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', asyncHandler(authController.logout));
router.post('/password/request', asyncHandler(authController.requestPasswordReset));
router.post('/password/reset', asyncHandler(authController.resetPassword));

export default router;