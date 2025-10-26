// JWT utility functions for Access and Refresh tokens
import jwt from 'jsonwebtoken';
import { env } from '../env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate Access Token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as any);
}

/**
 * Generate Refresh Token (long-lived)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as any);
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
}

/**
 * Get expiration time in milliseconds
 */
function getExpiresInMs(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000; // Default 15 minutes
  }
}

export const ACCESS_TOKEN_EXPIRES_MS = getExpiresInMs(env.JWT_ACCESS_EXPIRES_IN);
export const REFRESH_TOKEN_EXPIRES_MS = getExpiresInMs(env.JWT_REFRESH_EXPIRES_IN);

