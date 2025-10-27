// Place routes
import { Router } from 'express';
import { placeController } from '../controllers/place.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authGuard } from '../middlewares/auth.middleware';
import { createPlaceSchema, updatePlaceSchema, placeQuerySchema } from '../schemas/place.schema';

const router = Router();

// All place routes require authentication
router.use(authGuard);

/**
 * @swagger
 * /api/places:
 *   get:
 *     summary: Get all places for current user
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search places by title, address, or notes
 *       - in: query
 *         name: tagNames
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Filter by tag names (single name or array)
 *         example: ["Food", "Sights"]
 *     responses:
 *       200:
 *         description: List of places
 */
router.get(
  '/',
  validate(placeQuerySchema, 'query'),
  asyncHandler(placeController.getAllPlaces.bind(placeController))
);

/**
 * @swagger
 * /api/places/{id}:
 *   get:
 *     summary: Get place by Google Place ID
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *         example: ChIJJ5eIcCqpQjQROgRLBhQBw7U
 *     responses:
 *       200:
 *         description: Place details with tags and events
 *       404:
 *         description: Place not found
 */
router.get('/:id', asyncHandler(placeController.getPlaceById.bind(placeController)));

/**
 * @swagger
 * /api/places:
 *   post:
 *     summary: Create a new place
 *     description: Creates a place using Google Place ID as the primary key
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *               - lat
 *               - lng
 *               - tags
 *             properties:
 *               id:
 *                 type: string
 *                 description: Google Place ID (used as primary key)
 *                 example: ChIJJ5eIcCqpQjQROgRLBhQBw7U
 *               title:
 *                 type: string
 *                 example: Taipei 101
 *               lat:
 *                 type: number
 *                 example: 25.0330
 *               lng:
 *                 type: number
 *                 example: 121.5654
 *               address:
 *                 type: string
 *                 example: No. 7, Section 5, Xinyi Road, Taipei
 *               notes:
 *                 type: string
 *                 example: Visit the observatory
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Tag names (at least one required, tags must exist)
 *                 example: ["Favorite", "Sights"]
 *     responses:
 *       201:
 *         description: Place created successfully
 *       400:
 *         description: Validation error (missing required fields or invalid data)
 *       404:
 *         description: One or more tags not found
 */
router.post(
  '/',
  validate(createPlaceSchema, 'body'),
  asyncHandler(placeController.createPlace.bind(placeController))
);

/**
 * @swagger
 * /api/places/{id}:
 *   patch:
 *     summary: Update a place
 *     description: Update place details (cannot change Place ID or tags via this endpoint)
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *         example: ChIJJ5eIcCqpQjQROgRLBhQBw7U
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Taipei 101 Observatory
 *               lat:
 *                 type: number
 *                 example: 25.0330
 *               lng:
 *                 type: number
 *                 example: 121.5654
 *               address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Place updated successfully
 *       404:
 *         description: Place not found
 */
router.patch(
  '/:id',
  validate(updatePlaceSchema, 'body'),
  asyncHandler(placeController.updatePlace.bind(placeController))
);

/**
 * @swagger
 * /api/places/{id}:
 *   delete:
 *     summary: Delete a place
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *         example: ChIJJ5eIcCqpQjQROgRLBhQBw7U
 *     responses:
 *       200:
 *         description: Place deleted successfully
 *       404:
 *         description: Place not found
 */
router.delete('/:id', asyncHandler(placeController.deletePlace.bind(placeController)));

/**
 * @swagger
 * /api/places/{id}/tags/{tagName}:
 *   post:
 *     summary: Add a tag to a place
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag name
 *     responses:
 *       200:
 *         description: Tag added successfully
 */
router.post('/:id/tags/:tagName', asyncHandler(placeController.addTagToPlace.bind(placeController)));

/**
 * @swagger
 * /api/places/{id}/tags/{tagName}:
 *   delete:
 *     summary: Remove a tag from a place
 *     description: Removes a tag. Will fail if place would be left without tags.
 *     tags: [Places]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag name
 *     responses:
 *       200:
 *         description: Tag removed successfully
 *       422:
 *         description: Cannot remove - place must have at least one tag
 */
router.delete('/:id/tags/:tagName', asyncHandler(placeController.removeTagFromPlace.bind(placeController)));

export default router;

