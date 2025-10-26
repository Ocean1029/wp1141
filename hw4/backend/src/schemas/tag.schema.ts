// Tag validation schemas
import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100, 'Tag name too long'),
  description: z.string().optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100, 'Tag name too long').optional(),
  description: z.string().optional().nullable(),
});

export const tagQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;
export type TagQueryDto = z.infer<typeof tagQuerySchema>;

