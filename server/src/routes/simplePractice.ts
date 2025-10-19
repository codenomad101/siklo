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
import { db } from '../db';
import { practiceCategories, practiceTopics } from '../db/schema';
import { eq, or } from 'drizzle-orm';

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

// Public: Get topics for a category (by slug or categoryId)
router.get('/topics', async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    if (!category) {
      return res.status(400).json({ success: false, message: 'category (slug or id) is required' });
    }

    // Resolve categoryId from slug or direct id
    let categoryId = category;
    if (category.length !== 36) {
      const [cat] = await db
        .select()
        .from(practiceCategories)
        .where(eq(practiceCategories.slug, category));
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      categoryId = cat.categoryId;
    }

    const topics = await db
      .select()
      .from(practiceTopics)
      .where(eq(practiceTopics.categoryId, categoryId))
      .orderBy(practiceTopics.sortOrder, practiceTopics.name);

    return res.json({ success: true, data: topics });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch topics' });
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
