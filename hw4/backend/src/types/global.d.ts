// Global type definitions for Express

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};

