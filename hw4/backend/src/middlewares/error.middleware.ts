// Global error handling middleware
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { env } from '../env';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '../utils/httpStatus';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle known application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.name,
        message: error.message,
        ...(error instanceof AppError && (error as any).details && { details: (error as any).details }),
      },
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return res.status(HttpStatus.CONFLICT).json({
        error: {
          code: 'CONFLICT',
          message: 'A record with this value already exists',
        },
      });
    }
    // Record not found
    if (error.code === 'P2025') {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or malformed token',
      },
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      },
    });
  }

  // Handle unknown errors
  console.error('Unhandled error:', error);
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    ...(env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack,
    }),
  });
};

