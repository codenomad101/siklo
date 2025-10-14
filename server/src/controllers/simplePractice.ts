import { Request, Response } from 'express';
import { PracticeService } from '../services/simplePractice';
import { z } from 'zod';

const practiceService = new PracticeService();

// Validation schemas
const CreatePracticeSessionSchema = z.object({
  category: z.enum(['economy', 'gk', 'history', 'geography', 'english', 'aptitude', 'agriculture', 'marathi']),
  totalQuestions: z.number().min(1).max(50).optional().default(20),
  timeLimitMinutes: z.number().min(5).max(60).optional().default(15),
  questionsData: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string(),
    isCorrect: z.boolean(),
    timeSpentSeconds: z.number().min(0)
  })).optional().default([]),
  timeSpentSeconds: z.number().min(0).optional().default(0),
  correctAnswers: z.number().min(0).optional().default(0),
  incorrectAnswers: z.number().min(0).optional().default(0),
  questionsAttempted: z.number().min(0).optional().default(0),
  skippedQuestions: z.number().min(0).optional().default(0),
  percentage: z.number().min(0).max(100).optional().default(0),
  status: z.enum(['completed']).optional().default('completed')
});

// Create a practice session (for tracking completed sessions)
export const createPracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const validatedData = CreatePracticeSessionSchema.parse(req.body);
    
    const session = await practiceService.createPracticeSession(
      userId,
      validatedData.category,
      validatedData
    );
    
    res.status(201).json({
      success: true,
      message: 'Practice session saved successfully',
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to save practice session',
    });
  }
};

// Get user's practice history
export const getUserPracticeHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { limit = '50', offset = '0' } = req.query;
    
    const sessions = await practiceService.getUserPracticeHistory(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch practice history',
    });
  }
};

// Get user's practice statistics
export const getUserPracticeStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const stats = await practiceService.getUserPracticeStats(userId);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch practice statistics',
    });
  }
};
