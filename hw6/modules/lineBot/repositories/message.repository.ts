import { prisma } from "@/lib/prisma";
import { Message, MessageSender } from "@prisma/client";

export class MessageRepository {
  /**
   * Create a new message log
   */
  static async create(data: {
    lineUserId?: string;
    gameId?: string;
    sender: MessageSender;
    content: string;
    tokens?: number;
  }): Promise<Message> {
    return prisma.message.create({
      data: {
        lineUserId: data.lineUserId,
        gameId: data.gameId,
        sender: data.sender,
        content: data.content,
        tokens: data.tokens,
      },
    });
  }

  /**
   * Get recent messages for a user (Context for LLM)
   */
  static async findRecentByUserId(lineUserId: string, limit: number = 10): Promise<Message[]> {
    return prisma.message.findMany({
      where: { lineUserId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get recent messages for a game
   */
  static async findRecentByGameId(gameId: string, limit: number = 20): Promise<Message[]> {
    return prisma.message.findMany({
      where: { gameId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });
  }
}

