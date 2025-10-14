import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createExamSession,
  startExamSession,
  generateExamQuestions,
  submitExamAnswers,
  completeExamSession,
  getExamSession,
  getUserExamHistory,
  getUserExamStats
} from '../controllers/dynamicExam';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new dynamic exam session
router.post('/create', createExamSession);

// Start an exam session
router.post('/:sessionId/start', startExamSession);

// Generate questions for exam session
router.get('/:sessionId/questions', generateExamQuestions);

// Submit exam answers
router.post('/:sessionId/answers', submitExamAnswers);

// Complete exam session
router.post('/:sessionId/complete', completeExamSession);

// Get exam session details
router.get('/:sessionId', getExamSession);

// Get user's exam history
router.get('/history', getUserExamHistory);

// Get user's exam statistics
router.get('/stats', getUserExamStats);

export default router;
