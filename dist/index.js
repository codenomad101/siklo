var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config as config2 } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// server/src/routes/auth.ts
import { Router } from "express";

// server/src/services/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";

// server/src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

// server/src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievementTypeEnum: () => achievementTypeEnum,
  difficultyLevelEnum: () => difficultyLevelEnum,
  dynamicExamSessions: () => dynamicExamSessions,
  examStatusEnum: () => examStatusEnum,
  exams: () => exams,
  genderEnum: () => genderEnum,
  importanceEnum: () => importanceEnum,
  masteryLevelEnum: () => masteryLevelEnum,
  materialTypeEnum: () => materialTypeEnum,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  practiceCategoryEnum: () => practiceCategoryEnum,
  practiceSessions: () => practiceSessions,
  practiceStatusEnum: () => practiceStatusEnum,
  questionTypeEnum: () => questionTypeEnum,
  questions: () => questions,
  sessionTypeEnum: () => sessionTypeEnum,
  studyMaterials: () => studyMaterials,
  subjects: () => subjects,
  subscriptionTypeEnum: () => subscriptionTypeEnum,
  testStatusEnum: () => testStatusEnum,
  testTemplates: () => testTemplates,
  testTypeEnum: () => testTypeEnum,
  topics: () => topics,
  transactionStatusEnum: () => transactionStatusEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  userExamPreferences: () => userExamPreferences,
  userNotes: () => userNotes,
  userProgress: () => userProgress,
  userRoleEnum: () => userRoleEnum,
  userTests: () => userTests,
  users: () => users
});
import { pgTable, varchar, timestamp, boolean, text, integer, decimal, uuid, date, json, pgEnum } from "drizzle-orm/pg-core";
var subscriptionTypeEnum = pgEnum("subscription_type", ["free", "premium", "premium_plus"]);
var genderEnum = pgEnum("gender", ["male", "female", "other"]);
var difficultyLevelEnum = pgEnum("difficulty_level", ["easy", "medium", "hard"]);
var questionTypeEnum = pgEnum("question_type", ["mcq", "numerical", "true_false", "fill_blank"]);
var testStatusEnum = pgEnum("test_status", ["not_started", "in_progress", "completed", "abandoned"]);
var masteryLevelEnum = pgEnum("mastery_level", ["beginner", "intermediate", "advanced", "expert"]);
var testTypeEnum = pgEnum("test_type", ["full_length", "sectional", "topic_wise", "previous_year", "daily_practice"]);
var sessionTypeEnum = pgEnum("session_type", ["daily", "custom", "revision"]);
var materialTypeEnum = pgEnum("material_type", ["pdf", "video", "article", "formula_sheet", "shortcut"]);
var importanceEnum = pgEnum("importance", ["low", "medium", "high", "critical"]);
var achievementTypeEnum = pgEnum("achievement_type", ["streak", "questions", "tests", "accuracy", "special"]);
var notificationTypeEnum = pgEnum("notification_type", ["practice_reminder", "test_available", "achievement", "streak_alert", "community", "general"]);
var transactionStatusEnum = pgEnum("transaction_status", ["pending", "success", "failed", "refunded"]);
var transactionTypeEnum = pgEnum("transaction_type", ["subscription", "test_purchase", "material_purchase", "coins"]);
var practiceCategoryEnum = pgEnum("practice_category", ["economy", "gk", "history", "geography", "english", "aptitude", "agriculture", "marathi"]);
var practiceStatusEnum = pgEnum("practice_status", ["in_progress", "completed", "abandoned"]);
var examStatusEnum = pgEnum("exam_status", ["not_started", "in_progress", "completed", "abandoned"]);
var userRoleEnum = pgEnum("user_role", ["admin", "student", "moderator"]);
var users = pgTable("users", {
  userId: uuid("user_id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 15 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").default("student"),
  profilePictureUrl: text("profile_picture_url"),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  // Subscription details
  subscriptionType: subscriptionTypeEnum("subscription_type").default("free"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  // Gamification
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  coins: integer("coins").default(0),
  // Activity tracking
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: date("last_activity_date"),
  totalStudyTimeMinutes: integer("total_study_time_minutes").default(0),
  // Practice session tracking
  totalPracticeSessions: integer("total_practice_sessions").default(0),
  totalPracticeScore: integer("total_practice_score").default(0),
  weeklyPracticeScore: integer("weekly_practice_score").default(0),
  monthlyPracticeScore: integer("monthly_practice_score").default(0),
  lastPracticeDate: timestamp("last_practice_date"),
  weeklyPracticeCount: integer("weekly_practice_count").default(0),
  monthlyPracticeCount: integer("monthly_practice_count").default(0),
  // Account status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at")
});
var exams = pgTable("exams", {
  examId: uuid("exam_id").primaryKey().defaultRandom(),
  examName: varchar("exam_name", { length: 100 }).notNull(),
  examCode: varchar("exam_code", { length: 20 }).notNull().unique(),
  description: text("description"),
  examPattern: text("exam_pattern"),
  totalMarks: integer("total_marks"),
  durationMinutes: integer("duration_minutes"),
  negativeMarking: boolean("negative_marking").default(false),
  negativeMarksRatio: decimal("negative_marks_ratio", { precision: 3, scale: 2 }).default("0.25"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var subjects = pgTable("subjects", {
  subjectId: uuid("subject_id").primaryKey().defaultRandom(),
  examId: uuid("exam_id").references(() => exams.examId, { onDelete: "cascade" }).notNull(),
  subjectName: varchar("subject_name", { length: 100 }).notNull(),
  subjectCode: varchar("subject_code", { length: 20 }).notNull(),
  weightagePercentage: decimal("weightage_percentage", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions"),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var topics = pgTable("topics", {
  topicId: uuid("topic_id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id").references(() => subjects.subjectId, { onDelete: "cascade" }).notNull(),
  topicName: varchar("topic_name", { length: 200 }).notNull(),
  difficultyLevel: difficultyLevelEnum("difficulty_level"),
  estimatedTimeMinutes: integer("estimated_time_minutes"),
  parentTopicId: uuid("parent_topic_id"),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var questions = pgTable("questions", {
  questionId: uuid("question_id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").references(() => topics.topicId, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => subjects.subjectId, { onDelete: "cascade" }).notNull(),
  examId: uuid("exam_id").references(() => exams.examId, { onDelete: "cascade" }).notNull(),
  questionText: text("question_text").notNull(),
  questionImageUrl: text("question_image_url"),
  questionType: questionTypeEnum("question_type").default("mcq"),
  difficultyLevel: difficultyLevelEnum("difficulty_level"),
  marks: decimal("marks", { precision: 4, scale: 2 }).default("1.00"),
  negativeMarks: decimal("negative_marks", { precision: 4, scale: 2 }).default("0.25"),
  // Options for MCQ
  optionA: text("option_a"),
  optionB: text("option_b"),
  optionC: text("option_c"),
  optionD: text("option_d"),
  optionE: text("option_e"),
  correctAnswer: varchar("correct_answer", { length: 10 }).notNull(),
  detailedSolution: text("detailed_solution"),
  solutionVideoUrl: text("solution_video_url"),
  hint: text("hint"),
  // Metadata
  yearAppeared: integer("year_appeared"),
  source: varchar("source", { length: 100 }),
  timesAttempted: integer("times_attempted").default(0),
  timesCorrect: integer("times_correct").default(0),
  averageTimeSeconds: integer("average_time_seconds"),
  language: varchar("language", { length: 10 }).default("en"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.userId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userExamPreferences = pgTable("user_exam_preferences", {
  preferenceId: uuid("preference_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  examId: uuid("exam_id").references(() => exams.examId, { onDelete: "cascade" }).notNull(),
  targetExamDate: date("target_exam_date"),
  dailyStudyGoalMinutes: integer("daily_study_goal_minutes").default(30),
  isPrimaryExam: boolean("is_primary_exam").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var testTemplates = pgTable("test_templates", {
  templateId: uuid("template_id").primaryKey().defaultRandom(),
  examId: uuid("exam_id").references(() => exams.examId, { onDelete: "cascade" }).notNull(),
  templateName: varchar("template_name", { length: 200 }).notNull(),
  testType: testTypeEnum("test_type"),
  totalQuestions: integer("total_questions").notNull(),
  totalMarks: decimal("total_marks", { precision: 6, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  isFree: boolean("is_free").default(false),
  price: decimal("price", { precision: 8, scale: 2 }).default("0"),
  instructions: text("instructions"),
  syllabusCoverage: text("syllabus_coverage"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userTests = pgTable("user_tests", {
  userTestId: uuid("user_test_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  templateId: uuid("template_id").references(() => testTemplates.templateId, { onDelete: "cascade" }).notNull(),
  testStatus: testStatusEnum("test_status").default("not_started"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeTakenSeconds: integer("time_taken_seconds"),
  // Scores
  totalQuestionsAttempted: integer("total_questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  incorrectAnswers: integer("incorrect_answers").default(0),
  skippedQuestions: integer("skipped_questions").default(0),
  marksObtained: decimal("marks_obtained", { precision: 8, scale: 2 }).default("0"),
  totalMarks: decimal("total_marks", { precision: 8, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  // Rankings
  rank: integer("rank"),
  totalParticipants: integer("total_participants"),
  percentile: decimal("percentile", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userProgress = pgTable("user_progress", {
  progressId: uuid("progress_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  topicId: uuid("topic_id").references(() => topics.topicId, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => subjects.subjectId, { onDelete: "cascade" }).notNull(),
  totalQuestionsAttempted: integer("total_questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalTimeSpentSeconds: integer("total_time_spent_seconds").default(0),
  masteryLevel: masteryLevelEnum("mastery_level").default("beginner"),
  masteryPercentage: decimal("mastery_percentage", { precision: 5, scale: 2 }).default("0"),
  lastPracticedAt: timestamp("last_practiced_at"),
  practiceCount: integer("practice_count").default(0),
  averageAccuracy: decimal("average_accuracy", { precision: 5, scale: 2 }),
  averageTimePerQuestionSeconds: integer("average_time_per_question_seconds"),
  needsRevision: boolean("needs_revision").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userNotes = pgTable("user_notes", {
  noteId: uuid("note_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  noteTitle: varchar("note_title", { length: 200 }).notNull(),
  noteContent: text("note_content").notNull(),
  noteColor: varchar("note_color", { length: 7 }).default("#FFD700"),
  // Association with study material
  topicId: uuid("topic_id").references(() => topics.topicId, { onDelete: "set null" }),
  subjectId: uuid("subject_id").references(() => subjects.subjectId, { onDelete: "set null" }),
  questionId: uuid("question_id").references(() => questions.questionId, { onDelete: "set null" }),
  isPinned: boolean("is_pinned").default(false),
  isFavorite: boolean("is_favorite").default(false),
  tags: json("tags").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var studyMaterials = pgTable("study_materials", {
  materialId: uuid("material_id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").references(() => topics.topicId, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => subjects.subjectId, { onDelete: "cascade" }).notNull(),
  materialTitle: varchar("material_title", { length: 200 }).notNull(),
  materialType: materialTypeEnum("material_type"),
  contentUrl: text("content_url"),
  fileSizeMb: decimal("file_size_mb", { precision: 8, scale: 2 }),
  durationMinutes: integer("duration_minutes"),
  description: text("description"),
  isFree: boolean("is_free").default(false),
  price: decimal("price", { precision: 8, scale: 2 }).default("0"),
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  language: varchar("language", { length: 10 }).default("en"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  notificationId: uuid("notification_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  notificationType: notificationTypeEnum("notification_type"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var practiceSessions = pgTable("practice_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  category: practiceCategoryEnum("category").notNull(),
  status: practiceStatusEnum("status").default("in_progress"),
  // Session details
  totalQuestions: integer("total_questions").default(20),
  timeLimitMinutes: integer("time_limit_minutes").default(15),
  // Timing
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  // Results
  questionsAttempted: integer("questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  incorrectAnswers: integer("incorrect_answers").default(0),
  skippedQuestions: integer("skipped_questions").default(0),
  // Score
  score: decimal("score", { precision: 5, scale: 2 }).default("0"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  // Questions data (JSON array of question details with explanations)
  questionsData: json("questions_data").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var dynamicExamSessions = pgTable("dynamic_exam_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.userId).notNull(),
  // Exam Configuration
  examName: varchar("exam_name", { length: 255 }).notNull(),
  totalMarks: integer("total_marks").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  negativeMarking: boolean("negative_marking").default(false),
  negativeMarksRatio: decimal("negative_marks_ratio", { precision: 3, scale: 2 }).default("0.25"),
  // Question Distribution
  questionDistribution: json("question_distribution").$type().notNull(),
  // Session Status
  status: examStatusEnum("status").default("not_started"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  // Results
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  questionsAttempted: integer("questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  incorrectAnswers: integer("incorrect_answers").default(0),
  skippedQuestions: integer("skipped_questions").default(0),
  marksObtained: decimal("marks_obtained", { precision: 5, scale: 2 }).default("0"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  // Questions Data
  questionsData: json("questions_data").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// server/src/db/index.ts
config();
var connectionString = process.env.DATABASE_URL;
var client = postgres(connectionString);
var db = drizzle(client, { schema: schema_exports });

// server/src/services/auth.ts
var JWT_SECRET = process.env.JWT_SECRET;
var AuthService = class {
  async register(userData) {
    const { username, email, password, fullName, phone, dateOfBirth, gender, role = "student" } = userData;
    const existingUser = await db.select().from(users).where(
      or(
        eq(users.email, email),
        username ? eq(users.username, username) : void 0
      )
    ).limit(1);
    if (existingUser.length > 0) {
      throw new Error("User with this email or username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      username,
      email,
      passwordHash: hashedPassword,
      fullName,
      role,
      phone,
      dateOfBirth,
      gender,
      isActive: true,
      isVerified: false,
      totalPoints: 0,
      level: 1,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTimeMinutes: 0
    };
    const createdUser = await db.insert(users).values(newUser).returning();
    const token = jwt.sign(
      { userId: createdUser[0].userId, email: createdUser[0].email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { passwordHash: _, ...userWithoutPassword } = createdUser[0];
    return {
      user: userWithoutPassword,
      token
    };
  }
  async login(credentials) {
    const { emailOrUsername, password } = credentials;
    const user = await db.select().from(users).where(
      or(
        eq(users.email, emailOrUsername),
        eq(users.username, emailOrUsername)
      )
    ).limit(1);
    if (user.length === 0) {
      throw new Error("Invalid email/username or password");
    }
    const foundUser = user[0];
    if (!foundUser.isActive) {
      throw new Error("Account is deactivated");
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email/username or password");
    }
    await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.userId, foundUser.userId));
    const token = jwt.sign(
      { userId: foundUser.userId, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { passwordHash: _, ...userWithoutPassword } = foundUser;
    return {
      user: userWithoutPassword,
      token
    };
  }
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.select().from(users).where(eq(users.userId, decoded.userId)).limit(1);
      if (user.length === 0) {
        throw new Error("User not found");
      }
      const foundUser = user[0];
      if (!foundUser.isActive) {
        throw new Error("Account is deactivated");
      }
      const { passwordHash: _, ...userWithoutPassword } = foundUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  async updateUserProfile(userId, updateData) {
    try {
      const updatedUser = await db.update(users).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.userId, userId)).returning();
      if (!updatedUser[0]) {
        throw new Error("User not found");
      }
      const { passwordHash: _, ...userWithoutPassword } = updatedUser[0];
      return userWithoutPassword;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
      if (user.length === 0) {
        throw new Error("User not found");
      }
      const foundUser = user[0];
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, foundUser.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await db.update(users).set({
        passwordHash: newPasswordHash,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.userId, userId));
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    }
  }
};

// server/src/schemas/auth.ts
import { z } from "zod";
var RegisterInput = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  role: z.enum(["admin", "student", "moderator"]).optional()
});
var LoginInput = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required")
});
var UpdateProfileInput = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  profilePictureUrl: z.string().url().optional()
});
var ChangePasswordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

// server/src/controllers/auth.ts
var authService = new AuthService();
var register = async (req, res) => {
  try {
    const validatedData = RegisterInput.parse(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message === "User with this email already exists") {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
};
var login = async (req, res) => {
  try {
    const validatedData = LoginInput.parse(req.body);
    const result = await authService.login({
      emailOrUsername: validatedData.emailOrUsername,
      password: validatedData.password
    });
    res.json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Invalid email/username or password") {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password"
      });
    }
    if (error.message === "Account is deactivated") {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
};
var verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    const user = await authService.verifyToken(token);
    res.json({
      success: true,
      message: "Token verified successfully",
      data: { user }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
var updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = UpdateProfileInput.parse(req.body);
    const updatedUser = await authService.updateUserProfile(userId, validatedData);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Profile update failed"
    });
  }
};
var changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = ChangePasswordInput.parse(req.body);
    await authService.changePassword(userId, validatedData.currentPassword, validatedData.newPassword);
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Password change error:", error);
    if (error.message === "Current password is incorrect") {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || "Password change failed"
    });
  }
};

// server/src/middleware/auth.ts
var authService2 = new AuthService();
var JWT_SECRET2 = process.env.JWT_SECRET;
var authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }
    const user = await authService2.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// server/src/routes/auth.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyToken);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);
var auth_default = router;

// server/src/routes/user.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/profile", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Profile data retrieved successfully",
    data: {
      user: req.user
    }
  });
});
var user_default = router2;

// server/src/routes/exam.ts
import { Router as Router3 } from "express";

// server/src/services/exam.ts
import { eq as eq2, and, desc, asc } from "drizzle-orm";
var ExamService = class {
  // Exam CRUD operations
  async getAllExams() {
    return await db.select().from(exams).where(eq2(exams.isActive, true)).orderBy(asc(exams.examName));
  }
  async getExamById(examId) {
    const [exam] = await db.select().from(exams).where(eq2(exams.examId, examId)).limit(1);
    return exam;
  }
  async createExam(examData) {
    const [createdExam] = await db.insert(exams).values(examData).returning();
    return createdExam;
  }
  async updateExam(examId, updateData) {
    const [updatedExam] = await db.update(exams).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(exams.examId, examId)).returning();
    return updatedExam;
  }
  async deleteExam(examId) {
    await db.update(exams).set({ isActive: false }).where(eq2(exams.examId, examId));
  }
  // Subject operations
  async getSubjectsByExam(examId) {
    return await db.select().from(subjects).where(eq2(subjects.examId, examId)).orderBy(asc(subjects.displayOrder));
  }
  async createSubject(subjectData) {
    const [createdSubject] = await db.insert(subjects).values(subjectData).returning();
    return createdSubject;
  }
  async updateSubject(subjectId, updateData) {
    const [updatedSubject] = await db.update(subjects).set(updateData).where(eq2(subjects.subjectId, subjectId)).returning();
    return updatedSubject;
  }
  async deleteSubject(subjectId) {
    await db.delete(subjects).where(eq2(subjects.subjectId, subjectId));
  }
  // Topic operations
  async getTopicsBySubject(subjectId) {
    return await db.select().from(topics).where(eq2(topics.subjectId, subjectId)).orderBy(asc(topics.displayOrder));
  }
  async createTopic(topicData) {
    const [createdTopic] = await db.insert(topics).values(topicData).returning();
    return createdTopic;
  }
  async updateTopic(topicId, updateData) {
    const [updatedTopic] = await db.update(topics).set(updateData).where(eq2(topics.topicId, topicId)).returning();
    return updatedTopic;
  }
  async deleteTopic(topicId) {
    await db.delete(topics).where(eq2(topics.topicId, topicId));
  }
  // Question operations
  async getQuestionsByTopic(topicId, limit = 50, offset = 0) {
    return await db.select().from(questions).where(and(eq2(questions.topicId, topicId), eq2(questions.isActive, true))).limit(limit).offset(offset).orderBy(desc(questions.createdAt));
  }
  async getQuestionsBySubject(subjectId, limit = 50, offset = 0) {
    return await db.select().from(questions).where(and(eq2(questions.subjectId, subjectId), eq2(questions.isActive, true))).limit(limit).offset(offset).orderBy(desc(questions.createdAt));
  }
  async getQuestionsByExam(examId, limit = 50, offset = 0) {
    return await db.select().from(questions).where(and(eq2(questions.examId, examId), eq2(questions.isActive, true))).limit(limit).offset(offset).orderBy(desc(questions.createdAt));
  }
  async createQuestion(questionData) {
    const [createdQuestion] = await db.insert(questions).values(questionData).returning();
    return createdQuestion;
  }
  async updateQuestion(questionId, updateData) {
    const [updatedQuestion] = await db.update(questions).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(questions.questionId, questionId)).returning();
    return updatedQuestion;
  }
  async deleteQuestion(questionId) {
    await db.update(questions).set({ isActive: false }).where(eq2(questions.questionId, questionId));
  }
  // User exam preferences
  async getUserExamPreferences(userId) {
    return await db.select({
      preference: userExamPreferences,
      exam: exams
    }).from(userExamPreferences).innerJoin(exams, eq2(userExamPreferences.examId, exams.examId)).where(eq2(userExamPreferences.userId, userId)).orderBy(desc(userExamPreferences.isPrimaryExam));
  }
  async setUserExamPreference(preferenceData) {
    const [createdPreference] = await db.insert(userExamPreferences).values(preferenceData).returning();
    return createdPreference;
  }
  async updateUserExamPreference(preferenceId, updateData) {
    const [updatedPreference] = await db.update(userExamPreferences).set(updateData).where(eq2(userExamPreferences.preferenceId, preferenceId)).returning();
    return updatedPreference;
  }
  async removeUserExamPreference(preferenceId) {
    await db.delete(userExamPreferences).where(eq2(userExamPreferences.preferenceId, preferenceId));
  }
  // Get exam with subjects and topics
  async getExamWithStructure(examId) {
    const exam = await this.getExamById(examId);
    if (!exam)
      return null;
    const subjectsList = await this.getSubjectsByExam(examId);
    const subjectsWithTopics = await Promise.all(
      subjectsList.map(async (subject) => {
        const topicsList = await this.getTopicsBySubject(subject.subjectId);
        return {
          ...subject,
          topics: topicsList
        };
      })
    );
    return {
      ...exam,
      subjects: subjectsWithTopics
    };
  }
};

// server/src/routes/exam.ts
import { z as z2 } from "zod";
var router3 = Router3();
var examService = new ExamService();
var CreateExamSchema = z2.object({
  examName: z2.string().min(1, "Exam name is required"),
  examCode: z2.string().min(1, "Exam code is required"),
  description: z2.string().optional(),
  examPattern: z2.string().optional(),
  totalMarks: z2.number().positive().optional(),
  durationMinutes: z2.number().positive().optional(),
  negativeMarking: z2.boolean().optional(),
  negativeMarksRatio: z2.number().min(0).max(1).optional()
});
var CreateSubjectSchema = z2.object({
  examId: z2.string().uuid("Invalid exam ID"),
  subjectName: z2.string().min(1, "Subject name is required"),
  subjectCode: z2.string().min(1, "Subject code is required"),
  weightagePercentage: z2.number().min(0).max(100).optional(),
  totalQuestions: z2.number().positive().optional(),
  displayOrder: z2.number().optional()
});
var CreateTopicSchema = z2.object({
  subjectId: z2.string().uuid("Invalid subject ID"),
  topicName: z2.string().min(1, "Topic name is required"),
  difficultyLevel: z2.enum(["easy", "medium", "hard"]).optional(),
  estimatedTimeMinutes: z2.number().positive().optional(),
  parentTopicId: z2.string().uuid().optional(),
  displayOrder: z2.number().optional()
});
var CreateQuestionSchema = z2.object({
  topicId: z2.string().uuid("Invalid topic ID"),
  subjectId: z2.string().uuid("Invalid subject ID"),
  examId: z2.string().uuid("Invalid exam ID"),
  questionText: z2.string().min(1, "Question text is required"),
  questionImageUrl: z2.string().url().optional(),
  questionType: z2.enum(["mcq", "numerical", "true_false", "fill_blank"]).optional(),
  difficultyLevel: z2.enum(["easy", "medium", "hard"]).optional(),
  marks: z2.number().positive().optional(),
  negativeMarks: z2.number().min(0).optional(),
  optionA: z2.string().optional(),
  optionB: z2.string().optional(),
  optionC: z2.string().optional(),
  optionD: z2.string().optional(),
  optionE: z2.string().optional(),
  correctAnswer: z2.string().min(1, "Correct answer is required"),
  detailedSolution: z2.string().optional(),
  solutionVideoUrl: z2.string().url().optional(),
  hint: z2.string().optional(),
  yearAppeared: z2.number().positive().optional(),
  source: z2.string().optional(),
  language: z2.string().optional()
});
var UserExamPreferenceSchema = z2.object({
  examId: z2.string().uuid("Invalid exam ID"),
  targetExamDate: z2.string().optional(),
  dailyStudyGoalMinutes: z2.number().positive().optional(),
  isPrimaryExam: z2.boolean().optional()
});
router3.get("/exams", async (req, res) => {
  try {
    const exams2 = await examService.getAllExams();
    res.json({
      success: true,
      data: exams2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exams"
    });
  }
});
router3.get("/exams/:examId", async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }
    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam"
    });
  }
});
router3.get("/exams/:examId/structure", async (req, res) => {
  try {
    const { examId } = req.params;
    const examStructure = await examService.getExamWithStructure(examId);
    if (!examStructure) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }
    res.json({
      success: true,
      data: examStructure
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam structure"
    });
  }
});
router3.get("/exams/:examId/subjects", async (req, res) => {
  try {
    const { examId } = req.params;
    const subjects2 = await examService.getSubjectsByExam(examId);
    res.json({
      success: true,
      data: subjects2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subjects"
    });
  }
});
router3.get("/subjects/:subjectId/topics", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const topics2 = await examService.getTopicsBySubject(subjectId);
    res.json({
      success: true,
      data: topics2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch topics"
    });
  }
});
router3.get("/topics/:topicId/questions", async (req, res) => {
  try {
    const { topicId } = req.params;
    const { limit = "50", offset = "0" } = req.query;
    const questions2 = await examService.getQuestionsByTopic(
      topicId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json({
      success: true,
      data: questions2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions"
    });
  }
});
router3.get("/subjects/:subjectId/questions", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { limit = "50", offset = "0" } = req.query;
    const questions2 = await examService.getQuestionsBySubject(
      subjectId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json({
      success: true,
      data: questions2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions"
    });
  }
});
router3.post("/exams", authenticateToken, async (req, res) => {
  try {
    const validatedData = CreateExamSchema.parse(req.body);
    const exam = await examService.createExam(validatedData);
    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create exam"
    });
  }
});
router3.post("/subjects", authenticateToken, async (req, res) => {
  try {
    const validatedData = CreateSubjectSchema.parse(req.body);
    const subject = await examService.createSubject(validatedData);
    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject"
    });
  }
});
router3.post("/topics", authenticateToken, async (req, res) => {
  try {
    const validatedData = CreateTopicSchema.parse(req.body);
    const topic = await examService.createTopic(validatedData);
    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: topic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create topic"
    });
  }
});
router3.post("/questions", authenticateToken, async (req, res) => {
  try {
    const validatedData = CreateQuestionSchema.parse(req.body);
    const question = await examService.createQuestion(validatedData);
    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create question"
    });
  }
});
router3.get("/user/preferences", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await examService.getUserExamPreferences(userId);
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user preferences"
    });
  }
});
router3.post("/user/preferences", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = UserExamPreferenceSchema.parse(req.body);
    const preference = await examService.setUserExamPreference({
      userId,
      ...validatedData
    });
    res.status(201).json({
      success: true,
      message: "Exam preference set successfully",
      data: preference
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to set exam preference"
    });
  }
});
var exam_default = router3;

// server/src/routes/progress.ts
import { Router as Router4 } from "express";

// server/src/services/progress.ts
import { eq as eq3, and as and2, desc as desc2 } from "drizzle-orm";
var ProgressService = class {
  // User Progress operations
  async getUserProgress(userId, subjectId) {
    let query = db.select().from(userProgress).where(eq3(userProgress.userId, userId));
    if (subjectId) {
      query = query.where(and2(eq3(userProgress.userId, userId), eq3(userProgress.subjectId, subjectId)));
    }
    return await query.orderBy(desc2(userProgress.updatedAt));
  }
  async getUserProgressByTopic(userId, topicId) {
    const [progress] = await db.select().from(userProgress).where(and2(eq3(userProgress.userId, userId), eq3(userProgress.topicId, topicId))).limit(1);
    return progress;
  }
  async updateUserProgress(userId, topicId, subjectId, progressData) {
    const existingProgress = await this.getUserProgressByTopic(userId, topicId);
    if (existingProgress) {
      const [updatedProgress] = await db.update(userProgress).set({
        ...progressData,
        practiceCount: existingProgress.practiceCount + 1,
        lastPracticedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(userProgress.progressId, existingProgress.progressId)).returning();
      return updatedProgress;
    } else {
      const newProgress = {
        userId,
        topicId,
        subjectId,
        ...progressData,
        practiceCount: 1,
        lastPracticedAt: /* @__PURE__ */ new Date()
      };
      const [createdProgress] = await db.insert(userProgress).values(newProgress).returning();
      return createdProgress;
    }
  }
  // Daily Practice Sessions (simplified - using practiceSessions instead)
  async createDailyPracticeSession(sessionData) {
    return { sessionId: "mock-session-id", ...sessionData };
  }
  async getUserDailyPracticeSessions(userId, startDate, endDate) {
    return [];
  }
  async updateDailyPracticeSession(sessionId, updateData) {
    return { sessionId, ...updateData };
  }
  // User Question History (simplified)
  async addQuestionHistory(historyData) {
    return { historyId: "mock-history-id", ...historyData };
  }
  async getUserQuestionHistory(userId, questionId, limit = 50) {
    return [];
  }
  // Analytics and Statistics
  async getUserStats(userId, days = 30) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const sessions = await this.getUserDailyPracticeSessions(
      userId,
      startDate.toISOString().split("T")[0],
      (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    );
    const totalQuestions = sessions.reduce((sum, session) => sum + (session.questionsAttempted || 0), 0);
    const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctAnswers || 0), 0);
    const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.timeSpentSeconds || 0), 0);
    const totalPoints = sessions.reduce((sum, session) => sum + (session.pointsEarned || 0), 0);
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions * 100 : 0;
    const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0;
    const completedSessions = sessions.filter((session) => session.isCompleted);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < completedSessions.length; i++) {
      if (completedSessions[i].isCompleted) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    currentStreak = tempStreak;
    return {
      totalQuestions,
      totalCorrect,
      totalTimeSpent,
      totalPoints,
      accuracy: Math.round(accuracy * 100) / 100,
      averageTimePerQuestion: Math.round(averageTimePerQuestion),
      currentStreak,
      longestStreak,
      sessionsCompleted: completedSessions.length,
      totalSessions: sessions.length
    };
  }
  async getSubjectWiseProgress(userId) {
    const progress = await this.getUserProgress(userId);
    const subjectProgress = progress.reduce((acc, item) => {
      if (!acc[item.subjectId]) {
        acc[item.subjectId] = {
          subjectId: item.subjectId,
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          topics: []
        };
      }
      acc[item.subjectId].totalQuestions += item.totalQuestionsAttempted || 0;
      acc[item.subjectId].correctAnswers += item.correctAnswers || 0;
      acc[item.subjectId].totalTime += item.totalTimeSpentSeconds || 0;
      acc[item.subjectId].topics.push({
        topicId: item.topicId,
        masteryLevel: item.masteryLevel,
        masteryPercentage: item.masteryPercentage,
        practiceCount: item.practiceCount,
        lastPracticedAt: item.lastPracticedAt
      });
      return acc;
    }, {});
    Object.keys(subjectProgress).forEach((subjectId) => {
      const subject = subjectProgress[subjectId];
      subject.accuracy = subject.totalQuestions > 0 ? Math.round(subject.correctAnswers / subject.totalQuestions * 100 * 100) / 100 : 0;
    });
    return Object.values(subjectProgress);
  }
  async getWeakTopics(userId, limit = 10) {
    const progress = await this.getUserProgress(userId);
    return progress.filter(
      (item) => item.masteryLevel === "beginner" || item.masteryPercentage && item.masteryPercentage < 50 || item.needsRevision
    ).sort((a, b) => (a.masteryPercentage || 0) - (b.masteryPercentage || 0)).slice(0, limit);
  }
};

// server/src/routes/progress.ts
import { z as z3 } from "zod";
var router4 = Router4();
var progressService = new ProgressService();
var UpdateProgressSchema = z3.object({
  topicId: z3.string().uuid("Invalid topic ID"),
  subjectId: z3.string().uuid("Invalid subject ID"),
  totalQuestionsAttempted: z3.number().min(0).optional(),
  correctAnswers: z3.number().min(0).optional(),
  totalTimeSpentSeconds: z3.number().min(0).optional(),
  masteryLevel: z3.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  masteryPercentage: z3.number().min(0).max(100).optional(),
  averageAccuracy: z3.number().min(0).max(100).optional(),
  averageTimePerQuestionSeconds: z3.number().min(0).optional(),
  needsRevision: z3.boolean().optional()
});
var CreatePracticeSessionSchema = z3.object({
  topicId: z3.string().uuid("Invalid topic ID"),
  subjectId: z3.string().uuid("Invalid subject ID"),
  sessionDate: z3.string(),
  sessionType: z3.enum(["daily", "custom", "revision"]).optional(),
  totalQuestions: z3.number().min(0).optional(),
  questionsAttempted: z3.number().min(0).optional(),
  correctAnswers: z3.number().min(0).optional(),
  timeSpentSeconds: z3.number().min(0).optional(),
  accuracyPercentage: z3.number().min(0).max(100).optional(),
  pointsEarned: z3.number().min(0).optional(),
  isCompleted: z3.boolean().optional()
});
var UpdatePracticeSessionSchema = z3.object({
  totalQuestions: z3.number().min(0).optional(),
  questionsAttempted: z3.number().min(0).optional(),
  correctAnswers: z3.number().min(0).optional(),
  timeSpentSeconds: z3.number().min(0).optional(),
  accuracyPercentage: z3.number().min(0).max(100).optional(),
  pointsEarned: z3.number().min(0).optional(),
  isCompleted: z3.boolean().optional()
});
var AddQuestionHistorySchema = z3.object({
  questionId: z3.string().uuid("Invalid question ID"),
  userAnswer: z3.string().optional(),
  isCorrect: z3.boolean().optional(),
  timeTakenSeconds: z3.number().min(0).optional(),
  attemptNumber: z3.number().min(1).optional(),
  sourceType: z3.enum(["daily_practice", "test", "revision", "custom_practice"]).optional(),
  sourceId: z3.string().uuid().optional()
});
router4.get("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subjectId } = req.query;
    const progress = await progressService.getUserProgress(userId, subjectId);
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user progress"
    });
  }
});
router4.get("/progress/topic/:topicId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.params;
    const progress = await progressService.getUserProgressByTopic(userId, topicId);
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch topic progress"
    });
  }
});
router4.put("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = UpdateProgressSchema.parse(req.body);
    const progress = await progressService.updateUserProgress(
      userId,
      validatedData.topicId,
      validatedData.subjectId,
      validatedData
    );
    res.json({
      success: true,
      message: "Progress updated successfully",
      data: progress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update progress"
    });
  }
});
router4.post("/practice-sessions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = CreatePracticeSessionSchema.parse(req.body);
    const session = await progressService.createDailyPracticeSession({
      userId,
      ...validatedData
    });
    res.status(201).json({
      success: true,
      message: "Practice session created successfully",
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create practice session"
    });
  }
});
router4.get("/practice-sessions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    const sessions = await progressService.getUserDailyPracticeSessions(
      userId,
      startDate,
      endDate
    );
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch practice sessions"
    });
  }
});
router4.put("/practice-sessions/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const validatedData = UpdatePracticeSessionSchema.parse(req.body);
    const session = await progressService.updateDailyPracticeSession(sessionId, validatedData);
    res.json({
      success: true,
      message: "Practice session updated successfully",
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update practice session"
    });
  }
});
router4.post("/question-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = AddQuestionHistorySchema.parse(req.body);
    const history = await progressService.addQuestionHistory({
      userId,
      ...validatedData
    });
    res.status(201).json({
      success: true,
      message: "Question history added successfully",
      data: history
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add question history"
    });
  }
});
router4.get("/question-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { questionId, limit = "50" } = req.query;
    const history = await progressService.getUserQuestionHistory(
      userId,
      questionId,
      parseInt(limit)
    );
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch question history"
    });
  }
});
router4.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = "30" } = req.query;
    const stats = await progressService.getUserStats(userId, parseInt(days));
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user statistics"
    });
  }
});
router4.get("/stats/subject-wise", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subjectProgress = await progressService.getSubjectWiseProgress(userId);
    res.json({
      success: true,
      data: subjectProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subject-wise progress"
    });
  }
});
router4.get("/stats/weak-topics", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = "10" } = req.query;
    const weakTopics = await progressService.getWeakTopics(userId, parseInt(limit));
    res.json({
      success: true,
      data: weakTopics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch weak topics"
    });
  }
});
var progress_default = router4;

