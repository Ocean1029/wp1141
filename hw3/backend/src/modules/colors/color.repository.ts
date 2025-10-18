// Repository for Color database operations
import prisma from '../../config/prisma';
import type { CreateColorDto, UpdateColorDto, ColorQueryDto } from './color.dto';

export class ColorRepository {
  /**
   * Get all colors with optional search
   */
  async findAll(query: ColorQueryDto) {
    const { search } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { hexCode: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.color.findMany({
      where,
      include: {
        _count: {
          select: {
            themes: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get a single color by ID
   */
  async findById(id: number) {
    return prisma.color.findUnique({
      where: { id },
      include: {
        themes: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            themes: true,
          },
        },
      },
    });
  }

  /**
   * Create a new color
   */
  async create(data: CreateColorDto) {
    return prisma.color.create({
      data,
      include: {
        _count: {
          select: {
            themes: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing color
   */
  async update(id: number, data: UpdateColorDto) {
    return prisma.color.update({
      where: { id },
      data,
      include: {
        themes: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            themes: true,
          },
        },
      },
    });
  }

  /**
   * Delete a color
   */
  async delete(id: number) {
    return prisma.color.delete({
      where: { id },
    });
  }

  /**
   * Check if color exists by ID
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.color.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if hex code exists (for uniqueness validation)
   */
  async existsByHexCode(hexCode: string, excludeId?: number): Promise<boolean> {
    const where: any = { hexCode };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const count = await prisma.color.count({ where });
    return count > 0;
  }

  /**
   * Check if color name exists (for uniqueness validation)
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const count = await prisma.color.count({ where });
    return count > 0;
  }
}

// Singleton instance
export const colorRepository = new ColorRepository();

