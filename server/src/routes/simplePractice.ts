import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createPracticeSession,
  getUserPracticeHistory,
  getUserPracticeStats,
  getPracticeSession,
  updatePracticeAnswer,
  completePracticeSession
} from '../controllers/simplePractice';
import { PracticeService } from '../services/practice';

const router = Router();
const practiceService = new PracticeService();

// Public routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await practiceService.getPracticeCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
});

// Protected routes for active practice sessions
router.post('/sessions', authenticateToken, createPracticeSession);
router.get('/sessions/:sessionId', authenticateToken, getPracticeSession);
router.patch('/sessions/:sessionId/answer', authenticateToken, updatePracticeAnswer);
router.patch('/sessions/:sessionId/complete', authenticateToken, completePracticeSession);

// Protected routes for session tracking
router.get('/history', authenticateToken, getUserPracticeHistory);
router.get('/stats', authenticateToken, getUserPracticeStats);

export default router;
