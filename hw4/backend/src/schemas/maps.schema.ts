// Maps API validation schemas
import { z } from 'zod';

export const geocodeQuerySchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export const reverseGeocodeQuerySchema = z.object({
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
});

export const placesSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)).optional(),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)).optional(),
  radius: z.string().transform(Number).pipe(z.number().positive()).optional().default('5000'),
});

export type GeocodeQueryDto = z.infer<typeof geocodeQuerySchema>;
export type ReverseGeocodeQueryDto = z.infer<typeof reverseGeocodeQuerySchema>;
export type PlacesSearchQueryDto = z.infer<typeof placesSearchQuerySchema>;

