// Data Transfer Objects and validation schemas for Diary module
import { z } from 'zod';

// DTO for creating a new diary
export const createDiarySchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1, 'Content is required'),
});

export type CreateDiaryDto = z.infer<typeof createDiarySchema>;

// DTO for updating a diary
export const updateDiarySchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1, 'Content is required').optional(),
});

export type UpdateDiaryDto = z.infer<typeof updateDiarySchema>;

// DTO for query parameters
export const diaryQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export type DiaryQueryDto = z.infer<typeof diaryQuerySchema>;

