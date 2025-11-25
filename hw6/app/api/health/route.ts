/**
 * Health check endpoint
 * 
 * This route provides health status information for the application,
 * including database connectivity. It is commonly used by monitoring
 * systems and load balancers to verify service availability.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createSuccessResponse } from "@/types/api.types";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: |
 *       Returns the health status of the application and database connectivity.
 *       This endpoint is useful for monitoring systems, load balancers, and
 *       deployment pipelines to verify that the service is operational.
 *       
 *       The endpoint performs a lightweight database query to verify connectivity.
 *       If the database connection fails, the endpoint will return a 503 status
 *       code indicating service unavailability.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *             example:
 *               status: "ok"
 *               database: "connected"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       503:
 *         description: Service unavailable - database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *             example:
 *               status: "error"
 *               database: "disconnected"
 *               error: "Database connection failed"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Perform a lightweight database query to verify connectivity
    // Using $queryRaw with SELECT 1 is a common pattern for health checks
    // as it's the most efficient way to test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // If the query succeeds, both application and database are healthy
    const response = createSuccessResponse(
      {
        status: "ok",
        database: "connected",
        timestamp,
      },
      200
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // Log the error for debugging purposes
    logger.error("Health check failed - database connection error", {
      timestamp,
    }, error instanceof Error ? error : new Error(String(error)));

    // Return 503 Service Unavailable status code
    // This indicates that the service is temporarily unavailable
    // due to database connectivity issues
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error:
          error instanceof Error
            ? error.message
            : "Database connection failed",
        timestamp,
      },
      { status: 503 }
    );
  }
}

