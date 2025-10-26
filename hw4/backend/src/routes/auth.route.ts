// Auth routes
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authGuard } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *                 description: Must contain at least one letter and one number
 *     responses:
 *       201:
 *         description: User registered successfully (default "Favorite" tag created)
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register',
  validate(registerSchema, 'body'),
  asyncHandler(authController.register.bind(authController))
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive HTTP-only cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (cookies set)
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: access_token=...; refresh_token=...
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  validate(loginSchema, 'body'),
  asyncHandler(authController.login.bind(authController))
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and clear cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', asyncHandler(authController.logout.bind(authController)));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authGuard, asyncHandler(authController.me.bind(authController)));

export default router;

