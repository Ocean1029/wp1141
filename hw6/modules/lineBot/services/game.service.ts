import { GameRepository } from "../repositories/game.repository";
import { Game, GameStatus, Role, Player } from "@prisma/client";
import { logger } from "@/lib/logger";

// Avalon Configuration (2-10 Players)
const GAME_CONFIG: Record<number, { quest: number[]; roles: Role[] }> = {
  2: {
    quest: [1, 1, 1, 1, 1],
    roles: [Role.MERLIN, Role.ASSASSIN],
  },
  3: {
    quest: [1, 2, 1, 2, 2],
    roles: [Role.MERLIN, Role.SERVANT, Role.ASSASSIN],
  },
  4: {
    quest: [2, 2, 2, 2, 2],
    roles: [Role.MERLIN, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
  },
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
  
  /**
   * Validate LINE Group ID format
   * LINE Group IDs should start with 'C' followed by 32 hexadecimal characters (33 chars total)
   */
  private static isValidLineGroupId(id: string): boolean {
    const lineGroupIdPattern = /^C[0-9a-fA-F]{32}$/;
    return lineGroupIdPattern.test(id);
  }
  
  static async createGame(lineGroupId: string, hostUserId: string) {
    console.log(`[GameService] createGame called with lineGroupId: ${lineGroupId}, hostUserId: ${hostUserId}`);
    
    // Validate LINE Group ID format
    if (!this.isValidLineGroupId(lineGroupId)) {
      const isUUID = lineGroupId.includes("-") && lineGroupId.length === 36;
      const errorMsg = isUUID
        ? `Invalid LINE Group ID: Received UUID format instead of LINE Group ID. Expected: C + 32 hex chars (33 total). Received: ${lineGroupId.substring(0, 20)}...`
        : `Invalid LINE Group ID format. Expected: C + 32 hex chars (33 total). Received: ${lineGroupId.substring(0, 20)}... (length: ${lineGroupId.length})`;
      
      console.error(`[GameService] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const activeGame = await GameRepository.findActiveGame(lineGroupId);
    console.log(`[GameService] findActiveGame result: ${activeGame ? `Found game ${activeGame.id}` : "No active game found"}`);
    if (activeGame) {
      console.log(`[GameService] Active game exists: ${activeGame.id}, lineGroupId: ${activeGame.lineGroupId}, status: ${activeGame.status}`);
      throw new Error("Group already has an active game");
    }
    
    // Use default config for 6 players if not specified
    const defaultMaxPlayers = 6;
    const defaultConfig = GAME_CONFIG[defaultMaxPlayers];
    if (!defaultConfig) {
      throw new Error(`Configuration not found for ${defaultMaxPlayers} players`);
    }
    const defaultRoles = defaultConfig.roles;
    const game = await GameRepository.create(lineGroupId, hostUserId, defaultMaxPlayers, defaultRoles);
    console.log(`[GameService] Game created: ${game.id}, lineGroupId: ${game.lineGroupId}, maxPlayers: ${defaultMaxPlayers}`);
    return game;
  }

  static async joinGame(gameId: string, userId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== GameStatus.WAITING) throw new Error("Game has already started");
    
    // Type assertion: maxPlayers exists in Game model
    const maxPlayers = (game as Game & { maxPlayers: number }).maxPlayers;
    if (game.players.length >= maxPlayers) throw new Error("Game is full");
    
    const isAlreadyJoined = game.players.some(p => p.user.lineId === userId);
    if (isAlreadyJoined) throw new Error("User already joined");

    const nextIndex = game.players.length;
    return GameRepository.addPlayer(gameId, userId, nextIndex);
  }

  static async toggleReady(gameId: string, userId: string): Promise<boolean> {
    return GameRepository.toggleReady(gameId, userId);
  }

  /**
   * Close/Abort game room
   * Only host can close the game
   */
  static async closeGame(gameId: string, requestUserId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");

    const host = game.players.find(p => p.isHost);
    if (host?.user.lineId !== requestUserId) {
      throw new Error("Only host can close the game");
    }

    // Update game status to ABORTED
    await GameRepository.updateStatus(gameId, GameStatus.ABORTED);
    
    logger.info(`[GameService] Game closed by host`, {
      gameId,
      hostUserId: requestUserId,
    });
  }

  /**
   * Update max players count
   * Only host can update, and maxPlayers must be between 2-10
   * Cannot set maxPlayers less than current player count
   */
  static async updateMaxPlayers(gameId: string, maxPlayers: number, requestUserId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");

    const host = game.players.find(p => p.isHost);
    if (host?.user.lineId !== requestUserId) {
      throw new Error("Only host can update max players");
    }

    // Validate maxPlayers range
    if (maxPlayers < 2 || maxPlayers > 10) {
      throw new Error("Max players must be between 2 and 10");
    }

    // Cannot set maxPlayers less than current player count
    const currentPlayerCount = game.players.length;
    if (maxPlayers < currentPlayerCount) {
      throw new Error(`Cannot set max players to ${maxPlayers}. There are already ${currentPlayerCount} players in the game.`);
    }

    // Update maxPlayers and activeRoles if not already set or if roles count doesn't match
    const currentRoles = game.activeRoles || [];
    const shouldUpdateRoles = currentRoles.length === 0 || currentRoles.length !== maxPlayers;
    const newRoles = shouldUpdateRoles ? (GAME_CONFIG[maxPlayers]?.roles || []) : currentRoles;

    await GameRepository.updateMaxPlayers(gameId, maxPlayers);
    if (shouldUpdateRoles) {
      await GameRepository.updateActiveRoles(gameId, newRoles);
    }
    
    logger.info(`[GameService] Max players updated`, {
      gameId,
      maxPlayers,
      updatedRoles: shouldUpdateRoles,
      hostUserId: requestUserId,
    });
  }

  /**
   * Update active roles configuration
   * Only host can update roles
   * Roles count must match maxPlayers
   */
  static async updateActiveRoles(gameId: string, activeRoles: Role[], requestUserId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");

    const host = game.players.find(p => p.isHost);
    if (host?.user.lineId !== requestUserId) {
      throw new Error("Only host can update roles");
    }

    // Get maxPlayers from game
    const gameWithMaxPlayers = game as Game & { maxPlayers: number };
    const maxPlayers = gameWithMaxPlayers.maxPlayers;

    // Validate roles count matches maxPlayers
    if (activeRoles.length !== maxPlayers) {
      throw new Error(`Role count (${activeRoles.length}) must match max players (${maxPlayers})`);
    }

    // Validate: Must have at least one MERLIN
    if (!activeRoles.includes(Role.MERLIN)) {
      throw new Error("Must have at least one MERLIN (good team leader)");
    }

    // Validate: Must have at least one ASSASSIN
    if (!activeRoles.includes(Role.ASSASSIN)) {
      throw new Error("Must have at least one ASSASSIN (evil team leader)");
    }

    await GameRepository.updateActiveRoles(gameId, activeRoles);
    
    logger.info(`[GameService] Active roles updated`, {
      gameId,
      activeRoles,
      hostUserId: requestUserId,
    });
  }

  static async startGame(gameId: string, requestUserId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new Error("Game not found");

    const host = game.players.find(p => p.isHost);
    if (host?.user.lineId !== requestUserId) throw new Error("Only host can start the game");

    const count = game.players.length;
    if (count < 2 || count > 10) throw new Error(`Invalid player count: ${count}. Must be 2-10.`);

    // Type assertion: isReady exists in Player model
    const playersWithReady = game.players as (Player & { user: any; isReady: boolean })[];
    const gameWithMaxPlayers = game as Game & { maxPlayers: number };
    
    // If player count equals maxPlayers, can start regardless of ready status
    // Otherwise, all players must be ready
    if (count !== gameWithMaxPlayers.maxPlayers) {
      const notReady = playersWithReady.some(p => !p.isReady);
      if (notReady) throw new Error("Not all players are ready");
    }

    // Use activeRoles if set, otherwise use default config
    const activeRoles = game.activeRoles && game.activeRoles.length > 0 
      ? game.activeRoles 
      : (GAME_CONFIG[count]?.roles || []);
    
    // Validate activeRoles count matches player count
    if (activeRoles.length !== count) {
      throw new Error(`Active roles count (${activeRoles.length}) does not match player count (${count}). Please update roles configuration.`);
    }

    const config = GAME_CONFIG[count];
    if (!config) throw new Error("Configuration not found for this player count");

    const shuffledRoles = this.shuffleArray([...activeRoles]);
    const playerRoles = game.players.map((player, index) => {
      const role = shuffledRoles[index];
      if (role === undefined) {
        throw new Error(`Not enough roles for player ${index}`);
      }
      return {
        playerId: player.id,
        role,
      };
    });

    await GameRepository.startGame(gameId, playerRoles, config.quest);
    return config;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      const itemJ = array[j];
      if (temp !== undefined && itemJ !== undefined) {
        array[i] = itemJ;
        array[j] = temp;
      }
    }
    return array;
  }

  static async getLobbyStatus(gameId: string) {
    const game = await GameRepository.findById(gameId);
    if (!game) return null;

    // Type assertions: maxPlayers and isReady exist in Game and Player models
    const gameWithMaxPlayers = game as Game & { maxPlayers: number };
    const playersWithReady = game.players as (Player & { user: any; isReady: boolean })[];

    // Game can start when player count equals maxPlayers
    const canStartByCount = playersWithReady.length === gameWithMaxPlayers.maxPlayers;
    // Or when all players are ready (for cases where not all slots are filled)
    const allReady = playersWithReady.length >= 2 && playersWithReady.every(p => p.isReady);
    
    return {
      id: game.id,
      status: game.status,
      maxPlayers: gameWithMaxPlayers.maxPlayers,
      activeRoles: game.activeRoles || [],
      players: playersWithReady.map(p => ({
        lineId: p.user.lineId,
        displayName: p.user.displayName,
        pictureUrl: p.user.pictureUrl,
        isHost: p.isHost,
        isReady: p.isReady,
      })),
      isStartable: canStartByCount || allReady,
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
            const isEvil = p.role === Role.MORGANA || p.role === Role.ASSASSIN || p.role === Role.MINION || p.role === Role.OBERON;
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
        .filter(p => p.role === Role.MERLIN || p.role === Role.MORGANA)
        .map(p => ({
            displayName: p.user.displayName,
            pictureUrl: p.user.pictureUrl,
            type: "梅林或莫甘娜"
        }));
    } else if (me.role === Role.MORGANA || me.role === Role.ASSASSIN || me.role === Role.MINION || me.role === Role.MORDRED) {
      // Evil sees Evil (except OBERON)
      knownInfo = game.players
        .filter(p => {
            if (p.user.lineId === userId) return false;
            const isEvilTeammate = p.role === Role.MORGANA || p.role === Role.ASSASSIN || p.role === Role.MINION || p.role === Role.MORDRED;
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
