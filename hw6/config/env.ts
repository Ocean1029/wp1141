/**
 * Environment variables configuration with Zod validation
 * 
 * This module provides type-safe access to all environment variables
 * used in the application. All environment variables are validated
 * at application startup using Zod schemas.
 */

import { z } from "zod";

/**
 * Schema for validating environment variables
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database configuration
  DATABASE_URL: z.string().url(),
});

/**
 * Validated environment variables
 */
const env = envSchema.parse(process.env);

/**
 * Type-safe environment configuration object
 */
export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  databaseUrl: env.DATABASE_URL,
} as const;

/**
 * Export type for the config object
 */
export type Config = typeof config;

