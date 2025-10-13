// Routes for Diary module
import { Router } from 'express';
import { diaryController } from './diary.controller';
import { asyncHandler } from '../../shared/middleware/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/diaries:
 *   get:
 *     summary: Get all diaries
 *     description: Retrieve all diary entries with optional search filtering
 *     tags: [Diaries]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword to filter diaries by title or content
 *         example: motivation
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of results to skip (pagination)
 *     responses:
 *       200:
 *         description: List of diaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diary'
 */
router.get('/', asyncHandler(diaryController.getAllDiaries.bind(diaryController)));

/**
 * @swagger
 * /api/diaries/{id}:
 *   get:
 *     summary: Get diary by ID
 *     description: Retrieve a single diary entry by its unique identifier
 *     tags: [Diaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diary UUID
 *     responses:
 *       200:
 *         description: Diary details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', asyncHandler(diaryController.getDiaryById.bind(diaryController)));

/**
 * @swagger
 * /api/diaries:
 *   post:
 *     summary: Create new diary
 *     description: Create a new diary entry with optional title and required content
 *     tags: [Diaries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiaryRequest'
 *           examples:
 *             basic:
 *               summary: Basic diary entry
 *               value:
 *                 content: "Today was a productive day. I finished all my tasks."
 *             withTitle:
 *               summary: Diary with title
 *               value:
 *                 title: "A Productive Monday"
 *                 content: "Today I managed to complete all my planned tasks..."
 *     responses:
 *       201:
 *         description: Diary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Diary created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', asyncHandler(diaryController.createDiary.bind(diaryController)));

/**
 * @swagger
 * /api/diaries/{id}:
 *   put:
 *     summary: Update diary
 *     description: Update an existing diary entry's title and/or content
 *     tags: [Diaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diary UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDiaryRequest'
 *     responses:
 *       200:
 *         description: Diary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Diary updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Diary'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.put('/:id', asyncHandler(diaryController.updateDiary.bind(diaryController)));

/**
 * @swagger
 * /api/diaries/{id}:
 *   delete:
 *     summary: Delete diary
 *     description: Delete a diary entry and all associated segments (cascade)
 *     tags: [Diaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Diary UUID
 *     responses:
 *       200:
 *         description: Diary deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Diary deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', asyncHandler(diaryController.deleteDiary.bind(diaryController)));

export default router;

