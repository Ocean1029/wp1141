// Maps routes - Google Maps API proxy
import { Router } from 'express';
import { mapsController } from '../controllers/maps.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authGuard } from '../middlewares/auth.middleware';
import { geocodeQuerySchema, reverseGeocodeQuerySchema, placesSearchQuerySchema } from '../schemas/maps.schema';

const router = Router();

// All maps routes require authentication
router.use(authGuard);

/**
 * @swagger
 * /maps/geocode:
 *   get:
 *     summary: Geocode address to coordinates
 *     tags: [Maps]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address to geocode
 *         example: 1600 Amphitheatre Parkway, Mountain View, CA
 *     responses:
 *       200:
 *         description: Geocoding results
 */
router.get(
  '/geocode',
  validate(geocodeQuerySchema, 'query'),
  asyncHandler(mapsController.geocode.bind(mapsController))
);

/**
 * @swagger
 * /maps/reverse-geocode:
 *   get:
 *     summary: Reverse geocode coordinates to address
 *     tags: [Maps]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *         example: 25.0330
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *         example: 121.5654
 *     responses:
 *       200:
 *         description: Reverse geocoding results
 */
router.get(
  '/reverse-geocode',
  validate(reverseGeocodeQuerySchema, 'query'),
  asyncHandler(mapsController.reverseGeocode.bind(mapsController))
);

/**
 * @swagger
 * /maps/search:
 *   get:
 *     summary: Search for places by keyword
 *     tags: [Maps]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *         example: coffee shop
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for location bias
 *         example: 25.0330
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for location bias
 *         example: 121.5654
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 5000)
 *         example: 5000
 *     responses:
 *       200:
 *         description: Places search results
 */
router.get(
  '/search',
  validate(placesSearchQuerySchema, 'query'),
  asyncHandler(mapsController.searchPlaces.bind(mapsController))
);

export default router;

