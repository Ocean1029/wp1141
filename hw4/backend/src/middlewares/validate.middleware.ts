// Zod validation middleware
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware to validate request data with Zod schema
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = schema.parse(data);
      req[target] = validated;
      next();
    } catch (error) {
      // ZodError will be caught by global error handler
      next(error);
    }
  };
};