// server/src/routes/test.ts
import { Router as Router5 } from "express";

// server/src/services/test.ts
import { eq as eq4, and as and3, desc as desc3, sql as sql2, inArray } from "drizzle-orm";
var TestService = class {
  // Test Templates
  async getAllTestTemplates(examId) {
    let query = db.select().from(testTemplates).where(eq4(testTemplates.isActive, true));
    if (examId) {
      query = query.where(and3(eq4(testTemplates.isActive, true), eq4(testTemplates.examId, examId)));
    }
    return await query.orderBy(desc3(testTemplates.createdAt));
  }
  async getTestTemplateById(templateId) {
    const [template] = await db.select().from(testTemplates).where(eq4(testTemplates.templateId, templateId)).limit(1);
    return template;
  }
  async createTestTemplate(templateData) {
    const [createdTemplate] = await db.insert(testTemplates).values(templateData).returning();
    return createdTemplate;
  }
  async updateTestTemplate(templateId, updateData) {
    const [updatedTemplate] = await db.update(testTemplates).set(updateData).where(eq4(testTemplates.templateId, templateId)).returning();
    return updatedTemplate;
  }
  async deleteTestTemplate(templateId) {
    await db.update(testTemplates).set({ isActive: false }).where(eq4(testTemplates.templateId, templateId));
  }
  // User Tests
  async createUserTest(userId, templateId) {
    const template = await this.getTestTemplateById(templateId);
    if (!template) {
      throw new Error("Test template not found");
    }
    const newUserTest = {
      userId,
      templateId,
      testStatus: "not_started",
      totalMarks: template.totalMarks
    };
    const [createdTest] = await db.insert(userTests).values(newUserTest).returning();
    return createdTest;
  }
  async getUserTests(userId, status) {
    let query = db.select().from(userTests).where(eq4(userTests.userId, userId));
    if (status) {
      query = query.where(and3(eq4(userTests.userId, userId), eq4(userTests.testStatus, status)));
    }
    return await query.orderBy(desc3(userTests.createdAt));
  }
  async getUserTestById(userTestId) {
    const [userTest] = await db.select().from(userTests).where(eq4(userTests.userTestId, userTestId)).limit(1);
    return userTest;
  }
  async startUserTest(userTestId) {
    const [updatedTest] = await db.update(userTests).set({
      testStatus: "in_progress",
      startedAt: /* @__PURE__ */ new Date()
    }).where(eq4(userTests.userTestId, userTestId)).returning();
    return updatedTest;
  }
  async completeUserTest(userTestId, testData) {
    const [updatedTest] = await db.update(userTests).set({
      testStatus: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      ...testData
    }).where(eq4(userTests.userTestId, userTestId)).returning();
    return updatedTest;
  }
  async abandonUserTest(userTestId) {
    const [updatedTest] = await db.update(userTests).set({
      testStatus: "abandoned",
      completedAt: /* @__PURE__ */ new Date()
    }).where(eq4(userTests.userTestId, userTestId)).returning();
    return updatedTest;
  }
  // Test Responses (simplified)
  async submitTestResponse(responseData) {
    return { responseId: "mock-response-id", ...responseData };
  }
  async getUserTestResponses(userTestId) {
    return [];
  }
  async updateTestResponse(responseId, updateData) {
    return { responseId, ...updateData };
  }
  // Generate test questions
  async generateTestQuestions(templateId, examId, subjectIds) {
    const template = await this.getTestTemplateById(templateId);
    if (!template) {
      throw new Error("Test template not found");
    }
    let query = db.select().from(questions).where(
      and3(
        eq4(questions.examId, examId),
        eq4(questions.isActive, true)
      )
    );
    if (subjectIds && subjectIds.length > 0) {
      query = query.where(
        and3(
          eq4(questions.examId, examId),
          eq4(questions.isActive, true),
          inArray(questions.subjectId, subjectIds)
        )
      );
    }
    const allQuestions = await query;
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, template.totalQuestions);
    return selectedQuestions;
  }
  // Test Analytics
  async getUserTestAnalytics(userId, days = 30) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const userTestsList = await db.select().from(userTests).where(
      and3(
        eq4(userTests.userId, userId),
        sql2`${userTests.createdAt} >= ${startDate.toISOString()}`
      )
    ).orderBy(desc3(userTests.createdAt));
    const completedTests = userTestsList.filter((test) => test.testStatus === "completed");
    const totalTests = userTestsList.length;
    const completedCount = completedTests.length;
    const averageScore = completedCount > 0 ? completedTests.reduce((sum, test) => sum + Number(test.percentage || 0), 0) / completedCount : 0;
    const averageTime = completedCount > 0 ? completedTests.reduce((sum, test) => sum + (test.timeTakenSeconds || 0), 0) / completedCount : 0;
    const bestScore = completedCount > 0 ? Math.max(...completedTests.map((test) => Number(test.percentage || 0))) : 0;
    const worstScore = completedCount > 0 ? Math.min(...completedTests.map((test) => Number(test.percentage || 0))) : 0;
    return {
      totalTests,
      completedTests: completedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTime: Math.round(averageTime),
      bestScore: Math.round(bestScore * 100) / 100,
      worstScore: Math.round(worstScore * 100) / 100,
      completionRate: totalTests > 0 ? Math.round(completedCount / totalTests * 100) : 0
    };
  }
  async getTestLeaderboard(templateId, limit = 100) {
    return await db.select().from(userTests).where(
      and3(
        eq4(userTests.templateId, templateId),
        eq4(userTests.testStatus, "completed")
      )
    ).orderBy(desc3(userTests.percentage)).limit(limit);
  }
  async getUserRankInTest(userTestId) {
    const userTest = await this.getUserTestById(userTestId);
    if (!userTest || userTest.testStatus !== "completed") {
      return null;
    }
    const betterScores = await db.select({ count: sql2`count(*)` }).from(userTests).where(
      and3(
        eq4(userTests.templateId, userTest.templateId),
        eq4(userTests.testStatus, "completed"),
        sql2`${userTests.percentage} > ${userTest.percentage}`
      )
    );
    const totalParticipants = await db.select({ count: sql2`count(*)` }).from(userTests).where(
      and3(
        eq4(userTests.templateId, userTest.templateId),
        eq4(userTests.testStatus, "completed")
      )
    );
    const rank = (betterScores[0]?.count || 0) + 1;
    const total = totalParticipants[0]?.count || 1;
    const percentile = Math.round((total - rank) / total * 100);
    return {
      rank,
      totalParticipants: total,
      percentile
    };
  }
};

