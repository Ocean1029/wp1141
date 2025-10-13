// Controller for handling Diary HTTP requests
import type { Request, Response } from 'express';
import { diaryService } from './diary.service';
import {
  createDiarySchema,
  updateDiarySchema,
  diaryQuerySchema,
} from './diary.dto';

export class DiaryController {
  /**
   * GET /api/diaries
   * Get all diaries with optional search
   */
  async getAllDiaries(req: Request, res: Response) {
    const query = diaryQuerySchema.parse(req.query);
    const diaries = await diaryService.getAllDiaries(query);

    res.json({
      success: true,
      count: diaries.length,
      data: diaries,
    });
  }

  /**
   * GET /api/diaries/:id
   * Get a single diary by ID
   */
  async getDiaryById(req: Request, res: Response) {
    const { id } = req.params;
    const diary = await diaryService.getDiaryById(id);

    res.json({
      success: true,
      data: diary,
    });
  }

  /**
   * POST /api/diaries
   * Create a new diary
   */
  async createDiary(req: Request, res: Response) {
    const data = createDiarySchema.parse(req.body);
    const diary = await diaryService.createDiary(data);

    res.status(201).json({
      success: true,
      message: 'Diary created successfully',
      data: diary,
    });
  }

  /**
   * PUT /api/diaries/:id
   * Update an existing diary
   */
  async updateDiary(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateDiarySchema.parse(req.body);
    const diary = await diaryService.updateDiary(id, data);

    res.json({
      success: true,
      message: 'Diary updated successfully',
      data: diary,
    });
  }

  /**
   * DELETE /api/diaries/:id
   * Delete a diary
   */
  async deleteDiary(req: Request, res: Response) {
    const { id } = req.params;
    await diaryService.deleteDiary(id);

    res.json({
      success: true,
      message: 'Diary deleted successfully',
    });
  }
}

// Singleton instance
export const diaryController = new DiaryController();

