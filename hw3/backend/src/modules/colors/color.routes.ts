// Routes for Color module
import { Router } from 'express';
import { colorController } from './color.controller';
import { asyncHandler } from '../../shared/middleware/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/colors:
 *   get:
 *     summary: Get all colors
 *     tags: [Colors]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search colors by name, hex code, or meaning
 *     responses:
 *       200:
 *         description: List of colors
 */
router.get('/', asyncHandler(colorController.getAllColors.bind(colorController)));

/**
 * @swagger
 * /api/colors/{id}:
 *   get:
 *     summary: Get a color by ID
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     responses:
 *       200:
 *         description: Color details
 *       404:
 *         description: Color not found
 */
router.get('/:id', asyncHandler(colorController.getColorById.bind(colorController)));

/**
 * @swagger
 * /api/colors:
 *   post:
 *     summary: Create a new color
 *     tags: [Colors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hexCode
 *               - name
 *             properties:
 *               hexCode:
 *                 type: string
 *                 example: "#FF5733"
 *               name:
 *                 type: string
 *                 example: "Sunset Orange"
 *               meaning:
 *                 type: string
 *     responses:
 *       201:
 *         description: Color created successfully
 *       409:
 *         description: Color with this hex code or name already exists
 */
router.post('/', asyncHandler(colorController.createColor.bind(colorController)));

/**
 * @swagger
 * /api/colors/{id}:
 *   put:
 *     summary: Update a color
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hexCode:
 *                 type: string
 *               name:
 *                 type: string
 *               meaning:
 *                 type: string
 *     responses:
 *       200:
 *         description: Color updated successfully
 *       404:
 *         description: Color not found
 *       409:
 *         description: Color with this hex code or name already exists
 */
router.put('/:id', asyncHandler(colorController.updateColor.bind(colorController)));

/**
 * @swagger
 * /api/colors/{id}:
 *   delete:
 *     summary: Delete a color
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     responses:
 *       200:
 *         description: Color deleted successfully
 *       404:
 *         description: Color not found
 */
router.delete('/:id', asyncHandler(colorController.deleteColor.bind(colorController)));

export default router;