// server/src/routes/test.ts
import { z as z4 } from "zod";
var router5 = Router5();
var testService = new TestService();
var CreateTestTemplateSchema = z4.object({
  examId: z4.string().uuid("Invalid exam ID"),
  templateName: z4.string().min(1, "Template name is required"),
  testType: z4.enum(["full_length", "sectional", "topic_wise", "previous_year", "daily_practice"]).optional(),
  totalQuestions: z4.number().positive("Total questions must be positive"),
  totalMarks: z4.number().positive("Total marks must be positive"),
  durationMinutes: z4.number().positive("Duration must be positive"),
  isFree: z4.boolean().optional(),
  price: z4.number().min(0).optional(),
  instructions: z4.string().optional(),
  syllabusCoverage: z4.string().optional()
});
var CreateUserTestSchema = z4.object({
  templateId: z4.string().uuid("Invalid template ID")
});
var CompleteTestSchema = z4.object({
  timeTakenSeconds: z4.number().min(0),
  totalQuestionsAttempted: z4.number().min(0),
  correctAnswers: z4.number().min(0),
  incorrectAnswers: z4.number().min(0),
  skippedQuestions: z4.number().min(0),
  marksObtained: z4.number().min(0),
  percentage: z4.number().min(0).max(100),
  rank: z4.number().positive().optional(),
  totalParticipants: z4.number().positive().optional(),
  percentile: z4.number().min(0).max(100).optional()
});
var SubmitResponseSchema = z4.object({
  userTestId: z4.string().uuid("Invalid user test ID"),
  questionId: z4.string().uuid("Invalid question ID"),
  userAnswer: z4.string().optional(),
  isCorrect: z4.boolean().optional(),
  timeTakenSeconds: z4.number().min(0).optional(),
  isMarkedForReview: z4.boolean().optional(),
  responseOrder: z4.number().min(1).optional(),
  marksObtained: z4.number().min(0).optional()
});
var UpdateResponseSchema = z4.object({
  userAnswer: z4.string().optional(),
  isCorrect: z4.boolean().optional(),
  timeTakenSeconds: z4.number().min(0).optional(),
  isMarkedForReview: z4.boolean().optional(),
  marksObtained: z4.number().min(0).optional()
});
var GenerateTestSchema = z4.object({
  templateId: z4.string().uuid("Invalid template ID"),
  examId: z4.string().uuid("Invalid exam ID"),
  subjectIds: z4.array(z4.string().uuid()).optional()
});
router5.get("/templates", async (req, res) => {
  try {
    const { examId } = req.query;
    const templates = await testService.getAllTestTemplates(examId);
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test templates"
    });
  }
});
router5.get("/templates/:templateId", async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await testService.getTestTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Test template not found"
      });
    }
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test template"
    });
  }
});
router5.post("/templates", authenticateToken, async (req, res) => {
  try {
    const validatedData = CreateTestTemplateSchema.parse(req.body);
    const template = await testService.createTestTemplate(validatedData);
    res.status(201).json({
      success: true,
      message: "Test template created successfully",
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create test template"
    });
  }
});
router5.put("/templates/:templateId", authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const validatedData = CreateTestTemplateSchema.partial().parse(req.body);
    const template = await testService.updateTestTemplate(templateId, validatedData);
    res.json({
      success: true,
      message: "Test template updated successfully",
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update test template"
    });
  }
});
router5.delete("/templates/:templateId", authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    await testService.deleteTestTemplate(templateId);
    res.json({
      success: true,
      message: "Test template deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete test template"
    });
  }
});
router5.post("/user-tests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = CreateUserTestSchema.parse(req.body);
    const userTest = await testService.createUserTest(userId, validatedData.templateId);
    res.status(201).json({
      success: true,
      message: "User test created successfully",
      data: userTest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create user test"
    });
  }
});
router5.get("/user-tests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    const userTests2 = await testService.getUserTests(userId, status);
    res.json({
      success: true,
      data: userTests2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user tests"
    });
  }
});
router5.get("/user-tests/:userTestId", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const userTest = await testService.getUserTestById(userTestId);
    if (!userTest) {
      return res.status(404).json({
        success: false,
        message: "User test not found"
      });
    }
    res.json({
      success: true,
      data: userTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user test"
    });
  }
});
router5.put("/user-tests/:userTestId/start", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const userTest = await testService.startUserTest(userTestId);
    res.json({
      success: true,
      message: "Test started successfully",
      data: userTest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to start test"
    });
  }
});
router5.put("/user-tests/:userTestId/complete", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const validatedData = CompleteTestSchema.parse(req.body);
    const userTest = await testService.completeUserTest(userTestId, validatedData);
    res.json({
      success: true,
      message: "Test completed successfully",
      data: userTest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to complete test"
    });
  }
});
router5.put("/user-tests/:userTestId/abandon", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const userTest = await testService.abandonUserTest(userTestId);
    res.json({
      success: true,
      message: "Test abandoned successfully",
      data: userTest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to abandon test"
    });
  }
});
router5.post("/responses", authenticateToken, async (req, res) => {
  try {
    const validatedData = SubmitResponseSchema.parse(req.body);
    const response = await testService.submitTestResponse(validatedData);
    res.status(201).json({
      success: true,
      message: "Test response submitted successfully",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to submit test response"
    });
  }
});
router5.get("/user-tests/:userTestId/responses", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const responses = await testService.getUserTestResponses(userTestId);
    res.json({
      success: true,
      data: responses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test responses"
    });
  }
});
router5.put("/responses/:responseId", authenticateToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const validatedData = UpdateResponseSchema.parse(req.body);
    const response = await testService.updateTestResponse(responseId, validatedData);
    res.json({
      success: true,
      message: "Test response updated successfully",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update test response"
    });
  }
});
router5.post("/generate-questions", authenticateToken, async (req, res) => {
  try {
    const validatedData = GenerateTestSchema.parse(req.body);
    const questions2 = await testService.generateTestQuestions(
      validatedData.templateId,
      validatedData.examId,
      validatedData.subjectIds
    );
    res.json({
      success: true,
      data: questions2
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to generate test questions"
    });
  }
});
router5.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = "30" } = req.query;
    const analytics = await testService.getUserTestAnalytics(userId, parseInt(days));
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test analytics"
    });
  }
});
router5.get("/templates/:templateId/leaderboard", async (req, res) => {
  try {
    const { templateId } = req.params;
    const { limit = "100" } = req.query;
    const leaderboard = await testService.getTestLeaderboard(templateId, parseInt(limit));
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leaderboard"
    });
  }
});
router5.get("/user-tests/:userTestId/rank", authenticateToken, async (req, res) => {
  try {
    const { userTestId } = req.params;
    const rank = await testService.getUserRankInTest(userTestId);
    if (!rank) {
      return res.status(404).json({
        success: false,
        message: "Test not found or not completed"
      });
    }
    res.json({
      success: true,
      data: rank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test rank"
    });
  }
});
var test_default = router5;

