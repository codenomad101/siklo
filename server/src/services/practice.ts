import { db } from '../db';
import { practiceSessions, NewPracticeSession, PracticeSession } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export class PracticeService {
  // Get available practice categories
  async getPracticeCategories() {
    return [
      { id: 'economy', name: 'Economy', description: 'Economic concepts and current affairs' },
      { id: 'gk', name: 'General Knowledge', description: 'General knowledge and current affairs' },
      { id: 'history', name: 'History', description: 'Historical events and facts' },
      { id: 'geography', name: 'Geography', description: 'Geographical concepts and facts' },
      { id: 'english', name: 'English', description: 'English grammar and vocabulary' },
      { id: 'aptitude', name: 'Aptitude', description: 'Quantitative and logical reasoning' },
      { id: 'agriculture', name: 'Agriculture', description: 'Agricultural concepts and practices' },
      { id: 'marathi', name: 'Marathi', description: 'Marathi grammar and language' },
    ];
  }

  // Get random questions from JSON files
  async getRandomQuestions(category: string, count: number = 20) {
    try {
      const dataPath = path.join(__dirname, '../../Padhlo/data');
      let fileName = '';
      
      switch (category) {
        case 'economy':
          fileName = 'English/economyEnglish.json';
          break;
        case 'gk':
          fileName = 'English/GKEnglish.json';
          break;
        case 'history':
          fileName = 'English/historyEnglish.json';
          break;
        case 'geography':
          fileName = 'English/geographyEnglish.json';
          break;
        case 'english':
          fileName = 'English/englishGrammer.json';
          break;
        case 'aptitude':
          fileName = 'English/AptitudeEnglish.json';
          break;
        case 'agriculture':
          fileName = 'English/agricultureEnglish.json';
          break;
        case 'marathi':
          fileName = 'Marathi/grammerMarathi.json';
          break;
        default:
          throw new Error('Invalid category');
      }

      const filePath = path.join(dataPath, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Questions file not found for category: ${category}`);
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(fileContent);

      if (!Array.isArray(questions)) {
        throw new Error('Invalid questions format');
      }

      // Shuffle and select random questions
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(count, questions.length));

      // Transform questions to match our format
      return selectedQuestions.map((q: any, index: number) => ({
        questionId: `q_${category}_${index}_${Date.now()}`,
        questionText: q.Question || q.questionText,
        options: q.Options || q.options || [],
        correctAnswer: q.CorrectAnswer || q.correctAnswer,
        explanation: q.Explanation || q.explanation,
        category: q.category || category,
        marks: 1,
        questionType: 'mcq'
      }));

    } catch (error) {
      console.error('Error loading questions:', error);
      throw new Error('Failed to load questions');
    }
  }

  // Create a new practice session
  async createPracticeSession(userId: string, category: string, timeLimitMinutes: number = 15) {
    try {
      const questions = await this.getRandomQuestions(category, 20);
      
      const newSession: NewPracticeSession = {
        userId,
        category: category as any,
        totalQuestions: questions.length,
        timeLimitMinutes,
        status: 'in_progress',
        questionsData: questions.map(q => ({
          questionId: q.questionId,
          userAnswer: '',
          isCorrect: false,
          timeSpentSeconds: 0
        }))
      };

      const [session] = await db.insert(practiceSessions).values(newSession).returning();
      
      return {
        session,
        questions
      };
    } catch (error) {
      console.error('Error creating practice session:', error);
      throw new Error('Failed to create practice session');
    }
  }

  // Get practice session by ID
  async getPracticeSession(sessionId: string, userId: string) {
    try {
      const [session] = await db
        .select()
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.sessionId, sessionId),
          eq(practiceSessions.userId, userId)
        ))
        .limit(1);

      return session;
    } catch (error) {
      console.error('Error fetching practice session:', error);
      throw new Error('Failed to fetch practice session');
    }
  }

  // Update practice session with answer
  async updatePracticeSessionAnswer(
    sessionId: string, 
    userId: string, 
    questionId: string, 
    userAnswer: string,
    timeSpentSeconds: number
  ) {
    try {
      const session = await this.getPracticeSession(sessionId, userId);
      
      if (!session) {
        throw new Error('Practice session not found');
      }

      if (session.status !== 'in_progress') {
        throw new Error('Session is not active');
      }

      // Update questions data
      const questionsData = session.questionsData || [];
      const questionIndex = questionsData.findIndex((q: any) => q.questionId === questionId);
      
      if (questionIndex === -1) {
        throw new Error('Question not found in session');
      }

      // Get the correct answer from the questions data
      const questions = await this.getRandomQuestions(session.category, session.totalQuestions);
      const question = questions.find((q: any) => q.questionId === questionId);
      
      if (!question) {
        throw new Error('Question data not found');
      }

      const isCorrect = userAnswer === question.correctAnswer;
      
      questionsData[questionIndex] = {
        questionId,
        userAnswer,
        isCorrect,
        timeSpentSeconds
      };

      // Update session statistics
      const correctAnswers = questionsData.filter((q: any) => q.isCorrect).length;
      const questionsAttempted = questionsData.filter((q: any) => q.userAnswer !== '').length;
      const incorrectAnswers = questionsAttempted - correctAnswers;
      const skippedQuestions = (session.totalQuestions || 0) - questionsAttempted;
      
      const percentage = (session.totalQuestions || 0) > 0 ? (correctAnswers / (session.totalQuestions || 1)) * 100 : 0;

      await db
        .update(practiceSessions)
        .set({
          questionsData,
          correctAnswers,
          incorrectAnswers,
          questionsAttempted,
          skippedQuestions,
          percentage: percentage.toString(),
          timeSpentSeconds: (session.timeSpentSeconds || 0) + timeSpentSeconds,
          updatedAt: new Date()
        })
        .where(eq(practiceSessions.sessionId, sessionId));

      return { isCorrect, correctAnswer: question.correctAnswer };
    } catch (error) {
      console.error('Error updating practice session:', error);
      throw new Error('Failed to update practice session');
    }
  }

  // Complete practice session
  async completePracticeSession(sessionId: string, userId: string) {
    try {
      const session = await this.getPracticeSession(sessionId, userId);
      
      if (!session) {
        throw new Error('Practice session not found');
      }

      await db
        .update(practiceSessions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(practiceSessions.sessionId, sessionId));

      return session;
    } catch (error) {
      console.error('Error completing practice session:', error);
      throw new Error('Failed to complete practice session');
    }
  }

  // Get user's practice history
  async getUserPracticeHistory(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const sessions = await db
        .select()
        .from(practiceSessions)
        .where(eq(practiceSessions.userId, userId))
        .orderBy(desc(practiceSessions.createdAt))
        .limit(limit)
        .offset(offset);

      return sessions;
    } catch (error) {
      console.error('Error fetching practice history:', error);
      throw new Error('Failed to fetch practice history');
    }
  }

  // Get practice statistics for user
  async getUserPracticeStats(userId: string) {
    try {
      const [totalSessions] = await db
        .select({ count: count() })
        .from(practiceSessions)
        .where(eq(practiceSessions.userId, userId));

      const [completedSessions] = await db
        .select({ count: count() })
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.status, 'completed')
        ));

      const sessions = await db
        .select({
          correctAnswers: practiceSessions.correctAnswers,
          totalQuestions: practiceSessions.totalQuestions,
          timeSpentSeconds: practiceSessions.timeSpentSeconds
        })
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.status, 'completed')
        ));

      const totalCorrect = sessions.reduce((sum, s) => sum + (s.correctAnswers || 0), 0);
      const totalQuestions = sessions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
      const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0);

      return {
        totalSessions: totalSessions.count,
        completedSessions: completedSessions.count,
        totalCorrectAnswers: totalCorrect,
        totalQuestionsAttempted: totalQuestions,
        averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0
      };
    } catch (error) {
      console.error('Error fetching practice stats:', error);
      throw new Error('Failed to fetch practice statistics');
    }
  }
}
