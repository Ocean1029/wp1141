// Place service - business logic for place management
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, InvariantViolationError } from '../types/errors';
import type { CreatePlaceDto, UpdatePlaceDto, PlaceQueryDto } from '../schemas/place.schema';

export class PlaceService {
  /**
   * Get all places for a user with optional filtering
   */
  async getAllPlaces(userId: string, query: PlaceQueryDto) {
    const where: any = {
      createdBy: userId,
    };

    // Filter by tags if provided
    if (query.tagIds && query.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: query.tagIds,
          },
        },
      };
    }

    // Search filter
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.place.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get place by ID
   */
  async getPlaceById(id: string, userId: string) {
    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    return place;
  }

  /**
   * Create a new place with tags
   * Enforces: at least one tag required
   */
  async createPlace(data: CreatePlaceDto, userId: string) {
    // Verify all tags exist and belong to user
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: data.tags },
        createdBy: userId,
      },
    });

    if (tags.length !== data.tags.length) {
      throw new NotFoundError('One or more tags');
    }

    // Create place with tag associations
    return prisma.place.create({
      data: {
        title: data.title,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        notes: data.notes,
        createdBy: userId,
        tags: {
          create: data.tags.map(tagId => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update a place
   */
  async updatePlace(id: string, data: UpdatePlaceDto, userId: string) {
    // Check if place exists and belongs to user
    const place = await prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    return prisma.place.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete a place
   */
  async deletePlace(id: string, userId: string) {
    // Check if place exists and belongs to user
    const place = await prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    // Delete place (cascade will remove PlaceTag and EventPlace associations)
    await prisma.place.delete({
      where: { id },
    });
  }

  /**
   * Add a tag to a place
   */
  async addTagToPlace(placeId: string, tagId: string, userId: string) {
    // Verify place exists and belongs to user
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    // Verify tag exists and belongs to user
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    if (tag.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this tag');
    }

    // Check if association already exists
    const existing = await prisma.placeTag.findFirst({
      where: {
        placeId,
        tagId,
      },
    });

    if (existing) {
      return existing; // Already associated
    }

    // Create association
    return prisma.placeTag.create({
      data: {
        placeId,
        tagId,
      },
    });
  }

  /**
   * Remove a tag from a place
   * Validates invariant: place must have at least one tag
   */
  async removeTagFromPlace(placeId: string, tagId: string, userId: string) {
    // Verify place exists and belongs to user
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundError('Place');
    }

    if (place.createdBy !== userId) {
      throw new ForbiddenError('You do not have access to this place');
    }

    // Check invariant: must have at least one tag after removal
    if (place._count.tags <= 1) {
      throw new InvariantViolationError(
        'Cannot remove tag: place must have at least one tag. ' +
        'Please add another tag before removing this one.'
      );
    }

    // Find and delete the association
    const association = await prisma.placeTag.findFirst({
      where: {
        placeId,
        tagId,
      },
    });

    if (!association) {
      throw new NotFoundError('Tag association');
    }

    await prisma.placeTag.delete({
      where: {
        id: association.id,
      },
    });
  }
}

// Singleton instance
export const placeService = new PlaceService();

