// Auth controller - handles HTTP requests for authentication
import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ACCESS_TOKEN_EXPIRES_MS, REFRESH_TOKEN_EXPIRES_MS } from '../utils/jwt';
import { env } from '../env';
import { HttpStatus } from '../utils/httpStatus';

export class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'User registered successfully. Default "Favorite" tag created.',
      data: user,
    });
  }

  /**
   * POST /auth/login
   * Login and set HTTP-only cookies
   */
  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    // Set HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRES_MS,
      domain: env.COOKIE_DOMAIN,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRES_MS,
      domain: env.COOKIE_DOMAIN,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token not provided',
        },
      });
      return;
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRES_MS,
      domain: env.COOKIE_DOMAIN,
    });

    res.json({
      success: true,
      message: 'Access token refreshed',
    });
  }

  /**
   * POST /auth/logout
   * Clear auth cookies
   */
  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      domain: env.COOKIE_DOMAIN,
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      domain: env.COOKIE_DOMAIN,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  /**
   * GET /auth/me
   * Get current user info
   */
  async me(req: Request, res: Response) {
    const userPayload = (req as any).user;
    if (!userPayload) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
      });
      return;
    }

    const user = await authService.getCurrentUser(userPayload.userId);

    res.json({
      success: true,
      data: user,
    });
  }
}

// Singleton instance
export const authController = new AuthController();

