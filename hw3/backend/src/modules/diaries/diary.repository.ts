// Repository pattern for Diary data access
import type { Diary, Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

export class DiaryRepository {
  /**
   * Find all diaries with optional filtering
   */
  async findAll(options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Diary[]> {
    const where: Prisma.DiaryWhereInput = options?.search
      ? {
          OR: [
            { title: { contains: options.search, mode: 'insensitive' } },
            { content: { contains: options.search, mode: 'insensitive' } },
          ],
        }
      : {};

    return prisma.diary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });
  }

  /**
   * Find diary by ID
   */
  async findById(id: string): Promise<Diary | null> {
    return prisma.diary.findUnique({
      where: { id },
    });
  }

  /**
   * Find diary by ID with segments
   */
  async findByIdWithSegments(id: string) {
    return prisma.diary.findUnique({
      where: { id },
      include: {
        segments: {
          include: {
            theme: {
              include: {
                color: true,
              },
            },
          },
          orderBy: { segmentOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new diary
   */
  async create(data: Prisma.DiaryCreateInput): Promise<Diary> {
    return prisma.diary.create({
      data,
    });
  }

  /**
   * Update diary by ID
   */
  async update(id: string, data: Prisma.DiaryUpdateInput): Promise<Diary> {
    return prisma.diary.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete diary by ID (cascade deletes segments)
   */
  async delete(id: string): Promise<Diary> {
    return prisma.diary.delete({
      where: { id },
    });
  }

  /**
   * Check if diary exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.diary.count({
      where: { id },
    });
    return count > 0;
  }
}

// Singleton instance
export const diaryRepository = new DiaryRepository();

