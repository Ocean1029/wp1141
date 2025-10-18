// Repository for Theme database operations
import prisma from '../../config/prisma';
import type { CreateThemeDto, UpdateThemeDto, ThemeQueryDto } from './theme.dto';

export class ThemeRepository {
  /**
   * Get all themes with optional filtering
   */
  async findAll(query: ThemeQueryDto) {
    const { search, colorId, includeSegments } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (colorId) {
      where.colorId = colorId;
    }

    return prisma.theme.findMany({
      where,
      include: {
        color: true,
        segments: includeSegments ? {
          include: {
            diary: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
          },
        } : false,
        _count: {
          select: {
            segments: true,
          },
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
      ],
    });
  }

  /**
   * Get a single theme by ID
   */
  async findById(id: string, includeSegments = true) {
    return prisma.theme.findUnique({
      where: { id },
      include: {
        color: true,
        segments: includeSegments ? {
          include: {
            diary: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        } : false,
        _count: {
          select: {
            segments: true,
          },
        },
      },
    });
  }

  /**
   * Create a new theme
   */
  async create(data: CreateThemeDto) {
    return prisma.theme.create({
      data,
      include: {
        color: true,
        _count: {
          select: {
            segments: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing theme
   */
  async update(id: string, data: UpdateThemeDto) {
    return prisma.theme.update({
      where: { id },
      data,
      include: {
        color: true,
        segments: {
          include: {
            diary: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            segments: true,
          },
        },
      },
    });
  }

  /**
   * Delete a theme
   */
  async delete(id: string) {
    return prisma.theme.delete({
      where: { id },
    });
  }

  /**
   * Check if theme exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.theme.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if theme name exists (for uniqueness validation)
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const count = await prisma.theme.count({ where });
    return count > 0;
  }
}

// Singleton instance
export const themeRepository = new ThemeRepository();

