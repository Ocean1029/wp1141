import { GameRepository } from "../repositories/game.repository";
import { Game, GameStatus, Role, Player } from "@prisma/client";
import { logger } from "@/lib/logger";

// Avalon Configuration (5-10 Players)
const GAME_CONFIG: Record<number, { quest: number[]; roles: Role[] }> = {
  5: {
    quest: [2, 3, 2, 3, 3],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
  },
  6: {
    quest: [2, 3, 4, 3, 4],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
  },
  7: {
    quest: [2, 3, 3, 4, 4],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION], 
  },
  8: {
    quest: [3, 4, 4, 5, 5],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
  },
  9: {
    quest: [3, 4, 4, 5, 5],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
  },
  10: {
    quest: [3, 4, 4, 5, 5],
    roles: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.MINION],
  },
};

const ROLE_INFO: Record<Role, { name: string; team: "GOOD" | "EVIL"; desc: string }> = {
  MERLIN: { name: "梅林", team: "GOOD", desc: "好人陣營的首領。你知道所有壞人是誰，但不能暴露身分。" },
  PERCIVAL: { name: "派西維爾", team: "GOOD", desc: "梅林的護衛。你會看到梅林和莫甘娜，但不知道誰是誰。" },
  SERVANT: { name: "亞瑟的忠臣", team: "GOOD", desc: "忠誠的好人。你不知道誰是隊友，只能靠推理。" },
  MORGANA: { name: "莫甘娜", team: "EVIL", desc: "壞人陣營。你會假扮成梅林欺騙派西維爾。" },
  ASSASSIN: { name: "刺客", team: "EVIL", desc: "壞人陣營。如果好人贏了，你可以刺殺梅林來逆轉。" },
  MINION: { name: "莫德雷德的爪牙", team: "EVIL", desc: "壞人陣營。你知道誰是隊友。" },
  OBERON: { name: "奧伯倫", team: "EVIL", desc: "壞人陣營。你不知道隊友是誰，隊友也不知道你是誰。" },
  MORDRED: { name: "莫德雷德", team: "EVIL", desc: "壞人首領。梅林看不到你。" },
};

export class GameService {
  // ... createGame, joinGame, toggleReady, startGame ...
  
  static async createGame(lineGroupId: string, hostUserId: string) {
    console.log(`[GameService] createGame called with lineGroupId: ${lineGroupId}, hostUserId: ${hostUserId}`);
    const activeGame = await GameRepository.findActiveGame(lineGroupId);
    console.log(`[GameService] findActiveGame result: ${activeGame ? `Found game ${activeGame.id}` : "No active game found"}`);
    if (activeGame) {
      console.log(`[GameService] Active game exists: ${activeGame.id}, lineGroupId: ${activeGame.lineGroupId}, status: ${activeGame.status}`);
      throw new Error("Group already has an active game");
    }
    const game = await GameRepository.create(lineGroupId, hostUserId);
    console.log(`[GameService] Game created: ${game.id}, lineGroupId: ${game.lineGroupId}`);
    return game;
  }

  static async joinGame(gameId: string, userId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== GameStatus.WAITING) throw new Error("Game has already started");
    if (game.players.length >= game.maxPlayers) throw new Error("Game is full");
    
    const isAlreadyJoined = game.players.some(p => p.user.lineId === userId);
    if (isAlreadyJoined) throw new Error("User already joined");

    const nextIndex = game.players.length;
    return GameRepository.addPlayer(gameId, userId, nextIndex);
  }

  static async toggleReady(gameId: string, userId: string) {
    return GameRepository.toggleReady(gameId, userId);
  }

  static async startGame(gameId: string, requestUserId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");

    const host = game.players.find(p => p.isHost);
    if (host?.user.lineId !== requestUserId) throw new Error("Only host can start the game");

    const count = game.players.length;
    if (count < 5 || count > 10) throw new Error(`Invalid player count: ${count}. Must be 5-10.`);

    const notReady = game.players.some(p => !p.isReady);
    if (notReady) throw new Error("Not all players are ready");

    const config = GAME_CONFIG[count];
    if (!config) throw new Error("Configuration not found for this player count");

    const shuffledRoles = this.shuffleArray([...config.roles]);
    const playerRoles = game.players.map((player, index) => ({
      playerId: player.id,
      role: shuffledRoles[index],
    }));

    await GameRepository.startGame(gameId, playerRoles, config.quest);
    return config;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static async getLobbyStatus(gameId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) return null;

    return {
      id: game.id,
      status: game.status,
      maxPlayers: game.maxPlayers,
      players: game.players.map(p => ({
        lineId: p.user.lineId,
        displayName: p.user.displayName,
        pictureUrl: p.user.pictureUrl,
        isHost: p.isHost,
        isReady: p.isReady,
      })),
      isStartable: game.players.length >= 5 && game.players.every(p => p.isReady),
    };
  }

  /**
   * Get player role info
   */
  static async getPlayerRoleInfo(gameId: string, userId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");
    
    // Find my player
    const me = game.players.find(p => p.user.lineId === userId);
    if (!me || !me.role) throw new Error("Player not found or role not assigned");

    const roleInfo = ROLE_INFO[me.role];
    let knownInfo: { displayName: string; pictureUrl: string | null; type: string }[] = [];

    // Logic for known info
    if (me.role === Role.MERLIN) {
      // Merlin sees all EVIL except MORDRED
      knownInfo = game.players
        .filter(p => {
            if (!p.role) return false;
            // Is Evil?
            const isEvil = [Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.OBERON].includes(p.role);
            // Exclude MORDRED if we had it
            return isEvil && p.user.lineId !== userId;
        })
        .map(p => ({
            displayName: p.user.displayName,
            pictureUrl: p.user.pictureUrl,
            type: "壞人"
        }));
    } else if (me.role === Role.PERCIVAL) {
      // Percival sees MERLIN and MORGANA as "Unknown"
      knownInfo = game.players
        .filter(p => [Role.MERLIN, Role.MORGANA].includes(p.role!))
        .map(p => ({
            displayName: p.user.displayName,
            pictureUrl: p.user.pictureUrl,
            type: "梅林或莫甘娜"
        }));
    } else if ([Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.MORDRED].includes(me.role)) {
      // Evil sees Evil (except OBERON)
      knownInfo = game.players
        .filter(p => {
            if (p.user.lineId === userId) return false;
            const isEvilTeammate = [Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.MORDRED].includes(p.role!);
            return isEvilTeammate;
        })
        .map(p => ({
            displayName: p.user.displayName,
            pictureUrl: p.user.pictureUrl,
            type: "壞人隊友"
        }));
    }

    return {
        role: me.role,
        roleName: roleInfo.name,
        roleTeam: roleInfo.team,
        roleDesc: roleInfo.desc,
        knownInfo
    };
  }
}
