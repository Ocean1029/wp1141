// Maps controller - handles HTTP requests for Google Maps services
import type { Request, Response } from 'express';
import { mapsService } from '../services/maps.service';
import { HttpStatus } from '../utils/httpStatus';

export class MapsController {
  /**
   * GET /maps/geocode
   * Geocode an address to coordinates
   */
  async geocode(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const result = await mapsService.geocode(req.query as any);
    res.json(result);
  }

  /**
   * GET /maps/reverse-geocode
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const result = await mapsService.reverseGeocode(req.query as any);
    res.json(result);
  }

  /**
   * GET /maps/search
   * Search for places by keyword
   */
  async searchPlaces(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const result = await mapsService.searchPlaces(req.query as any);
    res.json(result);
  }

  /**
   * GET /maps/place-details
   * Get detailed information about a place by place_id
   */
  async getPlaceDetails(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const result = await mapsService.getPlaceDetails(req.query as any);
    res.json(result);
  }
}

// Singleton instance
export const mapsController = new MapsController();

