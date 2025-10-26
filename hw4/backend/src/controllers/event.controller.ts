// Event controller - handles HTTP requests for events
import type { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { HttpStatus } from '../utils/httpStatus';

export class EventController {
  /**
   * GET /api/events
   * Get all events for the current user
   */
  async getAllEvents(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const events = await eventService.getAllEvents((req as any).user.userId, req.query);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  }

  /**
   * GET /api/events/:id
   * Get event by ID
   */
  async getEventById(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const event = await eventService.getEventById(req.params.id, (req as any).user.userId);

    res.json({
      success: true,
      data: event,
    });
  }

  /**
   * POST /api/events
   * Create a new event
   */
  async createEvent(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const event = await eventService.createEvent(req.body, (req as any).user.userId);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  }

  /**
   * PATCH /api/events/:id
   * Update an event
   */
  async updateEvent(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const event = await eventService.updateEvent(req.params.id, req.body, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  }

  /**
   * DELETE /api/events/:id
   * Delete an event
   */
  async deleteEvent(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await eventService.deleteEvent(req.params.id, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  }

  /**
   * POST /api/events/:id/places/:placeId
   * Add a place to an event
   */
  async addPlaceToEvent(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await eventService.addPlaceToEvent(
      req.params.id,
      req.params.placeId,
      (req as any).user.userId
    );

    res.json({
      success: true,
      message: 'Place added to event successfully',
    });
  }

  /**
   * DELETE /api/events/:id/places/:placeId
   * Remove a place from an event
   */
  async removePlaceFromEvent(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await eventService.removePlaceFromEvent(
      req.params.id,
      req.params.placeId,
      (req as any).user.userId
    );

    res.json({
      success: true,
      message: 'Place removed from event successfully',
    });
  }
}

// Singleton instance
export const eventController = new EventController();

