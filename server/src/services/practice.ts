import { db } from '../db';
import { practiceSessions, practiceCategories, practiceQuestions, NewPracticeSession, PracticeSession } from '../db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { StatisticsService } from './statistics';

export class PracticeService {
  // Get available practice categories from database or JSON files
  async getPracticeCategories() {
    try {
      // Try to get categories from database first
      try {
        const categories = await db
          .select({
            id: practiceCategories.categoryId,
            categoryId: practiceCategories.categoryId,
            slug: practiceCategories.slug,
            name: practiceCategories.name,
            description: practiceCategories.description,
            questionCount: practiceCategories.totalQuestions,
            color: practiceCategories.color,
            language: practiceCategories.language,
            timeLimitMinutes: practiceCategories.timeLimitMinutes,
            questionsPerSession: practiceCategories.questionsPerSession
          })
          .from(practiceCategories)
          .where(eq(practiceCategories.status, 'active'))
          .orderBy(practiceCategories.sortOrder, practiceCategories.name);

        if (categories.length > 0) {
          return categories;
        }
      } catch (dbError) {
        console.log('Database categories not available, using JSON file counts');
      }

      // Fallback to hardcoded categories with JSON file counts
      return this.getCategoriesFromJsonFiles();

    } catch (error) {
      console.error('Error fetching practice categories:', error);
      throw new Error('Failed to fetch practice categories');
    }
  }

  // Get categories with question counts from JSON files
  private getCategoriesFromJsonFiles() {
    const categoryMapping = [
      { id: 'economy', name: 'Economy', description: 'Economic concepts and current affairs', color: '#3b82f6', language: 'English', fileName: 'economyEnglish.json' },
      { id: 'gk', name: 'General Knowledge', description: 'General awareness and current events', color: '#10b981', language: 'English', fileName: 'GKEnglish.json' },
      { id: 'history', name: 'History', description: 'Indian and world history', color: '#f59e0b', language: 'English', fileName: 'historyEnglish.json' },
      { id: 'geography', name: 'Geography', description: 'Physical and human geography', color: '#8b5cf6', language: 'English', fileName: 'geographyEnglish.json' },
      { id: 'english', name: 'English', description: 'Grammar and language skills', color: '#ec4899', language: 'English', fileName: 'englishGrammer.json' },
      { id: 'aptitude', name: 'Aptitude', description: 'Quantitative and logical reasoning', color: '#06b6d4', language: 'English', fileName: 'AptitudeEnglish.json' },
      { id: 'agriculture', name: 'Agriculture', description: 'Agricultural science and practices', color: '#84cc16', language: 'English', fileName: 'agricultureEnglish.json' },
      { id: 'marathi', name: 'Marathi', description: 'Marathi language and literature', color: '#f97316', language: 'Marathi', fileName: 'grammerMarathi.json' }
    ];

    return categoryMapping.map(category => {
      try {
        let questionCount = 0;
        const filePath = category.language === 'Marathi' 
          ? `../../../data/Marathi/${category.fileName}`
          : `../../../data/English/${category.fileName}`;
        
        const questionsData = require(filePath);
        if (Array.isArray(questionsData)) {
          questionCount = questionsData.length;
        }
        
        return {
          ...category,
          questionCount,
          timeLimitMinutes: 15,
          questionsPerSession: 20
        };
      } catch (error) {
        console.error(`Error loading question count for ${category.name}:`, error);
        return {
          ...category,
          questionCount: 0,
          timeLimitMinutes: 15,
          questionsPerSession: 20
        };
      }
    });
  }

  // Get random questions from database or JSON files
  async getRandomQuestions(categorySlug: string, count: number = 20) {
    try {
      // First try to get questions from database
      try {
        const [category] = await db
          .select()
          .from(practiceCategories)
          .where(and(
            eq(practiceCategories.slug, categorySlug),
            eq(practiceCategories.status, 'active')
          ))
          .limit(1);

        if (category) {
          const questions = await db
            .select()
            .from(practiceQuestions)
            .where(and(
              eq(practiceQuestions.categoryId, category.categoryId),
              eq(practiceQuestions.status, 'active')
            ))
            .orderBy(sql`RANDOM()`)
            .limit(Math.min(count, category.totalQuestions));

          if (questions.length > 0) {
            return questions.map((q) => ({
              questionId: q.questionId,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || '',
              category: categorySlug,
              marks: q.marks,
              questionType: q.questionType,
              difficulty: q.difficulty
            }));
          }
        }
      } catch (dbError) {
        console.log('Database questions not available, falling back to JSON files');
      }

      // Fallback to JSON files
      return this.getQuestionsFromJsonFiles(categorySlug, count);

    } catch (error) {
      console.error('Error loading questions:', error);
      throw new Error('Failed to load questions');
    }
  }

