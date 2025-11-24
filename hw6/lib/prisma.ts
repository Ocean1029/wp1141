import { PrismaClient } from "@prisma/client";
import { config } from "@/config/env";

/**
 * Global Prisma Client instance
 * 
 * In development, we reuse the same instance across hot reloads
 * to prevent multiple connections. In production, we create a new instance.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance with logging configuration
 * 
 * In development mode, logs queries, errors, and warnings.
 * In production mode, only logs errors.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

// Reuse the same instance in development to prevent connection issues during hot reload
if (!config.isProduction) globalForPrisma.prisma = prisma;

