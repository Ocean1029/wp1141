// Swagger/OpenAPI configuration
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TripTimeline Maps API',
      version: '1.0.0',
      description: `
# TripTimeline Maps API Documentation

A **map-first** trip planning application that combines location management, 
tag-based organization, and timeline scheduling in a single unified interface.

## Features

- 🗺️ **Google Maps Integration**: Interactive map with click-to-add places
- 🏷️ **Tag System**: Organize places with custom tags
- 📅 **Timeline/Calendar**: Schedule events with FullCalendar integration
- 🔐 **JWT Authentication**: Secure login with HTTP-only cookies
- 🔍 **Google Places Search**: Server-side place search and geocoding

## Architecture

- **TypeScript**: Full type safety
- **Prisma ORM**: Type-safe database access
- **JWT Tokens**: Access + Refresh token pattern
- **Zod Validation**: Request validation
- **Modular Monolith**: Scalable architecture

## Authentication

All protected routes require authentication via HTTP-only cookies.
Login at \`/auth/login\` to receive tokens automatically set as cookies.

## Data Invariants

1. **Places must have at least one tag** - Cannot create or leave a place without tags
2. **Users can only access their own data** - All write operations enforce ownership
3. **Events must have startTime < endTime** - Time validation enforced
      `,
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management',
      },
      {
        name: 'Tags',
        description: 'Tag management for organizing places',
      },
      {
        name: 'Places',
        description: 'Location management with map coordinates',
      },
      {
        name: 'Events',
        description: 'Timeline events and scheduling',
      },
      {
        name: 'Maps',
        description: 'Google Maps API services (Geocoding & Places)',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'HTTP-only cookie containing JWT access token',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'UNAUTHORIZED' },
                      message: { type: 'string', example: 'Invalid or expired access token' },
                    },
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'NOT_FOUND' },
                      message: { type: 'string', example: 'Resource not found' },
                    },
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'VALIDATION_ERROR' },
                      message: { type: 'string', example: 'Validation failed' },
                      details: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            path: { type: 'string' },
                            message: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.route.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

