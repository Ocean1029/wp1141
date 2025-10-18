// Modern Express server with TypeScript, Prisma ORM, and Modular Monolith architecture
import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './shared/middleware/errorHandler';
import diaryRoutes from './modules/diaries/diary.routes';
import themeRoutes from './modules/themes/theme.routes';
import segmentRoutes from './modules/segments/segment.routes';
import colorRoutes from './modules/colors/color.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Returns API information and available endpoints
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information
 */

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Diary Reflection API Server v2.0',
    description: 'Modern TypeScript + Prisma + Modular Monolith Architecture',
    version: '2.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      api: '/api',
      diaries: '/api/diaries',
      themes: '/api/themes',
      segments: '/api/segments',
      colors: '/api/colors',
    },
    features: [
      'TypeScript with strict mode',
      'Prisma ORM for type-safe database access',
      'Modular Monolith architecture',
      'Zod validation',
      'Centralized error handling',
      'Interactive API Documentation (Swagger UI)',
    ],
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Diary Reflection API Docs',
}));

// API Documentation JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api/diaries', diaryRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/colors', colorRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${env.NODE_ENV} mode
📡 Listening on port ${PORT}
🔗 API: http://localhost:${PORT}
📚 Health: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