  // Load questions from JSON files as fallback
  private getQuestionsFromJsonFiles(categorySlug: string, count: number = 20) {
    try {
      let questionsData: any[] = [];
      
      // Load questions based on category
      switch (categorySlug) {
        case 'economy':
          questionsData = require('../../../data/English/economyEnglish.json');
          break;
        case 'gk':
          questionsData = require('../../../data/English/GKEnglish.json');
          break;
        case 'history':
          questionsData = require('../../../data/English/historyEnglish.json');
          break;
        case 'geography':
          questionsData = require('../../../data/English/geographyEnglish.json');
          break;
        case 'english':
          questionsData = require('../../../data/English/englishGrammer.json');
          break;
        case 'aptitude':
          questionsData = require('../../../data/English/AptitudeEnglish.json');
          break;
        case 'agriculture':
          questionsData = require('../../../data/English/agricultureEnglish.json');
          break;
        case 'marathi':
          questionsData = require('../../../data/Marathi/grammerMarathi.json');
          break;
        default:
          throw new Error('Category not found');
      }

      if (!Array.isArray(questionsData)) {
        throw new Error('Invalid JSON format');
      }

      // Shuffle and select required number of questions
      const shuffled = questionsData.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, count);

      // Transform to our format
      return selectedQuestions.map((q: any, index: number) => {
        console.log(`Processing question ${index + 1}:`, {
          questionText: q.Question,
          options: q.Options,
          correctAnswer: q.CorrectAnswer
        });
        
        return {
          questionId: `${categorySlug}_${index + 1}`,
          questionText: q.Question || q.question || '',
          options: q.Options ? q.Options.map((opt: any, optIndex: number) => {
            // Handle different option formats
            if (typeof opt === 'string') {
              return {
                id: optIndex + 1,
                text: opt
              };
            } else if (opt && typeof opt === 'object') {
              return {
                id: opt.id || optIndex + 1,
                text: opt.text || opt.label || opt.value || String(opt)
              };
            } else {
              return {
                id: optIndex + 1,
                text: String(opt || '')
              };
            }
          }) : [],
          correctAnswer: q.CorrectAnswer || q.correctAnswer || '',
          explanation: q.Explanation || q.explanation || '',
          category: categorySlug,
          marks: 1,
          questionType: 'mcq',
          difficulty: 'medium'
        };
      });

    } catch (error) {
      console.error('Error loading questions from JSON:', error);
      throw new Error('Failed to load questions from JSON files');
    }
  }

  // Create a new practice session
  async createPracticeSession(userId: string, categoryIdentifier: string, timeLimitMinutes: number = 15) {
    try {
      // Get category details - try by ID first, then by slug
      let [category] = await db
        .select()
        .from(practiceCategories)
        .where(and(
          eq(practiceCategories.categoryId, categoryIdentifier),
          eq(practiceCategories.status, 'active')
        ))
        .limit(1);

      // If not found by ID, try by slug
      if (!category) {
        [category] = await db
          .select()
          .from(practiceCategories)
          .where(and(
            eq(practiceCategories.slug, categoryIdentifier),
            eq(practiceCategories.status, 'active')
          ))
          .limit(1);
      }

      if (!category) {
        throw new Error('Category not found');
      }

      const questions = await this.getRandomQuestions(category.slug, category.questionsPerSession);
      
      const newSession: NewPracticeSession = {
        userId,
        category: category.slug as any,
        totalQuestions: questions.length,
        timeLimitMinutes: timeLimitMinutes,
        status: 'in_progress',
        questionsData: questions.map(q => ({
          questionId: q.questionId,
          userAnswer: '',
          isCorrect: false,
          timeSpentSeconds: 0
        }))
      };

      const [session] = await db.insert(practiceSessions).values(newSession).returning();
      
      console.log('Created practice session:', session);
      console.log('Session ID:', session.sessionId);
      
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

      // Get the correct answer from the database
      const [question] = await db
        .select()
        .from(practiceQuestions)
        .where(eq(practiceQuestions.questionId, questionId))
        .limit(1);
      
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

      // Update user statistics
      const statisticsService = new StatisticsService();
      console.log('Updating practice statistics for user:', userId, {
        questionsAttempted: session.questionsAttempted || 0,
        correctAnswers: session.correctAnswers || 0,
        incorrectAnswers: session.incorrectAnswers || 0,
        skippedQuestions: session.skippedQuestions || 0,
        timeSpentMinutes: Math.floor((session.timeSpentSeconds || 0) / 60),
      });
      
      // Update overall statistics
      await statisticsService.updatePracticeStatistics(userId, {
        questionsAttempted: session.questionsAttempted || 0,
        correctAnswers: session.correctAnswers || 0,
        incorrectAnswers: session.incorrectAnswers || 0,
        skippedQuestions: session.skippedQuestions || 0,
        timeSpentMinutes: Math.floor((session.timeSpentSeconds || 0) / 60),
      });
      
      // Update subject-specific statistics
      // First, get the category ID from the session
      const [category] = await db
        .select()
        .from(practiceCategories)
        .where(eq(practiceCategories.slug, session.category))
        .limit(1);
      
      if (category) {
        console.log('Updating subject-specific statistics for category:', category.name, category.categoryId);
        await statisticsService.updateSubjectPracticeStatistics(userId, category.categoryId, {
          questionsAttempted: session.questionsAttempted || 0,
          correctAnswers: session.correctAnswers || 0,
          incorrectAnswers: session.incorrectAnswers || 0,
          skippedQuestions: session.skippedQuestions || 0,
          timeSpentMinutes: Math.floor((session.timeSpentSeconds || 0) / 60),
        });
        console.log('Subject-specific statistics updated successfully');
      } else {
        console.log('Category not found for slug:', session.category);
      }
      
      console.log('Practice statistics updated successfully');

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