// server/src/routes/simplePractice.ts
import { Router as Router6 } from "express";

// server/src/services/simplePractice.ts
import { eq as eq5, and as and4, desc as desc4, count } from "drizzle-orm";
var PracticeService = class {
  // Create a practice session (for tracking purposes)
  async createPracticeSession(userId, category, sessionData) {
    try {
      const newSession = {
        userId,
        category,
        totalQuestions: sessionData.totalQuestions || 20,
        timeLimitMinutes: sessionData.timeLimitMinutes || 15,
        status: "completed",
        // Since we're saving after completion
        questionsData: sessionData.questionsData || [],
        timeSpentSeconds: sessionData.timeSpentSeconds || 0,
        correctAnswers: sessionData.correctAnswers || 0,
        incorrectAnswers: sessionData.incorrectAnswers || 0,
        questionsAttempted: sessionData.questionsAttempted || 0,
        skippedQuestions: sessionData.skippedQuestions || 0,
        percentage: sessionData.percentage?.toString() || "0",
        completedAt: /* @__PURE__ */ new Date()
      };
      const [session] = await db.insert(practiceSessions).values(newSession).returning();
      return session;
    } catch (error) {
      console.error("Error creating practice session:", error);
      throw new Error("Failed to create practice session");
    }
  }
  // Get user's practice history
  async getUserPracticeHistory(userId, limit = 50, offset = 0) {
    try {
      const sessions = await db.select().from(practiceSessions).where(eq5(practiceSessions.userId, userId)).orderBy(desc4(practiceSessions.createdAt)).limit(limit).offset(offset);
      return sessions;
    } catch (error) {
      console.error("Error fetching practice history:", error);
      throw new Error("Failed to fetch practice history");
    }
  }
  // Get user's practice statistics
  async getUserPracticeStats(userId) {
    try {
      const [totalSessions] = await db.select({ count: count() }).from(practiceSessions).where(eq5(practiceSessions.userId, userId));
      const [completedSessions] = await db.select({ count: count() }).from(practiceSessions).where(and4(
        eq5(practiceSessions.userId, userId),
        eq5(practiceSessions.status, "completed")
      ));
      const sessions = await db.select({
        correctAnswers: practiceSessions.correctAnswers,
        totalQuestions: practiceSessions.totalQuestions,
        timeSpentSeconds: practiceSessions.timeSpentSeconds
      }).from(practiceSessions).where(and4(
        eq5(practiceSessions.userId, userId),
        eq5(practiceSessions.status, "completed")
      ));
      const totalCorrect = sessions.reduce((sum, s) => sum + (s.correctAnswers || 0), 0);
      const totalQuestions = sessions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
      const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0);
      return {
        totalSessions: totalSessions.count,
        completedSessions: completedSessions.count,
        totalCorrectAnswers: totalCorrect,
        totalQuestionsAttempted: totalQuestions,
        averageAccuracy: totalQuestions > 0 ? totalCorrect / totalQuestions * 100 : 0,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0
      };
    } catch (error) {
      console.error("Error fetching practice stats:", error);
      throw new Error("Failed to fetch practice statistics");
    }
  }
};

