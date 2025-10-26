// Event service - business logic for event/timeline management
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../types/errors';
import type { CreateEventDto, UpdateEventDto, EventQueryDto } from '../schemas/event.schema';

export class EventService {
  /**
   * Get all events for a user with optional time range filtering
   */
  async getAllEvents(userId: string, query: EventQueryDto) {
    const where: any = {
      createdBy: userId,
    };

    // Time range filter
    if (query.from || query.to) {
      where.AND = [];
      if (query.from) {
        where.AND.push({ endTime: { gte: new Date(query.from) } });
      }
      if (query.to) {
        where.AND.push({ startTime: { lte: new Date(query.to) } });
      }
    }

    // Filter by place
    if (query.placeId) {
      where.places = {
        some: {
          placeId: query.placeId,
        },
      };
    }

    return prisma.event.findMany({
      where,
      include: {
        places: {
          include: {
            place: {
              select: {
                id: true,
                title: true,
                lat: true,
                lng: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        places: {
          include: {
            place: {
              select: {
                id: true,
                title: true,
                lat: true,
                lng: true,
                address: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this event');
    }

    return event;
  }

  /**
   * Create a new event with optional place associations
   */
  async createEvent(data: CreateEventDto, userId: string) {
    // Verify all places exist and belong to user
    if (data.placeIds && data.placeIds.length > 0) {
      const places = await prisma.place.findMany({
        where: {
          id: { in: data.placeIds },
          createdBy: userId,
        },
      });

      if (places.length !== data.placeIds.length) {
        throw new NotFoundError('One or more places');
      }
    }

    return prisma.event.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        notes: data.notes,
        createdBy: userId,
        places: data.placeIds && data.placeIds.length > 0 ? {
          create: data.placeIds.map(placeId => ({
            place: {
              connect: { id: placeId },
            },
          })),
        } : undefined,
      },
      include: {
        places: {
          include: {
            place: {
              select: {
                id: true,
                title: true,
                lat: true,
                lng: true,
                address: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventDto, userId: string) {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this event');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        places: {
          include: {
            place: {
              select: {
                id: true,
                title: true,
                lat: true,
                lng: true,
                address: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string, userId: string) {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this event');
    }

    await prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Add a place to an event
   */
  async addPlaceToEvent(eventId: string, placeId: string, userId: string) {
    // Verify event belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this event');
    }

    // Verify place belongs to user
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    // Check if association already exists
    const existing = await prisma.eventPlace.findFirst({
      where: {
        eventId,
        placeId,
      },
    });

    if (existing) {
      return existing; // Already associated
    }

    // Create association
    return prisma.eventPlace.create({
      data: {
        eventId,
        placeId,
      },
    });
  }

  /**
   * Remove a place from an event
   */
  async removePlaceFromEvent(eventId: string, placeId: string, userId: string) {
    // Verify event belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this event');
    }

    // Find and delete the association
    const association = await prisma.eventPlace.findFirst({
      where: {
        eventId,
        placeId,
      },
    });

    if (!association) {
      throw new NotFoundError('Place association');
    }

    await prisma.eventPlace.delete({
      where: {
        id: association.id,
      },
    });
  }
}

// Singleton instance
export const eventService = new EventService();

