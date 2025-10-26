// Event routes
import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authGuard } from '../middlewares/auth.middleware';
import { createEventSchema, updateEventSchema, eventQuerySchema } from '../schemas/event.schema';

const router = Router();

// All event routes require authentication
router.use(authGuard);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events for current user
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events starting from this time (ISO 8601)
 *         example: 2025-01-01T00:00:00Z
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events ending before this time (ISO 8601)
 *         example: 2025-01-31T23:59:59Z
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         description: Filter events associated with a specific place
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
  '/',
  validate(eventQuerySchema, 'query'),
  asyncHandler(eventController.getAllEvents.bind(eventController))
);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details with associated places
 *       404:
 *         description: Event not found
 */
router.get('/:id', asyncHandler(eventController.getEventById.bind(eventController)));

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *                 example: Visit Taipei 101
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-15T09:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-15T11:00:00Z
 *               notes:
 *                 type: string
 *                 example: Remember to bring camera
 *               placeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Places to associate with this event
 *                 example: ["place-id-1", "place-id-2"]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error (e.g., startTime >= endTime)
 */
router.post(
  '/',
  validate(createEventSchema, 'body'),
  asyncHandler(eventController.createEvent.bind(eventController))
);

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id',
  validate(updateEventSchema, 'body'),
  asyncHandler(eventController.updateEvent.bind(eventController))
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id', asyncHandler(eventController.deleteEvent.bind(eventController)));

/**
 * @swagger
 * /api/events/{id}/places/{placeId}:
 *   post:
 *     summary: Add a place to an event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     responses:
 *       200:
 *         description: Place added successfully
 */
router.post('/:id/places/:placeId', asyncHandler(eventController.addPlaceToEvent.bind(eventController)));

/**
 * @swagger
 * /api/events/{id}/places/{placeId}:
 *   delete:
 *     summary: Remove a place from an event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Place ID
 *     responses:
 *       200:
 *         description: Place removed successfully
 */
router.delete('/:id/places/:placeId', asyncHandler(eventController.removePlaceFromEvent.bind(eventController)));

export default router;

