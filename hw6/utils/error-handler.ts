/**
 * Error handling utilities
 * 
 * This module provides utilities for handling and formatting errors
 * in a consistent way across the application.
 * 
 * Functions include:
 * - Converting errors to API responses
 * - Logging errors appropriately
 * - Extracting error information safely
 */

import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiErrorResponse } from "@/types/api.types";

/**
 * Handle error and convert to API response
 * 
 * Converts any error (AppError or generic Error) to a standardized
 * API error response. Logs the error if necessary.
 * 
 * @param error - Error to handle
 * @param defaultMessage - Default message if error has no message
 * @returns NextResponse with error information
 * 
 * @example
 *   try {
 *     // ... some operation
 *   } catch (error) {
 *     return handleError(error);
 *   }
 */
export function handleError(
  error: unknown,
  defaultMessage: string = "An error occurred without a message"
): NextResponse<ApiErrorResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    // Log error if it should be logged
    if (error.shouldLog) {
      logger.error("Application error", {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        status: error.statusCode,
        ...(error.context && { context: error.context }),
      },
      { status: error.statusCode }
    );
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    logger.error("Unexpected error", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        error: error.message || defaultMessage,
        code: "INTERNAL_ERROR",
        status: 500,
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  logger.error("Unknown error type", {
    error: String(error),
    type: typeof error,
  });

  return NextResponse.json(
    {
      error: defaultMessage,
      code: "INTERNAL_ERROR",
      status: 500,
    },
    { status: 500 }
  );
}

/**
 * Extract error message safely
 * 
 * Safely extracts error message from any error type.
 * 
 * @param error - Error to extract message from
 * @param defaultMessage - Default message if extraction fails
 * @returns Error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "An error occurred"
): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}

/**
 * Check if error is an AppError instance
 * 
 * @param error - Error to check
 * @returns True if error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Create a standardized error response object
 * 
 * Creates an error response object that can be used in API routes.
 * 
 * @param message - Error message
 * @param code - Error code
 * @param status - HTTP status code
 * @param context - Optional context data
 * @returns Error response object
 */
export function createErrorResponse(
  message: string,
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  context?: Record<string, any>
): ApiErrorResponse {
  return {
    error: message,
    code,
    status,
    ...(context && { context }),
  };
}


