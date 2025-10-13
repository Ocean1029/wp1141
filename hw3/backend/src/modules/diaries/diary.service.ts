// Business logic for Diary operations
import type { Diary } from '@prisma/client';
import { diaryRepository } from './diary.repository';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import type { CreateDiaryDto, UpdateDiaryDto, DiaryQueryDto } from './diary.dto';

export class DiaryService {
  /**
   * Get all diaries with optional search
   */
  async getAllDiaries(query: DiaryQueryDto): Promise<Diary[]> {
    return diaryRepository.findAll({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  }

  /**
   * Get diary by ID
   */
  async getDiaryById(id: string): Promise<Diary> {
    const diary = await diaryRepository.findById(id);
    
    if (!diary) {
      throw new NotFoundError('Diary');
    }
    
    return diary;
  }

  /**
   * Get diary by ID with segments
   */
  async getDiaryWithSegments(id: string) {
    const diary = await diaryRepository.findByIdWithSegments(id);
    
    if (!diary) {
      throw new NotFoundError('Diary');
    }
    
    return diary;
  }

  /**
   * Create a new diary
   */
  async createDiary(data: CreateDiaryDto): Promise<Diary> {
    return diaryRepository.create({
      title: data.title ?? null,
      content: data.content,
    });
  }

  /**
   * Update an existing diary
   */
  async updateDiary(id: string, data: UpdateDiaryDto): Promise<Diary> {
    // Check if diary exists
    const exists = await diaryRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('Diary');
    }

    // Validate at least one field is provided
    if (!data.title && !data.content) {
      throw new ValidationError('No fields to update');
    }

    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title || null;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    return diaryRepository.update(id, updateData);
  }

  /**
   * Delete a diary
   */
  async deleteDiary(id: string): Promise<void> {
    const exists = await diaryRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('Diary');
    }

    await diaryRepository.delete(id);
  }
}

// Singleton instance
export const diaryService = new DiaryService();

