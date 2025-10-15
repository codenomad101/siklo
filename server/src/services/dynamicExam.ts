import { db } from '../db';
import { dynamicExamSessions, NewDynamicExamSession, DynamicExamSession } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class DynamicExamService {
  // Create a new dynamic exam session
  async createExamSession(userId: string, examConfig: {
    examName: string;
    totalMarks: number;
    durationMinutes: number;
    questionDistribution: Array<{
      category: string;
      count: number;
      marksPerQuestion: number;
    }>;
    negativeMarking?: boolean;
    negativeMarksRatio?: number;
  }) {
    try {
      const totalQuestions = examConfig.questionDistribution.reduce((sum, dist) => sum + dist.count, 0);
      
      const newSession: NewDynamicExamSession = {
        userId,
        examName: examConfig.examName,
        totalMarks: examConfig.totalMarks,
        durationMinutes: examConfig.durationMinutes,
        totalQuestions,
        negativeMarking: examConfig.negativeMarking || false,
        negativeMarksRatio: examConfig.negativeMarksRatio?.toString() || '0.25',
        questionDistribution: examConfig.questionDistribution,
        status: 'not_started'
      };

      const [session] = await db.insert(dynamicExamSessions).values(newSession).returning();
      return session;
    } catch (error) {
      console.error('Error creating exam session:', error);
      throw new Error('Failed to create exam session');
    }
  }

  // Start an exam session
  async startExamSession(sessionId: string, userId: string) {
    try {
      const [session] = await db
        .update(dynamicExamSessions)
        .set({
          status: 'in_progress',
          startedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(dynamicExamSessions.sessionId, sessionId),
          eq(dynamicExamSessions.userId, userId)
        ))
        .returning();

      if (!session) {
        throw new Error('Exam session not found');
      }

      return session;
    } catch (error) {
      console.error('Error starting exam session:', error);
      throw new Error('Failed to start exam session');
    }
  }

  // Update exam session with questions data
  async updateExamSessionQuestions(sessionId: string, userId: string, questionsData: Array<{
    questionId: string;
    questionText: string;
    options: Array<{ id: number; text: string }>;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    marksObtained: number;
    category: string;
  }>) {
    try {
      const [session] = await db
        .update(dynamicExamSessions)
        .set({
          questionsData,
          updatedAt: new Date()
        })
        .where(and(
          eq(dynamicExamSessions.sessionId, sessionId),
          eq(dynamicExamSessions.userId, userId)
        ))
        .returning();

      return session;
    } catch (error) {
      console.error('Error updating exam session questions:', error);
      throw new Error('Failed to update exam session');
    }
  }

  // Complete an exam session
  async completeExamSession(sessionId: string, userId: string, completionData: {
    timeSpentSeconds: number;
    questionsAttempted: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    marksObtained: number;
    percentage: number;
  }) {
    try {
      const [session] = await db
        .update(dynamicExamSessions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          timeSpentSeconds: completionData.timeSpentSeconds,
          questionsAttempted: completionData.questionsAttempted,
          correctAnswers: completionData.correctAnswers,
          incorrectAnswers: completionData.incorrectAnswers,
          skippedQuestions: completionData.skippedQuestions,
          marksObtained: completionData.marksObtained.toString(),
          percentage: completionData.percentage.toString(),
          updatedAt: new Date()
        })
        .where(and(
          eq(dynamicExamSessions.sessionId, sessionId),
          eq(dynamicExamSessions.userId, userId)
        ))
        .returning();

      if (!session) {
        throw new Error('Exam session not found');
      }

      return session;
    } catch (error) {
      console.error('Error completing exam session:', error);
      throw new Error('Failed to complete exam session');
    }
  }

  // Get exam session by ID
  async getExamSession(sessionId: string, userId: string) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sessionId)) {
        throw new Error(`Invalid session ID format: ${sessionId}`);
      }

      const [session] = await db
        .select()
        .from(dynamicExamSessions)
        .where(and(
          eq(dynamicExamSessions.sessionId, sessionId),
          eq(dynamicExamSessions.userId, userId)
        ))
        .limit(1);

      return session;
    } catch (error) {
      console.error('Error fetching exam session:', error);
      if (error.message.includes('Invalid session ID format')) {
        throw error;
      }
      throw new Error('Failed to fetch exam session');
    }
  }

  // Get user's exam history
  async getUserExamHistory(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const sessions = await db
        .select()
        .from(dynamicExamSessions)
        .where(eq(dynamicExamSessions.userId, userId))
        .orderBy(desc(dynamicExamSessions.createdAt))
        .limit(limit)
        .offset(offset);

      return sessions;
    } catch (error) {
      console.error('Error fetching exam history:', error);
      throw new Error('Failed to fetch exam history');
    }
  }

  // Get user's exam statistics
  async getUserExamStats(userId: string) {
    try {
      const sessions = await db
        .select({
          totalSessions: dynamicExamSessions.sessionId,
          totalMarks: dynamicExamSessions.marksObtained,
          totalTime: dynamicExamSessions.timeSpentSeconds,
          averagePercentage: dynamicExamSessions.percentage,
          examName: dynamicExamSessions.examName,
          completedAt: dynamicExamSessions.completedAt
        })
        .from(dynamicExamSessions)
        .where(and(
          eq(dynamicExamSessions.userId, userId),
          eq(dynamicExamSessions.status, 'completed')
        ));

      const totalSessions = sessions.length;
      const totalMarks = sessions.reduce((sum, s) => sum + parseFloat(s.totalMarks || '0'), 0);
      const totalTime = sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0);
      const averagePercentage = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + parseFloat(s.averagePercentage || '0'), 0) / sessions.length 
        : 0;

      return {
        totalSessions,
        totalMarks,
        totalTimeMinutes: Math.round(totalTime / 60),
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        recentExams: sessions.slice(0, 10).map(s => ({
          examName: s.examName,
          marksObtained: s.totalMarks,
          percentage: s.averagePercentage,
          completedAt: s.completedAt
        }))
      };
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      throw new Error('Failed to fetch exam statistics');
    }
  }

  // Generate random questions from categories
  async generateQuestionsFromCategories(questionDistribution: Array<{
    category: string;
    count: number;
    marksPerQuestion: number;
  }>) {
    try {
      console.log('Generating questions for distribution:', questionDistribution);
      const allQuestions: any[] = [];
      
      for (const dist of questionDistribution) {
        console.log(`Processing category: ${dist.category}, count: ${dist.count}`);
        let questionsData: any[] = [];
        
        try {
          // Load questions based on category
          switch (dist.category) {
            case 'economy':
              questionsData = require('../../data/English/economyEnglish.json');
              break;
            case 'gk':
              questionsData = require('../../data/English/GKEnglish.json');
              break;
            case 'history':
              questionsData = require('../../data/English/historyEnglish.json');
              break;
            case 'geography':
              questionsData = require('../../data/English/geographyEnglish.json');
              break;
            case 'english':
              questionsData = require('../../data/English/englishGrammer.json');
              break;
            case 'aptitude':
              questionsData = require('../../data/English/AptitudeEnglish.json');
              break;
            case 'agriculture':
              questionsData = require('../../data/English/agricultureEnglish.json');
              break;
            case 'marathi':
              questionsData = require('../../data/Marathi/grammerMarathi.json');
              break;
            default:
              console.log(`Unknown category: ${dist.category}, skipping`);
              continue;
          }

          console.log(`Loaded ${questionsData?.length || 0} questions for category ${dist.category}`);

          if (!Array.isArray(questionsData) || questionsData.length === 0) {
            console.log(`No questions found for category ${dist.category}`);
            continue;
          }

          // Shuffle and select required number of questions
          const shuffled = questionsData.sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, Math.min(dist.count, questionsData.length));

          console.log(`Selected ${selectedQuestions.length} questions for category ${dist.category}`);

          // Transform to our format
          const formattedQuestions = selectedQuestions.map((q: any, index: number) => ({
            questionId: `${dist.category}_${Date.now()}_${index + 1}`,
            questionText: q.Question || q.question || '',
            options: q.Options ? q.Options.map((opt: any, optIndex: number) => ({
              id: optIndex + 1,
              text: typeof opt === 'string' ? opt : opt.text || opt.id || ''
            })) : [],
            correctAnswer: q.CorrectAnswer || q.correctAnswer || q.Answer || '',
            userAnswer: '',
            isCorrect: false,
            timeSpentSeconds: 0,
            marksObtained: 0,
            category: dist.category,
            marksPerQuestion: dist.marksPerQuestion,
            explanation: q.Explanation || q.explanation || ''
          }));

          allQuestions.push(...formattedQuestions);
          console.log(`Added ${formattedQuestions.length} formatted questions for category ${dist.category}`);
        } catch (categoryError) {
          console.error(`Error processing category ${dist.category}:`, categoryError);
          // Continue with other categories
        }
      }

      console.log(`Total questions generated: ${allQuestions.length}`);
      
      if (allQuestions.length === 0) {
        throw new Error('No questions could be generated from the provided categories');
      }

      // Shuffle all questions together
      return allQuestions.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }
}
