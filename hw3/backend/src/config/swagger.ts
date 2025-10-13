// Swagger/OpenAPI configuration for API documentation
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Diary Reflection API',
      version: '2.0.0',
      description: `
Modern diary reflection application with AI-powered theme categorization.

## Features
- 📝 Full CRUD operations for diary entries
- 🔍 Search functionality
- 🤖 AI-based content segmentation
- 🏷️ Automatic theme classification
- 🎨 Color-coded theme organization
- ✅ Type-safe with TypeScript & Prisma ORM

## Architecture
- **TypeScript**: Full type safety
- **Prisma ORM**: Type-safe database access
- **Modular Monolith**: Scalable architecture
- **Zod Validation**: Request validation
- **Express**: Web framework
      `,
      contact: {
        name: 'API Support',
        url: 'https://github.com/your-repo',
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
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'API base path',
      },
    ],
    tags: [
      {
        name: 'Diaries',
        description: 'Diary entry management operations',
      },
      {
        name: 'Themes',
        description: 'Theme categorization operations (Coming Soon)',
      },
      {
        name: 'Segments',
        description: 'AI-generated diary segments (Coming Soon)',
      },
    ],
    components: {
      schemas: {
        Diary: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              nullable: true,
              maxLength: 255,
              description: 'Optional diary title',
              example: 'A Reflective Monday',
            },
            content: {
              type: 'string',
              description: 'Main diary content',
              example: 'Today I felt...',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateDiaryRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Optional diary title',
            },
            content: {
              type: 'string',
              minLength: 1,
              description: 'Diary content (required)',
              example: 'Today was a great day...',
            },
          },
        },
        UpdateDiaryRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Updated title',
            },
            content: {
              type: 'string',
              minLength: 1,
              description: 'Updated content',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            message: {
              type: 'string',
              example: 'Detailed error description',
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: 'Diary not found',
              },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: 'Validation failed',
                message: 'Content is required',
              },
            },
          },
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

