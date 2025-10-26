// Authentication middleware - JWT verification
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../types/errors';

/**
 * Middleware to protect routes - requires valid access token in cookie
 */
export const authGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedError('No access token provided');
    }

    const decoded = verifyAccessToken(accessToken);
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired access token'));
    }
  }
};

/**
 * Optional auth middleware - sets user if token exists, but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.access_token;

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
    next();
  }
};

