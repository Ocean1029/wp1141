// Place validation schemas
import { z } from 'zod';

export const createPlaceSchema = z.object({
  id: z.string().min(1, 'Place ID is required'), // Google Place ID
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string().uuid('Invalid tag ID')).min(1, 'At least one tag is required'),
});

export const updatePlaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const placeQuerySchema = z.object({
  search: z.string().optional(),
  tagIds: z.union([
    z.string().uuid(),
    z.array(z.string().uuid())
  ]).optional().transform(val => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }),
});

export const addTagToPlaceSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
});

export type CreatePlaceDto = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceDto = z.infer<typeof updatePlaceSchema>;
export type PlaceQueryDto = z.infer<typeof placeQuerySchema>;
export type AddTagToPlaceDto = z.infer<typeof addTagToPlaceSchema>;

