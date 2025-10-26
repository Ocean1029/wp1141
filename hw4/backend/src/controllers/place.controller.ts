// Place controller - handles HTTP requests for places
import type { Request, Response } from 'express';
import { placeService } from '../services/place.service';
import { HttpStatus } from '../utils/httpStatus';

export class PlaceController {
  /**
   * GET /api/places
   * Get all places for the current user
   */
  async getAllPlaces(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const places = await placeService.getAllPlaces((req as any).user.userId, req.query);

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  }

  /**
   * GET /api/places/:id
   * Get place by ID
   */
  async getPlaceById(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const place = await placeService.getPlaceById(req.params.id, (req as any).user.userId);

    res.json({
      success: true,
      data: place,
    });
  }

  /**
   * POST /api/places
   * Create a new place
   */
  async createPlace(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const place = await placeService.createPlace(req.body, (req as any).user.userId);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Place created successfully',
      data: place,
    });
  }

  /**
   * PATCH /api/places/:id
   * Update a place
   */
  async updatePlace(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const place = await placeService.updatePlace(req.params.id, req.body, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Place updated successfully',
      data: place,
    });
  }

  /**
   * DELETE /api/places/:id
   * Delete a place
   */
  async deletePlace(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await placeService.deletePlace(req.params.id, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Place deleted successfully',
    });
  }

  /**
   * POST /api/places/:id/tags/:tagId
   * Add a tag to a place
   */
  async addTagToPlace(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await placeService.addTagToPlace(
      req.params.id,
      req.params.tagId,
      (req as any).user.userId
    );

    res.json({
      success: true,
      message: 'Tag added to place successfully',
    });
  }

  /**
   * DELETE /api/places/:id/tags/:tagId
   * Remove a tag from a place
   */
  async removeTagFromPlace(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await placeService.removeTagFromPlace(
      req.params.id,
      req.params.tagId,
      (req as any).user.userId
    );

    res.json({
      success: true,
      message: 'Tag removed from place successfully',
    });
  }
}

// Singleton instance
export const placeController = new PlaceController();

