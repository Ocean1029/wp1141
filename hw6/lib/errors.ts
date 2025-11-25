/**
 * Application error classes
 * 
 * This module defines custom error classes for structured error handling.
 * All application errors should extend from AppError to maintain consistency.
 * 
 * Error classes include:
 * - HTTP status codes for API responses
 * - Error codes for programmatic error handling
 * - User-friendly error messages
 * - Optional context data for debugging
 */

/**
 * Base application error class
 * 
 * All custom errors extend from this class to ensure consistent
 * error structure and handling across the application.
 */
export class AppError extends Error {
  /**
   * HTTP status code for API responses
   */
  public readonly statusCode: number;

  /**
   * Application-specific error code
   */
  public readonly code: string;

  /**
   * Additional context data for debugging
   */
  public readonly context?: Record<string, any>;

  /**
   * Whether this error should be logged
   */
  public readonly shouldLog: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    context?: Record<string, any>,
    shouldLog: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.shouldLog = shouldLog;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.statusCode,
      ...(this.context && { context: this.context }),
    };
  }
}

/**
 * Validation error
 * 
 * Used when request validation fails (e.g., missing required fields,
 * invalid format, out of range values).
 * 
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    context?: Record<string, any>
  ) {
    super(message, 400, "VALIDATION_ERROR", context, false);
  }
}

/**
 * Authentication error
 * 
 * Used when authentication fails (e.g., invalid credentials,
 * missing authentication token).
 * 
 * HTTP Status: 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication failed",
    context?: Record<string, any>
  ) {
    super(message, 401, "AUTHENTICATION_ERROR", context, true);
  }
}

/**
 * Authorization error
 * 
 * Used when user is authenticated but lacks permission
 * to perform the requested action.
 * 
 * HTTP Status: 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    context?: Record<string, any>
  ) {
    super(message, 403, "AUTHORIZATION_ERROR", context, true);
  }
}

/**
 * Not found error
 * 
 * Used when requested resource does not exist.
 * 
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    context?: Record<string, any>
  ) {
    super(message, 404, "NOT_FOUND", context, false);
  }
}

/**
 * Conflict error
 * 
 * Used when request conflicts with current state
 * (e.g., duplicate entry, resource already exists).
 * 
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    context?: Record<string, any>
  ) {
    super(message, 409, "CONFLICT", context, false);
  }
}

/**
 * Internal server error
 * 
 * Used for unexpected server errors that should not occur
 * under normal circumstances.
 * 
 * HTTP Status: 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    context?: Record<string, any>
  ) {
    super(message, 500, "INTERNAL_ERROR", context, true);
  }
}

/**
 * External service error
 * 
 * Used when an external service (e.g., OpenAI API, LINE API)
 * returns an error or is unavailable.
 * 
 * HTTP Status: 502 Bad Gateway or 503 Service Unavailable
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string = "External service error",
    serviceName?: string,
    context?: Record<string, any>
  ) {
    const fullMessage = serviceName
      ? `${serviceName} service error: ${message}`
      : message;
    super(fullMessage, 502, "EXTERNAL_SERVICE_ERROR", context, true);
  }
}

/**
 * Timeout error
 * 
 * Used when a request or operation times out.
 * 
 * HTTP Status: 504 Gateway Timeout
 */
export class TimeoutError extends AppError {
  constructor(
    message: string = "Request timeout",
    context?: Record<string, any>
  ) {
    super(message, 504, "TIMEOUT", context, true);
  }
}


