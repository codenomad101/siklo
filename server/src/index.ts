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
import jobsRoutes from './routes/jobs';
import adminRoutes from './routes/admin';
import statisticsRoutes from './routes/statistics';
import studyRoutes from './routes/study';
import notesRoutes from './routes/notes';

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
app.use('/api/jobs', jobsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/notes', notesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Development vs Production setup
if (isDevelopment) {
  // Development: Use Vite middleware for hot reloading
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: path.resolve(process.cwd(), 'client'),
    });
    
    app.use(vite.middlewares);
    
    // Handle client-side routing in development
    app.get('*', async (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: 'API endpoint not found',
        });
      }
      
      try {
        const html = await vite.transformIndexHtml(req.url, `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <link rel="icon" type="image/svg+xml" href="/vite.svg" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>enMantra</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  });
} else {
  // Production: Serve static files from build
  const clientPath = path.resolve(process.cwd(), 'dist/public');
  console.log('📦 Serving static files from:', clientPath);
  
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
}

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 enMantra Monorepo Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 User endpoints: http://localhost:${PORT}/api/user`);
  console.log(`📚 Exam endpoints: http://localhost:${PORT}/api/exam`);
  console.log(`📈 Progress endpoints: http://localhost:${PORT}/api/progress`);
  console.log(`🧪 Test endpoints: http://localhost:${PORT}/api/test`);
  console.log(`🎯 Practice endpoints: http://localhost:${PORT}/api/practice`);
  console.log(`🎯 Enhanced Practice endpoints: http://localhost:${PORT}/api/practice/enhanced`);
  console.log(`📝 Dynamic Exam endpoints: http://localhost:${PORT}/api/exam/dynamic`);
  console.log(`👑 Admin endpoints: http://localhost:${PORT}/api/admin`);
  console.log(`📖 Study endpoints: http://localhost:${PORT}/api/study`);
  console.log(`🌐 Web app: http://localhost:${PORT}`);
  console.log(`📱 Mobile app uses same backend API`);
  
  if (isDevelopment) {
    console.log(`\n🔧 DEVELOPMENT MODE:`);
    console.log(`   Frontend & Backend running together on: http://localhost:${PORT}`);
    console.log(`   Hot reloading enabled - no need to rebuild!`);
    console.log(`   Just run: npm run dev`);
  }
});