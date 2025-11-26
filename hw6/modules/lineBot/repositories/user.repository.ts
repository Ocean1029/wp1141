import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  /**
   * Find a user by their LINE ID
   */
  static async findByLineId(lineId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { lineId },
    });
  }

  /**
   * Create or update a user
   */
  static async upsert(lineId: string, displayName: string, pictureUrl?: string): Promise<User> {
    return prisma.user.upsert({
      where: { lineId },
      update: {
        displayName,
        pictureUrl,
        updatedAt: new Date(),
      },
      create: {
        lineId,
        displayName,
        pictureUrl,
      },
    });
  }

  /**
   * Update user stats (game played/won)
   */
  static async incrementStats(lineId: string, won: boolean = false): Promise<User> {
    return prisma.user.update({
      where: { lineId },
      data: {
        totalGames: { increment: 1 },
        wonGames: won ? { increment: 1 } : undefined,
      },
    });
  }

  /**
   * Update user learning status
   */
  static async setLearningStatus(lineId: string, isLearning: boolean): Promise<User> {
    return prisma.user.update({
      where: { lineId },
      data: { isLearningRules: isLearning },
    });
  }
}

