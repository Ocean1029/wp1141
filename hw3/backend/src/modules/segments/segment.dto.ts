// DTOs and validation schemas for Segment module
import { z } from 'zod';

// Validation schemas
export const createSegmentSchema = z.object({
  diaryId: z.string().uuid('Invalid diary ID'),
  themeId: z.string().uuid('Invalid theme ID').optional().nullable(),
  content: z.string().min(1, 'Segment content is required'),
  segmentOrder: z.number().int().min(0, 'Segment order must be a non-negative integer'),
});

export const updateSegmentSchema = z.object({
  themeId: z.string().uuid('Invalid theme ID').optional().nullable(),
  content: z.string().min(1, 'Segment content is required').optional(),
  segmentOrder: z.number().int().min(0, 'Segment order must be a non-negative integer').optional(),
});

export const segmentQuerySchema = z.object({
  diaryId: z.string().uuid('Invalid diary ID').optional(),
  themeId: z.string().uuid('Invalid theme ID').optional(),
  includeRelations: z.string().transform(val => val === 'true').optional(),
});

export const bulkCreateSegmentsSchema = z.object({
  diaryId: z.string().uuid('Invalid diary ID'),
  segments: z.array(z.object({
    content: z.string().min(1, 'Segment content is required'),
    themeId: z.string().uuid('Invalid theme ID').optional().nullable(),
    segmentOrder: z.number().int().min(0, 'Segment order must be a non-negative integer'),
  })).min(1, 'At least one segment is required'),
});

export const assignThemeSchema = z.object({
  themeId: z.string().uuid('Invalid theme ID').nullable(),
});

// Type exports
export type CreateSegmentDto = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentDto = z.infer<typeof updateSegmentSchema>;
export type SegmentQueryDto = z.infer<typeof segmentQuerySchema>;
export type BulkCreateSegmentsDto = z.infer<typeof bulkCreateSegmentsSchema>;
export type AssignThemeDto = z.infer<typeof assignThemeSchema>;

