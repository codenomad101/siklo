import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import examRoutes from './routes/exam';
import progressRoutes from './routes/progress';
import testRoutes from './routes/test';
import practiceRoutes from './routes/simplePractice';
import enhancedPracticeRoutes from './routes/enhancedPractice';
import dynamicExamRoutes from './routes/dynamicExam';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/test', testRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/practice/enhanced', enhancedPracticeRoutes);
app.use('/api/exam/dynamic', dynamicExamRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve static files from client build (both dev and prod)
const clientPath = path.resolve(process.cwd(), 'dist/public');
console.log('📦 Serving static files from:', clientPath);

// Serve static files
app.use(express.static(clientPath));

// Handle client-side routing (SPA) - only for non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
    });
  }
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Siklo Monorepo Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 User endpoints: http://localhost:${PORT}/api/user`);
  console.log(`📚 Exam endpoints: http://localhost:${PORT}/api/exam`);
  console.log(`📈 Progress endpoints: http://localhost:${PORT}/api/progress`);
  console.log(`🧪 Test endpoints: http://localhost:${PORT}/api/test`);
  console.log(`🎯 Practice endpoints: http://localhost:${PORT}/api/practice`);
  console.log(`🎯 Enhanced Practice endpoints: http://localhost:${PORT}/api/practice/enhanced`);
  console.log(`📝 Dynamic Exam endpoints: http://localhost:${PORT}/api/exam/dynamic`);
  console.log(`🌐 Web app: http://localhost:${PORT}`);
  console.log(`📱 Mobile app uses same backend API`);
  
  if (isDevelopment) {
    console.log(`\n🔧 DEVELOPMENT MODE:`);
    console.log(`   Frontend & Backend running together on: http://localhost:${PORT}`);
    console.log(`   Build frontend first: npm run build:client`);
    console.log(`   Then start backend: npm run dev`);
  }
});