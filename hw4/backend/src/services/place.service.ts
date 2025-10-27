// Place service - business logic for place management
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, InvariantViolationError } from '../types/errors';
import type { CreatePlaceDto, UpdatePlaceDto, PlaceQueryDto } from '../schemas/place.schema';

// Helper function to transform place with tags
function transformPlace(place: any) {
  return {
    ...place,
    tags: place.tags?.map((pt: any) => pt.tag) || [],
  };
}

export class PlaceService {
  /**
   * Get all places for a user with optional filtering
   */
  async getAllPlaces(userId: string, query: PlaceQueryDto) {
    const where: any = {
      createdBy: userId,
    };

    // Filter by tags if provided
    if (query.tagNames && query.tagNames.length > 0) {
      where.tags = {
        some: {
          tag: {
            createdBy: userId,
            name: {
              in: query.tagNames,
            },
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

    const places = await prisma.place.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: {
              select: {
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

    return places.map(transformPlace);
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
                createdBy: true,
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

    return transformPlace(place);
  }

  /**
   * Create a new place with tags
   * Enforces: at least one tag required
   */
  async createPlace(data: CreatePlaceDto, userId: string) {
    // Verify all tags exist and belong to user
    const tags = await prisma.tag.findMany({
      where: {
        createdBy: userId,
        name: { in: data.tags },
      },
    });

    if (tags.length !== data.tags.length) {
      throw new NotFoundError('One or more tags');
    }

    // Create place with tag associations
    const place = await prisma.place.create({
      data: {
        id: data.id, // Google Place ID
        title: data.title,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        notes: data.notes,
        createdBy: userId,
        tags: {
          create: data.tags.map(tagName => ({
            tag: {
              connect: {
                createdBy_name: {
                  createdBy: userId,
                  name: tagName,
                },
              },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return transformPlace(place);
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

    const updatedPlace = await prisma.place.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return transformPlace(updatedPlace);
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
  async addTagToPlace(placeId: string, tagName: string, userId: string) {
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
      where: {
        createdBy_name: {
          createdBy: userId,
          name: tagName,
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    // Check if association already exists
    const existing = await prisma.placeTag.findFirst({
      where: {
        placeId,
        tag: {
          createdBy: userId,
          name: tagName,
        },
      },
    });

    if (existing) {
      return existing; // Already associated
    }

    // Create association
    return prisma.placeTag.create({
      data: {
        place: {
          connect: { id: placeId },
        },
        tag: {
          connect: {
            createdBy_name: {
              createdBy: userId,
              name: tagName,
            },
          },
        },
      },
    });
  }

  /**
   * Remove a tag from a place
   * Validates invariant: place must have at least one tag
   */
  async removeTagFromPlace(placeId: string, tagName: string, userId: string) {
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
        tag: {
          createdBy: userId,
          name: tagName,
        },
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

