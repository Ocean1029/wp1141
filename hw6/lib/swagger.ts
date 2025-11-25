/**
 * Swagger configuration
 * 
 * This module configures Swagger/OpenAPI documentation for the API.
 * It scans API route files for JSDoc comments and generates OpenAPI specification.
 */

import swaggerJsdoc from "swagger-jsdoc";
import { config } from "@/config/env";

/**
 * Swagger definition configuration
 */
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "HW6 LINE Bot API",
    version: "1.0.0",
    description:
      "API documentation for HW6 - A LINE Bot application with OpenAI integration",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: config.baseUrl,
      description: config.isProduction ? "Production server" : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Bearer token authentication",
      },
      lineSignature: {
        type: "apiKey",
        in: "header",
        name: "x-line-signature",
        description: "LINE webhook signature for request verification",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
            example: "Internal server error",
          },
        },
        required: ["error"],
      },
      WebhookEvent: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Event type",
            enum: ["message", "follow", "unfollow", "join", "leave", "memberJoined", "memberLeft", "postback", "videoPlayComplete", "beacon", "accountLink", "things"],
            example: "message",
          },
          timestamp: {
            type: "integer",
            description: "Event timestamp",
            example: 1234567890123,
          },
          source: {
            type: "object",
            description: "Source information",
            properties: {
              type: {
                type: "string",
                enum: ["user", "group", "room"],
              },
              userId: {
                type: "string",
                description: "User ID",
              },
              groupId: {
                type: "string",
                description: "Group ID",
              },
              roomId: {
                type: "string",
                description: "Room ID",
              },
            },
          },
          replyToken: {
            type: "string",
            description: "Reply token for sending reply message",
          },
          message: {
            type: "object",
            description: "Message content (for message events)",
            properties: {
              type: {
                type: "string",
                enum: ["text", "image", "video", "audio", "file", "location", "sticker"],
              },
              id: {
                type: "string",
              },
              text: {
                type: "string",
                description: "Message text (for text messages)",
              },
            },
          },
        },
        required: ["type", "timestamp", "source"],
      },
      WebhookResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Response status",
            example: "OK",
          },
        },
        required: ["status"],
      },
      WebhookVerificationResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Verification message",
            example: "LINE Webhook endpoint is active",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Current server timestamp",
          },
        },
        required: ["message", "timestamp"],
      },
    },
  },
};

/**
 * Swagger JSDoc options
 * Scans API route files for Swagger annotations
 */
const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/*.tsx",
  ],
};

/**
 * Generated Swagger specification
 */
export const swaggerSpec = swaggerJsdoc(options);

