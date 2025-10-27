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
 *         example: 2025-12-31T23:59:59Z
 *       - in: query
 *         name: placeId
 *         schema:
 *           type: string
 *         description: Filter by Google Place ID
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
 *           format: uuid
 *           example: 41d21368-a23d-46b8-8d1a-8a0779687ba7
 *         description: Event ID (UUID)
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
 *     description: Create an event with optional place associations (using Google Place IDs)
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
 *                 example: Dinner at Night Market
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T18:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T20:00:00Z
 *               notes:
 *                 type: string
 *                 example: Try the street food
 *               placeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Google Place IDs to associate with this event
 *                 example: ["ChIJaXPV9ZSyjogRP2jKp2mopF4"]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error (startTime must be before endTime)
 *       404:
 *         description: One or more places not found
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
 *     description: Update event details (cannot change place associations via this endpoint)
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 41d21368-a23d-46b8-8d1a-8a0779687ba7
 *         description: Event ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Event Title
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
 *           format: uuid
 *           example: 41d21368-a23d-46b8-8d1a-8a0779687ba7
 *         description: Event ID
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *           example: ChIJl8D1EepqpogRu4XN9F9l7o8
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

