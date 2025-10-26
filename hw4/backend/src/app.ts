// Express app configuration
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './env';
import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middlewares/error.middleware';

// Route imports
import authRoutes from './routes/auth.route';
import tagRoutes from './routes/tag.route';
import placeRoutes from './routes/place.route';
import eventRoutes from './routes/event.route';
import mapsRoutes from './routes/maps.route';

const app = express();

// CORS configuration
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'TripTimeline Maps API',
    version: '1.0.0',
    description: 'Map-first trip planning with timeline scheduling',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      tags: '/api/tags',
      places: '/api/places',
      events: '/api/events',
      maps: '/maps/*',
    },
    features: [
      'JWT Authentication with HTTP-only cookies',
      'Google Maps JavaScript API integration',
      'Server-side Geocoding & Places API',
      'Tag-based place organization',
      'Timeline event scheduling',
      'Full CRUD operations',
    ],
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TripTimeline Maps API Documentation',
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/maps', mapsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;

