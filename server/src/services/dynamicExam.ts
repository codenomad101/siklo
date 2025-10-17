import { db } from '../db';
import { dynamicExamSessions, NewDynamicExamSession, DynamicExamSession, practiceCategories } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { StatisticsService } from './statistics';

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

      // Note: Statistics will be updated when the exam is completed, not when questions are submitted

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

      // Update user statistics
      const statisticsService = new StatisticsService();
      console.log('Updating exam statistics for user:', userId, {
        questionsAttempted: completionData.questionsAttempted,
        correctAnswers: completionData.correctAnswers,
        incorrectAnswers: completionData.incorrectAnswers,
        timeSpentMinutes: Math.floor(completionData.timeSpentSeconds / 60),
      });
      
      // Update overall statistics
      await statisticsService.updateExamStatistics(userId, {
        questionsAttempted: completionData.questionsAttempted,
        correctAnswers: completionData.correctAnswers,
        incorrectAnswers: completionData.incorrectAnswers,
        timeSpentMinutes: Math.floor(completionData.timeSpentSeconds / 60),
      });
      
      // Update subject-specific statistics for each category in the exam
      const categoryStats = new Map<string, { questionsAttempted: number; correctAnswers: number; incorrectAnswers: number; timeSpentMinutes: number }>();
      
      // Get the questions data from the session to calculate category-specific stats
      const questionsData = session.questionsData || [];
      
      // Calculate statistics per category
      questionsData.forEach((q: any) => {
        const categoryId = q.categoryId || q.category;
        if (!categoryStats.has(categoryId)) {
          categoryStats.set(categoryId, { questionsAttempted: 0, correctAnswers: 0, incorrectAnswers: 0, timeSpentMinutes: 0 });
        }
        const stats = categoryStats.get(categoryId)!;
        stats.questionsAttempted++;
        if (q.isCorrect) {
          stats.correctAnswers++;
        } else {
          stats.incorrectAnswers++;
        }
        stats.timeSpentMinutes += Math.floor(q.timeSpentSeconds / 60);
      });
      
      // Update statistics for each category
      for (const [categoryId, stats] of categoryStats) {
        console.log('Updating subject-specific exam statistics for category:', categoryId, stats);
        await statisticsService.updateSubjectExamStatistics(userId, categoryId, stats);
      }
      
      console.log('Exam statistics updated successfully');

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

  // Resume an incomplete exam session
  async resumeExamSession(sessionId: string, userId: string) {
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

      if (!session) {
        throw new Error('Exam session not found');
      }

      // Check if exam can be resumed
      if (session.status === 'completed') {
        throw new Error('Exam is already completed');
      }

      if (session.status === 'abandoned') {
        throw new Error('Exam has been abandoned and cannot be resumed');
      }

      // Calculate completion percentage
      const totalQuestions = session.questionsData?.length || 0;
      const attemptedQuestions = session.questionsAttempted || 0;
      const completionPercentage = totalQuestions > 0 ? Math.round((attemptedQuestions / totalQuestions) * 100) : 0;

      return {
        ...session,
        completionPercentage,
        canResume: session.status === 'in_progress' || session.status === 'not_started'
      };
    } catch (error) {
      console.error('Error resuming exam session:', error);
      if (error.message.includes('Invalid session ID format')) {
        throw error;
      }
      throw new Error('Failed to resume exam session');
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
          // First, try to get category from database by UUID
          let categorySlug = dist.category;
          let categoryName = dist.category;
          
          try {
            const [category] = await db
              .select()
              .from(practiceCategories)
              .where(eq(practiceCategories.categoryId, dist.category))
              .limit(1);
            
            if (category) {
              categorySlug = category.slug;
              categoryName = category.name;
              console.log(`Found category: ${categoryName} (${categorySlug}) for UUID: ${dist.category}`);
            } else {
              console.log(`Category not found in database for UUID: ${dist.category}, trying as slug`);
            }
          } catch (dbError) {
            console.log(`Database lookup failed for ${dist.category}, trying as slug:`, dbError.message);
          }
          
          // Load questions based on category slug
          console.log(`Loading questions for category: "${categorySlug}"`);
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
              console.log(`Unknown category: "${categorySlug}" (UUID: ${dist.category}), skipping`);
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

          // Validate questions before processing
          selectedQuestions.forEach((q: any, index: number) => {
            const correctAnswer = q.CorrectAnswer || q.correctAnswer || '';
            if (!correctAnswer) {
              console.error(`Question ${index + 1} missing correct answer:`, {
                questionText: q.Question,
                CorrectAnswer: q.CorrectAnswer,
                correctAnswer: q.correctAnswer,
                Answer: q.Answer
              });
            }
          });

          // Transform to our format
          const formattedQuestions = selectedQuestions.map((q: any, index: number) => {
            // Process options first
            const processedOptions = q.Options ? q.Options.map((opt: any, optIndex: number) => {
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
            }) : [];
            
            // Extract correct option ID and answer text
            let correctOption: number | null = null;
            let correctAnswerText: string = '';
            
            // Try to get correctOption from the question data first
            if (q.correctOption) {
              correctOption = parseInt(q.correctOption);
            } else if (q.Answer) {
              // Extract option number from "Option X" format
              const optionMatch = q.Answer.match(/Option\s*(\d+)/i);
              if (optionMatch) {
                correctOption = parseInt(optionMatch[1]);
              }
            } else if (q.CorrectAnswer) {
              // Extract option number from "Option X" format
              const optionMatch = q.CorrectAnswer.match(/Option\s*(\d+)/i);
              if (optionMatch) {
                correctOption = parseInt(optionMatch[1]);
              }
            }
            
            // Get the actual answer text from the options
            if (correctOption && processedOptions.length > 0) {
              const correctOptionObj = processedOptions.find(opt => opt.id === correctOption);
              if (correctOptionObj) {
                correctAnswerText = correctOptionObj.text;
              }
            }
            
            // Fallback to original values if extraction failed
            if (!correctAnswerText) {
              correctAnswerText = q.CorrectAnswer || q.correctAnswer || '';
            }
            
            return {
              questionId: `${categorySlug}_${Date.now()}_${index + 1}`,
              questionText: q.Question || q.question || '',
              options: processedOptions,
              correctAnswer: correctAnswerText,
              correctOption: correctOption,
              userAnswer: '',
              isCorrect: false,
              timeSpentSeconds: 0,
              marksObtained: 0,
              category: categorySlug,
              categoryName: categoryName,
              categoryId: dist.category, // Keep original UUID
              marksPerQuestion: dist.marksPerQuestion,
              explanation: q.Explanation || q.explanation || ''
            };
          });

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
