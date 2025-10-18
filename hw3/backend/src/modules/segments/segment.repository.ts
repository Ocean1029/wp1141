// Repository for Segment database operations
import prisma from '../../config/prisma';
import type { CreateSegmentDto, UpdateSegmentDto, SegmentQueryDto, BulkCreateSegmentsDto } from './segment.dto';

export class SegmentRepository {
  /**
   * Get all segments with optional filtering
   */
  async findAll(query: SegmentQueryDto) {
    const { diaryId, themeId, includeRelations } = query;

    const where: any = {};

    if (diaryId) {
      where.diaryId = diaryId;
    }

    if (themeId !== undefined) {
      where.themeId = themeId || null;
    }

    return prisma.segment.findMany({
      where,
      include: includeRelations ? {
        diary: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        theme: {
          include: {
            color: true,
          },
        },
      } : undefined,
      orderBy: [
        { diaryId: 'desc' },
        { segmentOrder: 'asc' },
      ],
    });
  }

  /**
   * Get a single segment by ID
   */
  async findById(id: string) {
    return prisma.segment.findUnique({
      where: { id },
      include: {
        diary: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        theme: {
          include: {
            color: true,
          },
        },
      },
    });
  }

  /**
   * Get segments by diary ID
   */
  async findByDiaryId(diaryId: string) {
    return prisma.segment.findMany({
      where: { diaryId },
      include: {
        theme: {
          include: {
            color: true,
          },
        },
      },
      orderBy: {
        segmentOrder: 'asc',
      },
    });
  }

  /**
   * Get segments by theme ID
   */
  async findByThemeId(themeId: string) {
    return prisma.segment.findMany({
      where: { themeId },
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
    });
  }

  /**
   * Create a new segment
   */
  async create(data: CreateSegmentDto) {
    return prisma.segment.create({
      data,
      include: {
        diary: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        theme: {
          include: {
            color: true,
          },
        },
      },
    });
  }

  /**
   * Bulk create segments for a diary
   */
  async bulkCreate(data: BulkCreateSegmentsDto) {
    const segments = data.segments.map(segment => ({
      diaryId: data.diaryId,
      content: segment.content,
      themeId: segment.themeId || null,
      segmentOrder: segment.segmentOrder,
    }));

    // Use transaction to create all segments atomically
    return prisma.$transaction(
      segments.map(segment =>
        prisma.segment.create({
          data: segment,
          include: {
            theme: {
              include: {
                color: true,
              },
            },
          },
        })
      )
    );
  }

  /**
   * Update an existing segment
   */
  async update(id: string, data: UpdateSegmentDto) {
    return prisma.segment.update({
      where: { id },
      data,
      include: {
        diary: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        theme: {
          include: {
            color: true,
          },
        },
      },
    });
  }

  /**
   * Assign or unassign theme to a segment
   */
  async assignTheme(id: string, themeId: string | null) {
    return prisma.segment.update({
      where: { id },
      data: { themeId },
      include: {
        diary: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        theme: {
          include: {
            color: true,
          },
        },
      },
    });
  }

  /**
   * Delete a segment
   */
  async delete(id: string) {
    return prisma.segment.delete({
      where: { id },
    });
  }

  /**
   * Delete all segments for a diary
   */
  async deleteByDiaryId(diaryId: string) {
    return prisma.segment.deleteMany({
      where: { diaryId },
    });
  }

  /**
   * Check if segment exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.segment.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Count segments by diary ID
   */
  async countByDiaryId(diaryId: string): Promise<number> {
    return prisma.segment.count({
      where: { diaryId },
    });
  }

  /**
   * Count segments by theme ID
   */
  async countByThemeId(themeId: string): Promise<number> {
    return prisma.segment.count({
      where: { themeId },
    });
  }
}

// Singleton instance
export const segmentRepository = new SegmentRepository();

