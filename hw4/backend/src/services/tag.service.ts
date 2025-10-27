// Tag service - business logic for tag management
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ConflictError, InvariantViolationError } from '../types/errors';
import type { CreateTagDto, UpdateTagDto, TagQueryDto } from '../schemas/tag.schema';

export class TagService {
  /**
   * Get all tags for a user
   */
  async getAllTags(userId: string, query: TagQueryDto) {
    const where: any = {
      createdBy: userId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            places: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get tag by name
   */
  async getTagByName(name: string, userId: string) {
    const tag = await prisma.tag.findUnique({
      where: {
        createdBy_name: {
          createdBy: userId,
          name,
        },
      },
      include: {
        _count: {
          select: {
            places: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    return tag;
  }

  /**
   * Create a new tag
   */
  async createTag(data: CreateTagDto, userId: string) {
    // Check if tag with same name already exists for this user
    const existing = await prisma.tag.findUnique({
      where: {
        createdBy_name: {
          createdBy: userId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new ConflictError('A tag with this name already exists');
    }

    return prisma.tag.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: userId,
      },
      include: {
        _count: {
          select: {
            places: true,
          },
        },
      },
    });
  }

  /**
   * Update a tag
   */
  async updateTag(name: string, data: UpdateTagDto, userId: string) {
    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findUnique({
      where: {
        createdBy_name: {
          createdBy: userId,
          name,
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    // If updating name, check for conflicts with new name
    if (data.name && data.name !== tag.name) {
      const existing = await prisma.tag.findUnique({
        where: {
          createdBy_name: {
            createdBy: userId,
            name: data.name,
          },
        },
      });

      if (existing) {
        throw new ConflictError('A tag with this name already exists');
      }
    }

    return prisma.tag.update({
      where: {
        createdBy_name: {
          createdBy: userId,
          name,
        },
      },
      data,
      include: {
        _count: {
          select: {
            places: true,
          },
        },
      },
    });
  }

  /**
   * Delete a tag
   * Validates that no places will be left without tags
   */
  async deleteTag(name: string, userId: string) {
    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findUnique({
      where: {
        createdBy_name: {
          createdBy: userId,
          name,
        },
      },
      include: {
        places: {
          include: {
            place: {
              include: {
                _count: {
                  select: {
                    tags: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    // Check invariant: no place should be left without tags
    const placesWithOnlyThisTag = tag.places.filter(
      (pt) => pt.place._count.tags === 1
    );

    if (placesWithOnlyThisTag.length > 0) {
      throw new InvariantViolationError(
        `Cannot delete tag: ${placesWithOnlyThisTag.length} place(s) would be left without any tags. ` +
        `Please assign other tags to these places first, or delete the places.`
      );
    }

    // Delete tag (cascade will remove PlaceTag associations)
    await prisma.tag.delete({
      where: {
        createdBy_name: {
          createdBy: userId,
          name,
        },
      },
    });
  }
}

// Singleton instance
export const tagService = new TagService();

