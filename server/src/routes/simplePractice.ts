import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createPracticeSession,
  getUserPracticeHistory,
  getUserPracticeStats
} from '../controllers/simplePractice';

const router = Router();

// Protected routes (only for session tracking)
router.post('/sessions', authenticateToken, createPracticeSession);
router.get('/history', authenticateToken, getUserPracticeHistory);
router.get('/stats', authenticateToken, getUserPracticeStats);

export default router;
