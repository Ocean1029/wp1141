import { GameRepository } from "../repositories/game.repository";
import { LLMService } from "./llm.service";
import { LineService } from "./line.service";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// Store pending team proposals waiting for confirmation
// Key: userId, Value: { gameId, roundId, playerIndices }
const pendingProposals = new Map<string, {
  gameId: string;
  roundId: string;
  playerIndices: number[];
  groupId: string;
}>();

export class TeamProposalService {
  /**
   * Handle team proposal command from leader
   */
  static async handleProposalCommand(
    userId: string,
    groupId: string,
    message: string
  ): Promise<{ isProposal: boolean; confirmationMessage?: string }> {
    try {
      // Find active game
      const game = await GameRepository.findActiveGame(groupId);
      if (!game || game.status !== "PLAYING") {
        return { isProposal: false };
      }

      // Check if user is the current leader
      const currentLeaderIndex = game.currentLeaderIndex ?? 0;
      const leader = game.players.find(p => p.index === currentLeaderIndex);
      
      if (!leader || leader.user.lineId !== userId) {
        return { isProposal: false };
      }

      // Get current round
      const rounds = game.rounds || [];
      const currentRound = rounds.find(r => {
        const proposals = r.proposals || [];
        // Find round that doesn't have an approved proposal yet
        return !proposals.some((p: any) => p.isApproved === true);
      });

      if (!currentRound) {
        return { isProposal: false };
      }

      // Prepare player list for LLM
      const playersList = game.players
        .map(p => ({
          index: p.index,
          displayName: p.user.displayName
        }))
        .sort((a, b) => a.index - b.index);

      // Clear any existing pending proposal for this user
      if (pendingProposals.has(userId)) {
        pendingProposals.delete(userId);
      }

      // Parse team proposal using LLM
      const proposal = await LLMService.parseTeamProposal(
        message,
        game.players.length,
        playersList,
        currentLeaderIndex
      );

      if (!proposal || proposal.indices.length === 0) {
        return { isProposal: false };
      }

      // Validate proposal size matches required players
      const requiredPlayers = currentRound.requiredPlayers;
      if (proposal.indices.length !== requiredPlayers) {
        const confirmationMessage = `你選擇了 ${proposal.indices.length} 人，但本輪任務需要 ${requiredPlayers} 人。請重新選擇。`;
        return { isProposal: true, confirmationMessage };
      }

      // Store pending proposal
      pendingProposals.set(userId, {
        gameId: game.id,
        roundId: currentRound.id,
        playerIndices: proposal.indices,
        groupId,
      });

      // Create confirmation message with player numbers
      const playerNumbers = proposal.indices.map(idx => idx + 1).join("、");
      const confirmationMessage = `確認出隊：${playerNumbers} 號\n請回覆「是」或「確認」來確認，或重新提出隊伍。`;

      return { isProposal: true, confirmationMessage };
    } catch (error) {
      logger.error("Error in handleProposalCommand:", {}, error instanceof Error ? error : new Error(String(error)));
      return { isProposal: false };
    }
  }

  /**
   * Handle confirmation from leader
   */
  static async handleConfirmation(
    userId: string,
    groupId: string,
    message: string
  ): Promise<{ isConfirmation: boolean; success?: boolean }> {
    try {
      const pending = pendingProposals.get(userId);
      if (!pending) {
        return { isConfirmation: false };
      }

      // Check if message is a confirmation
      const isConfirm = await LLMService.isConfirmation(message);
      if (!isConfirm) {
        return { isConfirmation: false };
      }

      // Get game and round to validate
      const game = await GameRepository.findById(pending.gameId);
      if (!game || game.status !== "PLAYING") {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      const round = game.rounds.find(r => r.id === pending.roundId);
      if (!round) {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      // Find leader player
      const leader = game.players.find(p => p.user.lineId === userId);
      if (!leader) {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      // Convert indices to player IDs
      const proposedPlayerIds = pending.playerIndices
        .map(idx => {
          const player = game.players.find(p => p.index === idx);
          return player?.id;
        })
        .filter((id): id is string => !!id);

      if (proposedPlayerIds.length !== pending.playerIndices.length) {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      // Create team proposal
      await prisma.teamProposal.create({
        data: {
          roundId: pending.roundId,
          proposerId: leader.id,
          proposedTeam: proposedPlayerIds,
        },
      });

      // Clear pending proposal
      pendingProposals.delete(userId);

      // Send confirmation to group
      const playerNumbers = pending.playerIndices.map(idx => idx + 1).join("、");
      await LineService.pushMessage(pending.groupId, [{
        type: "text",
        text: `✅ 隊長已確認出隊：${playerNumbers} 號\n現在開始投票階段！`,
      }]);

      return { isConfirmation: true, success: true };
    } catch (error) {
      logger.error("Error in handleConfirmation:", {}, error instanceof Error ? error : new Error(String(error)));
      return { isConfirmation: false };
    }
  }

  /**
   * Clear pending proposal for a user (e.g., if they send a new proposal)
   */
  static clearPendingProposal(userId: string) {
    pendingProposals.delete(userId);
  }
}

