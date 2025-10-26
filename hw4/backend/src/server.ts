// Server entry point
import app from './app';
import { env } from './env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
🚀 TripTimeline Maps API Server
================================
Environment: ${env.NODE_ENV}
Listening on port ${PORT}
API: http://localhost:${PORT}
Swagger UI: http://localhost:${PORT}/api-docs
Health check: http://localhost:${PORT}/health

Ready to accept requests!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

