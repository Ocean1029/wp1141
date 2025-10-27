// Event validation schemas
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  startTime: z.string().datetime('Invalid start time format (ISO 8601 required)'),
  endTime: z.string().datetime('Invalid end time format (ISO 8601 required)'),
  notes: z.string().optional(),
  placeIds: z.array(z.string().min(1, 'Place ID is required')).optional().default([]),
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  { message: 'Start time must be before end time', path: ['startTime'] }
);

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  endTime: z.string().datetime('Invalid end time format').optional(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  },
  { message: 'Start time must be before end time', path: ['startTime'] }
);

export const eventQuerySchema = z.object({
  from: z.string().datetime('Invalid from date').optional(),
  to: z.string().datetime('Invalid to date').optional(),
  placeId: z.string().min(1, 'Place ID is required').optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type EventQueryDto = z.infer<typeof eventQuerySchema>;