// server/src/controllers/simplePractice.ts
import { z as z5 } from "zod";
var practiceService = new PracticeService();
var CreatePracticeSessionSchema2 = z5.object({
  category: z5.enum(["economy", "gk", "history", "geography", "english", "aptitude", "agriculture", "marathi"]),
  totalQuestions: z5.number().min(1).max(50).optional().default(20),
  timeLimitMinutes: z5.number().min(5).max(60).optional().default(15),
  questionsData: z5.array(z5.object({
    questionId: z5.string(),
    userAnswer: z5.string(),
    isCorrect: z5.boolean(),
    timeSpentSeconds: z5.number().min(0)
  })).optional().default([]),
  timeSpentSeconds: z5.number().min(0).optional().default(0),
  correctAnswers: z5.number().min(0).optional().default(0),
  incorrectAnswers: z5.number().min(0).optional().default(0),
  questionsAttempted: z5.number().min(0).optional().default(0),
  skippedQuestions: z5.number().min(0).optional().default(0),
  percentage: z5.number().min(0).max(100).optional().default(0),
  status: z5.enum(["completed"]).optional().default("completed")
});
var createPracticeSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = CreatePracticeSessionSchema2.parse(req.body);
    const session = await practiceService.createPracticeSession(
      userId,
      validatedData.category,
      validatedData
    );
    res.status(201).json({
      success: true,
      message: "Practice session saved successfully",
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to save practice session"
    });
  }
};
var getUserPracticeHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = "50", offset = "0" } = req.query;
    const sessions = await practiceService.getUserPracticeHistory(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch practice history"
    });
  }
};
var getUserPracticeStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await practiceService.getUserPracticeStats(userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch practice statistics"
    });
  }
};

