// Routes for Theme module
import { Router } from 'express';
import { themeController } from './theme.controller';
import { asyncHandler } from '../../shared/middleware/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/themes:
 *   get:
 *     summary: Get all themes
 *     tags: [Themes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search themes by name or description
 *       - in: query
 *         name: colorId
 *         schema:
 *           type: integer
 *         description: Filter by color ID
 *       - in: query
 *         name: includeSegments
 *         schema:
 *           type: boolean
 *         description: Include segments in the response
 *     responses:
 *       200:
 *         description: List of themes
 */
router.get('/', asyncHandler(themeController.getAllThemes.bind(themeController)));

/**
 * @swagger
 * /api/themes/{id}:
 *   get:
 *     summary: Get a theme by ID
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme details
 *       404:
 *         description: Theme not found
 */
router.get('/:id', asyncHandler(themeController.getThemeById.bind(themeController)));

/**
 * @swagger
 * /api/themes:
 *   post:
 *     summary: Create a new theme
 *     tags: [Themes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               colorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Theme created successfully
 *       409:
 *         description: Theme with this name already exists
 */
router.post('/', asyncHandler(themeController.createTheme.bind(themeController)));

/**
 * @swagger
 * /api/themes/{id}:
 *   put:
 *     summary: Update a theme
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               colorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *       404:
 *         description: Theme not found
 *       409:
 *         description: Theme with this name already exists
 */
router.put('/:id', asyncHandler(themeController.updateTheme.bind(themeController)));

/**
 * @swagger
 * /api/themes/{id}:
 *   delete:
 *     summary: Delete a theme
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme deleted successfully
 *       404:
 *         description: Theme not found
 */
router.delete('/:id', asyncHandler(themeController.deleteTheme.bind(themeController)));

export default router;

