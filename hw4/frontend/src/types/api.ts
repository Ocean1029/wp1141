// Common API response types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ErrorResponse {
  error: ApiError;
  stack?: string;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

