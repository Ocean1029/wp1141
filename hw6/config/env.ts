/**
 * Environment variables configuration with Zod validation
 * 
 * This module provides type-safe access to all environment variables
 * used in the application. All environment variables are validated
 * at application startup using Zod schemas.
 * 
 * Enhanced error messages provide clear guidance when environment
 * variables are missing or invalid.
 */

import { z } from "zod";

/**
 * Schema for validating environment variables
 * 
 * Each variable includes custom error messages for better developer experience.
 * Error messages provide clear guidance on what is missing or invalid.
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      errorMap: () => ({
        message:
          "Invalid NODE_ENV value. Must be one of: development, production, test\n" +
          "Example: NODE_ENV=development",
      }),
    })
    .default("development"),

  // Database configuration
  DATABASE_URL: z
    .string({
      required_error:
        "Missing required environment variable: DATABASE_URL\n" +
        "Description: PostgreSQL database connection string\n" +
        "Please set this variable in your .env file.\n" +
        "Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname",
    })
    .url({
      message:
        "DATABASE_URL must be a valid URL\n" +
        "Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname",
    }),

  // Base URL configuration
  // Development: ngrok generated domain (e.g., https://xxxx-xxxx-xxxx.ngrok.io)
  // Production: https://wp-hw6.ocean1029.com
  // If not set, defaults to http://localhost:3000 in development
  BASE_URL: z
    .string()
    .url({
      message:
        "BASE_URL must be a valid URL\n" +
        "Example: BASE_URL=https://your-domain.com",
    })
    .optional(),

  // LINE Bot configuration
  LINE_CHANNEL_ACCESS_TOKEN: z
    .string({
      required_error:
        "Missing required environment variable: LINE_CHANNEL_ACCESS_TOKEN\n" +
        "Description: LINE Bot channel access token for API authentication\n" +
        "Please set this variable in your .env file.\n" +
        "Example: LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here",
    })
    .min(1, {
      message:
        "LINE_CHANNEL_ACCESS_TOKEN cannot be empty\n" +
        "Please set this variable in your .env file.\n" +
        "Example: LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here",
    }),

  LINE_CHANNEL_SECRET: z
    .string({
      required_error:
        "Missing required environment variable: LINE_CHANNEL_SECRET\n" +
        "Description: LINE Bot channel secret for webhook signature verification\n" +
        "Please set this variable in your .env file.\n" +
        "Example: LINE_CHANNEL_SECRET=your_channel_secret_here",
    })
    .min(1, {
      message:
        "LINE_CHANNEL_SECRET cannot be empty\n" +
        "Please set this variable in your .env file.\n" +
        "Example: LINE_CHANNEL_SECRET=your_channel_secret_here",
    }),

  // OpenAI configuration
  OPENAI_API_KEY: z
    .string({
      required_error:
        "Missing required environment variable: OPENAI_API_KEY\n" +
        "Description: OpenAI API key for AI functionality\n" +
        "Please set this variable in your .env file.\n" +
        "Example: OPENAI_API_KEY=sk-...",
    })
    .min(1, {
      message:
        "OPENAI_API_KEY cannot be empty\n" +
        "Please set this variable in your .env file.\n" +
        "Example: OPENAI_API_KEY=sk-...",
    }),

  OPENAI_MODEL: z.string().default("gpt-4"),

  OPENAI_ORG_ID: z.string().optional(),
});

/**
 * Validated environment variables
 * 
 * Throws detailed error if validation fails, providing clear guidance
 * on what environment variables are missing or invalid.
 */
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format Zod errors into user-friendly messages
    const errorMessages = error.errors.map((err) => {
      const path = err.path.join(".");
      return `\n❌ ${path}: ${err.message}`;
    });

    const fullMessage =
      "Environment variable validation failed:\n" +
      errorMessages.join("\n") +
      "\n\nPlease check your .env file and ensure all required variables are set correctly.";

    console.error(fullMessage);
    throw new Error(fullMessage);
  }
  throw error;
}

const baseUrl = env.BASE_URL ?? "http://localhost:3000";

/**
 * Type-safe environment configuration object
 */
export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  databaseUrl: env.DATABASE_URL,

  baseUrl,

  line: {
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: env.LINE_CHANNEL_SECRET,
    // Automatically construct webhook URL from baseUrl
    webhookUrl: `${baseUrl}/api/webhook`,
  },

  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    orgId: env.OPENAI_ORG_ID,
  },
} as const;

/**
 * Export type for the config object
 */
export type Config = typeof config;

