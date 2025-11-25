/**
 * API response type definitions
 * 
 * This module defines standardized types for API responses
 * to ensure consistency across all API endpoints.
 * 
 * All API responses follow a consistent structure:
 * - Success responses include data, status, and optional message
 * - Error responses include error, code, and status
 */

/**
 * Standard API success response
 * 
 * Used for successful API responses. Includes the response data
 * along with status information.
 * 
 * @template T - Type of the response data
 * 
 * @example
 *   {
 *     data: { userId: "123", name: "John" },
 *     status: 200,
 *     message: "User retrieved successfully"
 *   }
 */
export interface ApiSuccessResponse<T = any> {
  /**
   * Response data
   */
  data: T;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Optional success message
   */
  message?: string;
}

/**
 * Standard API error response
 * 
 * Used for error responses. Includes error information
 * and status code.
 * 
 * @example
 *   {
 *     error: "Validation failed",
 *     code: "VALIDATION_ERROR",
 *     status: 400,
 *     context: { field: "email", reason: "Invalid format" }
 *   }
 */
export interface ApiErrorResponse {
  /**
   * Error message
   */
  error: string;

  /**
   * Application-specific error code
   */
  code: string;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Optional context data for debugging
   */
  context?: Record<string, any>;
}

/**
 * Generic API response type
 * 
 * Union type representing either success or error response.
 * 
 * @template T - Type of the response data (for success responses)
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type guard to check if response is a success response
 * 
 * @param response - Response to check
 * @returns True if response is a success response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return "data" in response && "status" in response;
}

/**
 * Type guard to check if response is an error response
 * 
 * @param response - Response to check
 * @returns True if response is an error response
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return "error" in response && "code" in response && "status" in response;
}

/**
 * Create a standardized success response
 * 
 * Helper function to create success responses with consistent structure.
 * 
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param message - Optional success message
 * @returns Success response object
 * 
 * @example
 *   createSuccessResponse({ userId: "123" }, 200, "User created")
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): ApiSuccessResponse<T> {
  return {
    data,
    status,
    ...(message && { message }),
  };
}


