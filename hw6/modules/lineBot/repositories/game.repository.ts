import { prisma } from "@/lib/prisma";
import { Game, GameStatus, Player, Role, TeamProposal, Vote } from "@prisma/client";

export class GameRepository {
  /**
   * Find active game in a group
   */
  static async findActiveGame(lineGroupId: string): Promise<Game | null> {
    console.log(`[GameRepository] findActiveGame querying for lineGroupId: ${lineGroupId}`);
    const result = await prisma.game.findFirst({
      where: {
        lineGroupId,
        status: {
          in: [GameStatus.WAITING, GameStatus.PLAYING],
        },
      },
      include: {
        players: {
          include: {
            user: true,
          },
          orderBy: {
            index: "asc",
          },
        },
        rounds: true,
      },
    });
    console.log(`[GameRepository] findActiveGame result: ${result ? `Found game ${result.id} with lineGroupId ${result.lineGroupId}` : "null"}`);
    // Debug: Check if there are any games with similar IDs
    if (!result) {
      const allGames = await prisma.game.findMany({
        where: {
          status: {
            in: [GameStatus.WAITING, GameStatus.PLAYING],
          },
        },
        select: {
          id: true,
          lineGroupId: true,
          status: true,
        },
        take: 5,
      });
      console.log(`[GameRepository] Recent active games:`, allGames.map(g => ({ id: g.id, lineGroupId: g.lineGroupId, status: g.status })));
    }
    return result;
  }

  /**
   * Find game by ID with full details
   */
  static async findById(gameId: string) {
    return prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: true,
          },
          orderBy: {
            index: "asc",
          },
        },
        rounds: true,
      },
    });
  }

  /**
   * Create a new game
   */
  static async create(lineGroupId: string, hostUserId: string): Promise<Game> {
    // Transaction: Create Game -> Create Host Player
    return prisma.$transaction(async (tx) => {
      const game = await tx.game.create({
        data: {
          lineGroupId,
          status: GameStatus.WAITING,
          playerCount: 1,
          maxPlayers: 6, // Default
        },
      });

      await tx.player.create({
        data: {
          gameId: game.id,
          userId: (await tx.user.findUniqueOrThrow({ where: { lineId: hostUserId } })).id,
          index: 0,
          isHost: true,
          isReady: true, // Host is always ready
        },
      });

      return game;
    });
  }

  /**
   * Add a player to the game
   */
  static async addPlayer(gameId: string, userId: string, index: number): Promise<Player> {
    const user = await prisma.user.findUnique({ where: { lineId: userId } });
    if (!user) throw new Error("User not found");

    // Use transaction to safely increment playerCount
    return prisma.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: {
          gameId,
          userId: user.id,
          index,
          isHost: false,
        },
      });

      await tx.game.update({
        where: { id: gameId },
        data: { playerCount: { increment: 1 } },
      });

      return player;
    });
  }

  /**
   * Toggle player ready status
   */
  static async toggleReady(gameId: string, userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { lineId: userId } });
    if (!user) throw new Error("User not found");

    const player = await prisma.player.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId,
        },
      },
    });

    if (!player) throw new Error("Player not found in game");

    const updated = await prisma.player.update({
      where: { id: player.id },
      data: { isReady: !player.isReady },
    });

    return updated.isReady;
  }

  /**
   * Start Game: Assign roles and create first round
   */
  static async startGame(gameId: string, playerRoles: { playerId: string; role: Role }[], questConfig: number[]) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Game Status
      await tx.game.update({
        where: { id: gameId },
        data: {
          status: GameStatus.PLAYING,
          questConfig,
          currentLeaderIndex: Math.floor(Math.random() * playerRoles.length), // Random first leader
        },
      });

      // 2. Update Player Roles
      for (const p of playerRoles) {
        await tx.player.update({
          where: { id: p.playerId },
          data: { role: p.role },
        });
      }

      // 3. Create First Round
      await tx.round.create({
        data: {
          gameId,
          roundNumber: 1,
          requiredPlayers: questConfig[0],
        },
      });
    });
  }

  /**
   * Update game status
   */
  static async updateStatus(gameId: string, status: GameStatus): Promise<Game> {
    return prisma.game.update({
      where: { id: gameId },
      data: { status },
    });
  }
}