// server/src/routes/simplePractice.ts
var router6 = Router6();
router6.post("/sessions", authenticateToken, createPracticeSession);
router6.get("/history", authenticateToken, getUserPracticeHistory);
router6.get("/stats", authenticateToken, getUserPracticeStats);
var simplePractice_default = router6;

// server/src/routes/enhancedPractice.ts
import { Router as Router7 } from "express";

// server/src/services/enhancedPractice.ts
import { eq as eq6, and as and5, desc as desc5, count as count2, sql as sql3 } from "drizzle-orm";
var EnhancedPracticeService = class {
  // Create a practice session with detailed tracking
  async createPracticeSession(userId, category, sessionData) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format");
      }
      const newSession = {
        userId,
        category,
        totalQuestions: sessionData.totalQuestions || 20,
        timeLimitMinutes: sessionData.timeLimitMinutes || 15,
        status: "completed",
        questionsData: sessionData.questionsData || [],
        timeSpentSeconds: sessionData.timeSpentSeconds || 0,
        correctAnswers: sessionData.correctAnswers || 0,
        incorrectAnswers: sessionData.incorrectAnswers || 0,
        questionsAttempted: sessionData.questionsAttempted || 0,
        skippedQuestions: sessionData.skippedQuestions || 0,
        percentage: sessionData.percentage?.toString() || "0",
        completedAt: /* @__PURE__ */ new Date()
      };
      const [session] = await db.insert(practiceSessions).values(newSession).returning();
      await this.updateUserPracticeStats(userId, sessionData);
      return session;
    } catch (error) {
      console.error("Error creating practice session:", error);
      throw new Error("Failed to create practice session");
    }
  }
  // Update user practice statistics in profile
  async updateUserPracticeStats(userId, sessionData) {
    try {
      const currentDate = /* @__PURE__ */ new Date();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const [user] = await db.select().from(users).where(eq6(users.userId, userId)).limit(1);
      if (!user) {
        throw new Error("User not found");
      }
      const newTotalSessions = (user.totalPracticeSessions || 0) + 1;
      const newTotalScore = (user.totalPracticeScore || 0) + (sessionData.correctAnswers || 0);
      const weeklySessions = await db.select({ count: count2() }).from(practiceSessions).where(and5(
        eq6(practiceSessions.userId, userId),
        sql3`${practiceSessions.createdAt} >= ${weekStart}`
      ));
      const weeklyScores = await db.select({ total: sql3`COALESCE(SUM(${practiceSessions.correctAnswers}), 0)` }).from(practiceSessions).where(and5(
        eq6(practiceSessions.userId, userId),
        sql3`${practiceSessions.createdAt} >= ${weekStart}`
      ));
      const monthlySessions = await db.select({ count: count2() }).from(practiceSessions).where(and5(
        eq6(practiceSessions.userId, userId),
        sql3`${practiceSessions.createdAt} >= ${monthStart}`
      ));
      const monthlyScores = await db.select({ total: sql3`COALESCE(SUM(${practiceSessions.correctAnswers}), 0)` }).from(practiceSessions).where(and5(
        eq6(practiceSessions.userId, userId),
        sql3`${practiceSessions.createdAt} >= ${monthStart}`
      ));
      await db.update(users).set({
        totalPracticeSessions: newTotalSessions,
        totalPracticeScore: newTotalScore,
        weeklyPracticeScore: weeklyScores[0]?.total || 0,
        monthlyPracticeScore: monthlyScores[0]?.total || 0,
        weeklyPracticeCount: weeklySessions[0]?.count || 0,
        monthlyPracticeCount: monthlySessions[0]?.count || 0,
        lastPracticeDate: currentDate,
        lastActivityDate: currentDate.toISOString().split("T")[0],
        updatedAt: currentDate
      }).where(eq6(users.userId, userId));
    } catch (error) {
      console.error("Error updating user practice stats:", error);
      throw new Error("Failed to update user statistics");
    }
  }
  // Get user's practice history with detailed question data
  async getUserPracticeHistory(userId, limit = 50, offset = 0) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format");
      }
      const sessions = await db.select().from(practiceSessions).where(eq6(practiceSessions.userId, userId)).orderBy(desc5(practiceSessions.createdAt)).limit(limit).offset(offset);
      return sessions;
    } catch (error) {
      console.error("Error fetching practice history:", error);
      throw new Error("Failed to fetch practice history");
    }
  }
  // Get user's comprehensive practice statistics
  async getUserPracticeStats(userId) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format");
      }
      const [user] = await db.select({
        totalPracticeSessions: users.totalPracticeSessions,
        totalPracticeScore: users.totalPracticeScore,
        weeklyPracticeScore: users.weeklyPracticeScore,
        monthlyPracticeScore: users.monthlyPracticeScore,
        weeklyPracticeCount: users.weeklyPracticeCount,
        monthlyPracticeCount: users.monthlyPracticeCount,
        lastPracticeDate: users.lastPracticeDate,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak
      }).from(users).where(eq6(users.userId, userId)).limit(1);
      if (!user) {
        throw new Error("User not found");
      }
      const sessions = await db.select({
        correctAnswers: practiceSessions.correctAnswers,
        totalQuestions: practiceSessions.totalQuestions,
        timeSpentSeconds: practiceSessions.timeSpentSeconds,
        percentage: practiceSessions.percentage,
        category: practiceSessions.category,
        createdAt: practiceSessions.createdAt
      }).from(practiceSessions).where(and5(
        eq6(practiceSessions.userId, userId),
        eq6(practiceSessions.status, "completed")
      )).orderBy(desc5(practiceSessions.createdAt)).limit(100);
      const totalCorrect = sessions.reduce((sum, s) => sum + (s.correctAnswers || 0), 0);
      const totalQuestions = sessions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
      const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0);
      const categoryStats = sessions.reduce((acc, session) => {
        const category = session.category || "unknown";
        if (!acc[category]) {
          acc[category] = { correct: 0, total: 0, sessions: 0 };
        }
        acc[category].correct += session.correctAnswers || 0;
        acc[category].total += session.totalQuestions || 0;
        acc[category].sessions += 1;
        return acc;
      }, {});
      return {
        // Profile stats
        totalPracticeSessions: user.totalPracticeSessions || 0,
        totalPracticeScore: user.totalPracticeScore || 0,
        weeklyPracticeScore: user.weeklyPracticeScore || 0,
        monthlyPracticeScore: user.monthlyPracticeScore || 0,
        weeklyPracticeCount: user.weeklyPracticeCount || 0,
        monthlyPracticeCount: user.monthlyPracticeCount || 0,
        lastPracticeDate: user.lastPracticeDate,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        // Calculated stats
        totalCorrectAnswers: totalCorrect,
        totalQuestionsAttempted: totalQuestions,
        averageAccuracy: totalQuestions > 0 ? totalCorrect / totalQuestions * 100 : 0,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0,
        // Category performance
        categoryPerformance: categoryStats,
        // Recent performance (last 10 sessions)
        recentSessions: sessions.slice(0, 10).map((s) => ({
          correctAnswers: s.correctAnswers,
          totalQuestions: s.totalQuestions,
          percentage: parseFloat(s.percentage || "0"),
          category: s.category,
          timeSpentMinutes: Math.round((s.timeSpentSeconds || 0) / 60),
          createdAt: s.createdAt
        }))
      };
    } catch (error) {
      console.error("Error fetching practice stats:", error);
      throw new Error("Failed to fetch practice statistics");
    }
  }
  // Get detailed session with explanations
  async getSessionWithExplanations(sessionId, userId) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format");
      }
      const [session] = await db.select().from(practiceSessions).where(and5(
        eq6(practiceSessions.sessionId, sessionId),
        eq6(practiceSessions.userId, userId)
      )).limit(1);
      return session;
    } catch (error) {
      console.error("Error fetching session details:", error);
      throw new Error("Failed to fetch session details");
    }
  }
};

