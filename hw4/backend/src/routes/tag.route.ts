// Tag routes
import { Router } from 'express';
import { tagController } from '../controllers/tag.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authGuard } from '../middlewares/auth.middleware';
import { createTagSchema, updateTagSchema, tagQuerySchema } from '../schemas/tag.schema';

const router = Router();

// All tag routes require authentication
router.use(authGuard);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags for current user
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tags by name or description
 *     responses:
 *       200:
 *         description: List of tags
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validate(tagQuerySchema, 'query'),
  asyncHandler(tagController.getAllTags.bind(tagController))
);

/**
 * @swagger
 * /api/tags/{name}:
 *   get:
 *     summary: Get tag by name
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: Sights
 *         description: Tag name
 *     responses:
 *       200:
 *         description: Tag details
 *       404:
 *         description: Tag not found
 */
router.get('/:name', asyncHandler(tagController.getTagByName.bind(tagController)));

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
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
 *                 example: Accommodation
 *               description:
 *                 type: string
 *                 example: Hotels and accommodations
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       409:
 *         description: Tag name already exists
 */
router.post(
  '/',
  validate(createTagSchema, 'body'),
  asyncHandler(tagController.createTag.bind(tagController))
);

/**
 * @swagger
 * /api/tags/{name}:
 *   patch:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: Sights
 *         description: Tag name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sights
 *               description:
 *                 type: string
 *                 example: Sightseeing spots
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       404:
 *         description: Tag not found
 */
router.patch(
  '/:name',
  validate(updateTagSchema, 'body'),
  asyncHandler(tagController.updateTag.bind(tagController))
);

/**
 * @swagger
 * /api/tags/{name}:
 *   delete:
 *     summary: Delete a tag
 *     description: Deletes a tag. Will fail if any places would be left without tags.
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag name
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       422:
 *         description: Cannot delete - places would be left without tags
 */
router.delete('/:name', asyncHandler(tagController.deleteTag.bind(tagController)));

export default router;

