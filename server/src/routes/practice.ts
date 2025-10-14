import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPracticeCategories,
  createPracticeSession,
  getPracticeSession,
  updatePracticeSessionAnswer,
  completePracticeSession,
  getUserPracticeHistory,
  getUserPracticeStats
} from '../controllers/practice';

const router = Router();

// Public routes
router.get('/categories', getPracticeCategories);

// Protected routes
router.post('/sessions', authenticateToken, createPracticeSession);
router.get('/sessions/:sessionId', authenticateToken, getPracticeSession);
router.patch('/sessions/:sessionId/answer', authenticateToken, updatePracticeSessionAnswer);
router.patch('/sessions/:sessionId/complete', authenticateToken, completePracticeSession);
router.get('/history', authenticateToken, getUserPracticeHistory);
router.get('/stats', authenticateToken, getUserPracticeStats);

export default router;