// server/src/controllers/enhancedPractice.ts
var practiceService2 = new EnhancedPracticeService();
var EnhancedPracticeController = class {
  // Complete a practice session with detailed scoring
  async completePracticeSession(req, res) {
    try {
      const { userId } = req.params;
      const sessionData = req.body;
      if (!sessionData.questionsData || !Array.isArray(sessionData.questionsData)) {
        return res.status(400).json({
          success: false,
          message: "Questions data is required"
        });
      }
      const questionsData = sessionData.questionsData;
      const correctAnswers = questionsData.filter((q) => q.isCorrect).length;
      const incorrectAnswers = questionsData.filter((q) => !q.isCorrect && q.userAnswer).length;
      const skippedQuestions = questionsData.filter((q) => !q.userAnswer).length;
      const questionsAttempted = correctAnswers + incorrectAnswers;
      const percentage = questionsData.length > 0 ? correctAnswers / questionsData.length * 100 : 0;
      const enhancedSessionData = {
        ...sessionData,
        correctAnswers,
        incorrectAnswers,
        questionsAttempted,
        skippedQuestions,
        percentage: percentage.toFixed(2),
        timeSpentSeconds: sessionData.timeSpentSeconds || 0
      };
      const session = await practiceService2.createPracticeSession(userId, sessionData.category, enhancedSessionData);
      res.status(201).json({
        success: true,
        message: "Practice session completed successfully",
        data: {
          sessionId: session.sessionId,
          score: correctAnswers,
          totalQuestions: questionsData.length,
          percentage: percentage.toFixed(2),
          timeSpentMinutes: Math.round((sessionData.timeSpentSeconds || 0) / 60),
          category: sessionData.category,
          completedAt: session.completedAt
        }
      });
    } catch (error) {
      console.error("Error completing practice session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete practice session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  // Get user's practice history
  async getUserPracticeHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const sessions = await practiceService2.getUserPracticeHistory(
        userId,
        parseInt(limit),
        parseInt(offset)
      );
      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error("Error fetching practice history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch practice history",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  // Get comprehensive practice statistics
  async getUserPracticeStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await practiceService2.getUserPracticeStats(userId);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching practice stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch practice statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  // Get detailed session with explanations
  async getSessionDetails(req, res) {
    try {
      const { sessionId, userId } = req.params;
      const session = await practiceService2.getSessionWithExplanations(sessionId, userId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found"
        });
      }
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error("Error fetching session details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch session details",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};

// server/src/routes/enhancedPractice.ts
var router7 = Router7();
var practiceController = new EnhancedPracticeController();
router7.post("/complete/:userId", practiceController.completePracticeSession.bind(practiceController));
router7.get("/history/:userId", practiceController.getUserPracticeHistory.bind(practiceController));
router7.get("/stats/:userId", practiceController.getUserPracticeStats.bind(practiceController));
router7.get("/session/:sessionId/:userId", practiceController.getSessionDetails.bind(practiceController));
var enhancedPractice_default = router7;

// server/src/routes/dynamicExam.ts
import { Router as Router8 } from "express";

// server/src/services/dynamicExam.ts
import { eq as eq7, and as and6, desc as desc6 } from "drizzle-orm";
var DynamicExamService = class {
  // Create a new dynamic exam session
  async createExamSession(userId, examConfig) {
    try {
      const totalQuestions = examConfig.questionDistribution.reduce((sum, dist) => sum + dist.count, 0);
      const newSession = {
        userId,
        examName: examConfig.examName,
        totalMarks: examConfig.totalMarks,
        durationMinutes: examConfig.durationMinutes,
        totalQuestions,
        negativeMarking: examConfig.negativeMarking || false,
        negativeMarksRatio: examConfig.negativeMarksRatio?.toString() || "0.25",
        questionDistribution: examConfig.questionDistribution,
        status: "not_started"
      };
      const [session] = await db.insert(dynamicExamSessions).values(newSession).returning();
      return session;
    } catch (error) {
      console.error("Error creating exam session:", error);
      throw new Error("Failed to create exam session");
    }
  }
  // Start an exam session
  async startExamSession(sessionId, userId) {
    try {
      const [session] = await db.update(dynamicExamSessions).set({
        status: "in_progress",
        startedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and6(
        eq7(dynamicExamSessions.sessionId, sessionId),
        eq7(dynamicExamSessions.userId, userId)
      )).returning();
      if (!session) {
        throw new Error("Exam session not found");
      }
      return session;
    } catch (error) {
      console.error("Error starting exam session:", error);
      throw new Error("Failed to start exam session");
    }
  }
  // Update exam session with questions data
  async updateExamSessionQuestions(sessionId, userId, questionsData) {
    try {
      const [session] = await db.update(dynamicExamSessions).set({
        questionsData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and6(
        eq7(dynamicExamSessions.sessionId, sessionId),
        eq7(dynamicExamSessions.userId, userId)
      )).returning();
      return session;
    } catch (error) {
      console.error("Error updating exam session questions:", error);
      throw new Error("Failed to update exam session");
    }
  }
  // Complete an exam session
  async completeExamSession(sessionId, userId, completionData) {
    try {
      const [session] = await db.update(dynamicExamSessions).set({
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        timeSpentSeconds: completionData.timeSpentSeconds,
        questionsAttempted: completionData.questionsAttempted,
        correctAnswers: completionData.correctAnswers,
        incorrectAnswers: completionData.incorrectAnswers,
        skippedQuestions: completionData.skippedQuestions,
        marksObtained: completionData.marksObtained.toString(),
        percentage: completionData.percentage.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and6(
        eq7(dynamicExamSessions.sessionId, sessionId),
        eq7(dynamicExamSessions.userId, userId)
      )).returning();
      if (!session) {
        throw new Error("Exam session not found");
      }
      return session;
    } catch (error) {
      console.error("Error completing exam session:", error);
      throw new Error("Failed to complete exam session");
    }
  }
  // Get exam session by ID
  async getExamSession(sessionId, userId) {
    try {
      const [session] = await db.select().from(dynamicExamSessions).where(and6(
        eq7(dynamicExamSessions.sessionId, sessionId),
        eq7(dynamicExamSessions.userId, userId)
      )).limit(1);
      return session;
    } catch (error) {
      console.error("Error fetching exam session:", error);
      throw new Error("Failed to fetch exam session");
    }
  }
  // Get user's exam history
  async getUserExamHistory(userId, limit = 50, offset = 0) {
    try {
      const sessions = await db.select().from(dynamicExamSessions).where(eq7(dynamicExamSessions.userId, userId)).orderBy(desc6(dynamicExamSessions.createdAt)).limit(limit).offset(offset);
      return sessions;
    } catch (error) {
      console.error("Error fetching exam history:", error);
      throw new Error("Failed to fetch exam history");
    }
  }
  // Get user's exam statistics
  async getUserExamStats(userId) {
    try {
      const sessions = await db.select({
        totalSessions: dynamicExamSessions.sessionId,
        totalMarks: dynamicExamSessions.marksObtained,
        totalTime: dynamicExamSessions.timeSpentSeconds,
        averagePercentage: dynamicExamSessions.percentage,
        examName: dynamicExamSessions.examName,
        completedAt: dynamicExamSessions.completedAt
      }).from(dynamicExamSessions).where(and6(
        eq7(dynamicExamSessions.userId, userId),
        eq7(dynamicExamSessions.status, "completed")
      ));
      const totalSessions = sessions.length;
      const totalMarks = sessions.reduce((sum, s) => sum + parseFloat(s.totalMarks || "0"), 0);
      const totalTime = sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0);
      const averagePercentage = sessions.length > 0 ? sessions.reduce((sum, s) => sum + parseFloat(s.averagePercentage || "0"), 0) / sessions.length : 0;
      return {
        totalSessions,
        totalMarks,
        totalTimeMinutes: Math.round(totalTime / 60),
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        recentExams: sessions.slice(0, 10).map((s) => ({
          examName: s.examName,
          marksObtained: s.totalMarks,
          percentage: s.averagePercentage,
          completedAt: s.completedAt
        }))
      };
    } catch (error) {
      console.error("Error fetching exam stats:", error);
      throw new Error("Failed to fetch exam statistics");
    }
  }
  // Generate random questions from categories
  async generateQuestionsFromCategories(questionDistribution) {
    try {
      const allQuestions = [];
      for (const dist of questionDistribution) {
        let questionsData = [];
        switch (dist.category) {
          case "economy":
            questionsData = __require("../../data/English/economyEnglish.json");
            break;
          case "gk":
            questionsData = __require("../../data/English/GKEnglish.json");
            break;
          case "history":
            questionsData = __require("../../data/English/historyEnglish.json");
            break;
          case "geography":
            questionsData = __require("../../data/English/geographyEnglish.json");
            break;
          case "english":
            questionsData = __require("../../data/English/englishGrammer.json");
            break;
          case "aptitude":
            questionsData = __require("../../data/English/AptitudeEnglish.json");
            break;
          case "agriculture":
            questionsData = __require("../../data/English/agricultureEnglish.json");
            break;
          case "marathi":
            questionsData = __require("../../data/Marathi/grammerMarathi.json");
            break;
          default:
            continue;
        }
        if (!Array.isArray(questionsData)) {
          continue;
        }
        const shuffled = questionsData.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, dist.count);
        const formattedQuestions = selectedQuestions.map((q, index) => ({
          questionId: `${dist.category}_${index + 1}`,
          questionText: q.Question || q.question || "",
          options: q.Options ? q.Options.map((opt, optIndex) => ({
            id: optIndex + 1,
            text: typeof opt === "string" ? opt : opt.text || opt.id || ""
          })) : [],
          correctAnswer: q.CorrectAnswer || q.correctAnswer || "",
          userAnswer: "",
          isCorrect: false,
          timeSpentSeconds: 0,
          marksObtained: 0,
          category: dist.category,
          marksPerQuestion: dist.marksPerQuestion
        }));
        allQuestions.push(...formattedQuestions);
      }
      return allQuestions.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("Error generating questions:", error);
      throw new Error("Failed to generate questions");
    }
  }
};

// server/src/controllers/dynamicExam.ts
import { z as z6 } from "zod";
var dynamicExamService = new DynamicExamService();
var CreateExamSessionSchema = z6.object({
  examName: z6.string().min(1, "Exam name is required"),
  totalMarks: z6.number().positive("Total marks must be positive"),
  durationMinutes: z6.number().positive("Duration must be positive"),
  questionDistribution: z6.array(z6.object({
    category: z6.string().min(1, "Category is required"),
    count: z6.number().positive("Count must be positive"),
    marksPerQuestion: z6.number().positive("Marks per question must be positive")
  })).min(1, "At least one category is required"),
  negativeMarking: z6.boolean().optional(),
  negativeMarksRatio: z6.number().min(0).max(1).optional()
});
var CompleteExamSessionSchema = z6.object({
  timeSpentSeconds: z6.number().min(0),
  questionsAttempted: z6.number().min(0),
  correctAnswers: z6.number().min(0),
  incorrectAnswers: z6.number().min(0),
  skippedQuestions: z6.number().min(0),
  marksObtained: z6.number(),
  percentage: z6.number().min(0).max(100)
});
var createExamSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = CreateExamSessionSchema.parse(req.body);
    const session = await dynamicExamService.createExamSession(userId, validatedData);
    res.status(201).json({
      success: true,
      message: "Exam session created successfully",
      data: session
    });
  } catch (error) {
    console.error("Error creating exam session:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create exam session"
    });
  }
};
var startExamSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const session = await dynamicExamService.startExamSession(sessionId, userId);
    res.json({
      success: true,
      message: "Exam session started successfully",
      data: session
    });
  } catch (error) {
    console.error("Error starting exam session:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to start exam session"
    });
  }
};
var generateExamQuestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const session = await dynamicExamService.getExamSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found"
      });
    }
    const questions2 = await dynamicExamService.generateQuestionsFromCategories(
      session.questionDistribution
    );
    res.json({
      success: true,
      message: "Questions generated successfully",
      data: {
        sessionId: session.sessionId,
        examName: session.examName,
        totalMarks: session.totalMarks,
        durationMinutes: session.durationMinutes,
        totalQuestions: session.totalQuestions,
        negativeMarking: session.negativeMarking,
        negativeMarksRatio: session.negativeMarksRatio,
        questions: questions2
      }
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate questions"
    });
  }
};
var submitExamAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array"
      });
    }
    const session = await dynamicExamService.getExamSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found"
      });
    }
    await dynamicExamService.updateExamSessionQuestions(sessionId, userId, answers);
    res.json({
      success: true,
      message: "Answers submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting answers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit answers"
    });
  }
};
var completeExamSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const validatedData = CompleteExamSessionSchema.parse(req.body);
    const session = await dynamicExamService.completeExamSession(sessionId, userId, validatedData);
    res.json({
      success: true,
      message: "Exam completed successfully",
      data: session
    });
  } catch (error) {
    console.error("Error completing exam session:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to complete exam session"
    });
  }
};
var getExamSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const session = await dynamicExamService.getExamSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found"
      });
    }
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error("Error fetching exam session:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam session"
    });
  }
};
var getUserExamHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = "50", offset = "0" } = req.query;
    const history = await dynamicExamService.getUserExamHistory(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("Error fetching exam history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam history"
    });
  }
};
var getUserExamStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await dynamicExamService.getUserExamStats(userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exam statistics"
    });
  }
};

