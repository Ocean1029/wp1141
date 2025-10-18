// DTOs and validation schemas for Theme module
import { z } from 'zod';

// Validation schemas
export const createThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required').max(100, 'Theme name must be less than 100 characters'),
  description: z.string().optional().nullable(),
  colorId: z.number().int().positive().optional().nullable(),
});

export const updateThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required').max(100, 'Theme name must be less than 100 characters').optional(),
  description: z.string().optional().nullable(),
  colorId: z.number().int().positive().optional().nullable(),
});

export const themeQuerySchema = z.object({
  search: z.string().optional(),
  colorId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  includeSegments: z.string().transform(val => val === 'true').optional(),
});

// Type exports
export type CreateThemeDto = z.infer<typeof createThemeSchema>;
export type UpdateThemeDto = z.infer<typeof updateThemeSchema>;
export type ThemeQueryDto = z.infer<typeof themeQuerySchema>;

