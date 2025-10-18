// Routes for Segment module
import { Router } from 'express';
import { segmentController } from './segment.controller';
import { asyncHandler } from '../../shared/middleware/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/segments:
 *   get:
 *     summary: Get all segments
 *     tags: [Segments]
 *     parameters:
 *       - in: query
 *         name: diaryId
 *         schema:
 *           type: string
 *         description: Filter by diary ID
 *       - in: query
 *         name: themeId
 *         schema:
 *           type: string
 *         description: Filter by theme ID
 *       - in: query
 *         name: includeRelations
 *         schema:
 *           type: boolean
 *         description: Include diary and theme relations
 *     responses:
 *       200:
 *         description: List of segments
 */
router.get('/', asyncHandler(segmentController.getAllSegments.bind(segmentController)));

/**
 * @swagger
 * /api/segments/diary/{diaryId}:
 *   get:
 *     summary: Get all segments for a diary
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID
 *     responses:
 *       200:
 *         description: List of segments for the diary
 */
router.get('/diary/:diaryId', asyncHandler(segmentController.getSegmentsByDiaryId.bind(segmentController)));

/**
 * @swagger
 * /api/segments/diary/{diaryId}:
 *   delete:
 *     summary: Delete all segments for a diary
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: diaryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary ID
 *     responses:
 *       200:
 *         description: Segments deleted successfully
 */
router.delete('/diary/:diaryId', asyncHandler(segmentController.deleteSegmentsByDiaryId.bind(segmentController)));

/**
 * @swagger
 * /api/segments/theme/{themeId}:
 *   get:
 *     summary: Get all segments for a theme
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: themeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: List of segments for the theme
 */
router.get('/theme/:themeId', asyncHandler(segmentController.getSegmentsByThemeId.bind(segmentController)));

/**
 * @swagger
 * /api/segments/bulk:
 *   post:
 *     summary: Bulk create segments for a diary
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - diaryId
 *               - segments
 *             properties:
 *               diaryId:
 *                 type: string
 *               segments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - content
 *                     - segmentOrder
 *                   properties:
 *                     content:
 *                       type: string
 *                     themeId:
 *                       type: string
 *                     segmentOrder:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Segments created successfully
 */
router.post('/bulk', asyncHandler(segmentController.bulkCreateSegments.bind(segmentController)));

/**
 * @swagger
 * /api/segments/{id}:
 *   get:
 *     summary: Get a segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
 *       404:
 *         description: Segment not found
 */
router.get('/:id', asyncHandler(segmentController.getSegmentById.bind(segmentController)));

/**
 * @swagger
 * /api/segments:
 *   post:
 *     summary: Create a new segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - diaryId
 *               - content
 *               - segmentOrder
 *             properties:
 *               diaryId:
 *                 type: string
 *               themeId:
 *                 type: string
 *               content:
 *                 type: string
 *               segmentOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Segment created successfully
 */
router.post('/', asyncHandler(segmentController.createSegment.bind(segmentController)));

/**
 * @swagger
 * /api/segments/{id}:
 *   put:
 *     summary: Update a segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               themeId:
 *                 type: string
 *               content:
 *                 type: string
 *               segmentOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Segment updated successfully
 *       404:
 *         description: Segment not found
 */
router.put('/:id', asyncHandler(segmentController.updateSegment.bind(segmentController)));

/**
 * @swagger
 * /api/segments/{id}/theme:
 *   patch:
 *     summary: Assign or unassign theme to a segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - themeId
 *             properties:
 *               themeId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Theme assigned/unassigned successfully
 *       404:
 *         description: Segment not found
 */
router.patch('/:id/theme', asyncHandler(segmentController.assignTheme.bind(segmentController)));

/**
 * @swagger
 * /api/segments/{id}:
 *   delete:
 *     summary: Delete a segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment deleted successfully
 *       404:
 *         description: Segment not found
 */
router.delete('/:id', asyncHandler(segmentController.deleteSegment.bind(segmentController)));

export default router;