// server/src/routes/dynamicExam.ts
var router8 = Router8();
router8.use(authenticateToken);
router8.post("/create", createExamSession);
router8.post("/:sessionId/start", startExamSession);
router8.get("/:sessionId/questions", generateExamQuestions);
router8.post("/:sessionId/answers", submitExamAnswers);
router8.post("/:sessionId/complete", completeExamSession);
router8.get("/:sessionId", getExamSession);
router8.get("/history", getUserExamHistory);
router8.get("/stats", getUserExamStats);
var dynamicExam_default = router8;

// server/src/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
config2();
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", auth_default);
app.use("/api/user", user_default);
app.use("/api/exam", exam_default);
app.use("/api/progress", progress_default);
app.use("/api/test", test_default);
app.use("/api/practice", simplePractice_default);
app.use("/api/practice/enhanced", enhancedPractice_default);
app.use("/api/exam/dynamic", dynamicExam_default);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var clientPath = path.resolve(process.cwd(), "dist/public");
console.log("Serving static files from:", clientPath);
app.use(express.static(clientPath));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found"
    });
  }
  res.sendFile(path.join(clientPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`\u{1F680} Padhlo Monorepo Server running on port ${PORT}`);
  console.log(`\u{1F4CA} Health check: http://localhost:${PORT}/health`);
  console.log(`\u{1F510} Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`\u{1F464} User endpoints: http://localhost:${PORT}/api/user`);
  console.log(`\u{1F4DA} Exam endpoints: http://localhost:${PORT}/api/exam`);
  console.log(`\u{1F4C8} Progress endpoints: http://localhost:${PORT}/api/progress`);
  console.log(`\u{1F9EA} Test endpoints: http://localhost:${PORT}/api/test`);
  console.log(`\u{1F3AF} Practice endpoints: http://localhost:${PORT}/api/practice`);
  console.log(`\u{1F3AF} Enhanced Practice endpoints: http://localhost:${PORT}/api/practice/enhanced`);
  console.log(`\u{1F4DD} Dynamic Exam endpoints: http://localhost:${PORT}/api/exam/dynamic`);
  console.log(`\u{1F310} Web app: http://localhost:${PORT}`);
  console.log(`\u{1F4F1} Mobile app uses same backend API`);
});
