// DTOs and validation schemas for Color module
import { z } from 'zod';

// Validation schemas
export const createColorSchema = z.object({
  hexCode: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code (e.g., #FF5733)')
    .length(7, 'Hex code must be 7 characters including #'),
  name: z.string()
    .min(1, 'Color name is required')
    .max(50, 'Color name must be less than 50 characters'),
  meaning: z.string().optional().nullable(),
});

export const updateColorSchema = z.object({
  hexCode: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code (e.g., #FF5733)')
    .length(7, 'Hex code must be 7 characters including #')
    .optional(),
  name: z.string()
    .min(1, 'Color name is required')
    .max(50, 'Color name must be less than 50 characters')
    .optional(),
  meaning: z.string().optional().nullable(),
});

export const colorQuerySchema = z.object({
  search: z.string().optional(),
});

// Type exports
export type CreateColorDto = z.infer<typeof createColorSchema>;
export type UpdateColorDto = z.infer<typeof updateColorSchema>;
export type ColorQueryDto = z.infer<typeof colorQuerySchema>;

