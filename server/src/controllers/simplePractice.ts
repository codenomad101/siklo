import { Request, Response } from 'express';
import { PracticeService } from '../services/simplePractice';
import { PracticeService as BackendPracticeService } from '../services/practice';
import { z } from 'zod';

const practiceService = new PracticeService();
const backendPracticeService = new BackendPracticeService();

// Validation schemas
const CreatePracticeSessionSchema = z.object({
  category: z.string(),
  timeLimitMinutes: z.number().min(5).max(60).optional().default(15),
});

const UpdateAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
  timeSpentSeconds: z.number().min(0),
});

// Create a new practice session (for active sessions)
export const createPracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const validatedData = CreatePracticeSessionSchema.parse(req.body);
    
    const session = await backendPracticeService.createPracticeSession(
      userId,
      validatedData.category,
      validatedData.timeLimitMinutes
    );
    
    res.status(201).json({
      success: true,
      message: 'Practice session created successfully',
      data: session,
    });
  } catch (error: any) {
    console.error('Create practice session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create practice session',
    });
  }
};

// Get practice session by ID
export const getPracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { sessionId } = req.params;
    
    const session = await backendPracticeService.getPracticeSession(sessionId, userId);
    
    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Get practice session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch practice session',
    });
  }
};

// Update practice session with answer
export const updatePracticeAnswer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { sessionId } = req.params;
    const validatedData = UpdateAnswerSchema.parse(req.body);
    
    const result = await backendPracticeService.updatePracticeSessionAnswer(
      sessionId,
      userId,
      validatedData.questionId,
      validatedData.userAnswer,
      validatedData.timeSpentSeconds
    );
    
    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Update practice answer error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update answer',
    });
  }
};

// Complete practice session
export const completePracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { sessionId } = req.params;
    
    const result = await backendPracticeService.completePracticeSession(sessionId, userId);
    
    res.json({
      success: true,
      message: 'Practice session completed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Complete practice session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete practice session',
    });
  }
};

// Legacy validation schema for completed sessions
const CreateCompletedPracticeSessionSchema = z.object({
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

// Create a practice session (for tracking completed sessions) - Legacy endpoint
export const createCompletedPracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const validatedData = CreateCompletedPracticeSessionSchema.parse(req.body);
    
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
