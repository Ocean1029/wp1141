import { GameRepository } from "../repositories/game.repository";
import { LLMService } from "./llm.service";
import { LineService } from "./line.service";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { FlexMessageFactory } from "../utils/flex";

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

      // Type assertion: game includes players and rounds
      const gameWithDetails = game as typeof game & {
        currentRoundNumber: number | null;
        players: Array<{ index: number; user: { lineId: string; displayName: string } }>;
        rounds: Array<{ id: string; roundNumber: number; requiredPlayers: number; proposals?: Array<{ isApproved: boolean | null }> }>;
      };

      // Check if user is the current leader
      const currentLeaderIndex = game.currentLeaderIndex ?? 0;
      const leader = gameWithDetails.players.find(p => p.index === currentLeaderIndex);
      
      if (!leader || leader.user.lineId !== userId) {
        return { isProposal: false };
      }

      // Get current round using currentRoundNumber
      const currentRoundNumber = gameWithDetails.currentRoundNumber;
      if (!currentRoundNumber) {
        return { isProposal: false };
      }

      const rounds = gameWithDetails.rounds || [];
      const currentRound = rounds.find(r => r.roundNumber === currentRoundNumber);

      if (!currentRound) {
        // Round doesn't exist yet, create it
        // This should not happen normally, but handle it gracefully
        return { isProposal: false };
      }

      // Prepare player list for LLM
      const playersList = gameWithDetails.players
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
        gameWithDetails.players.length,
        playersList,
        currentLeaderIndex
      );

      if (!proposal || proposal.indices.length === 0) {
        return { isProposal: false };
      }

      // Validate proposal size matches required players
      const requiredPlayers = currentRound?.requiredPlayers || 0;
      if (!currentRound || proposal.indices.length !== requiredPlayers) {
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

      // Type assertion: game includes players and rounds
      const gameWithDetails = game as typeof game & {
        players: Array<{ id: string; index: number; user: { lineId: string; displayName: string } }>;
        rounds: Array<{ id: string; roundNumber: number; requiredPlayers: number }>;
      };

      const round = gameWithDetails.rounds.find(r => r.id === pending.roundId);
      if (!round) {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      // Find leader player
      const leader = gameWithDetails.players.find(p => p.user.lineId === userId);
      if (!leader) {
        pendingProposals.delete(userId);
        return { isConfirmation: true, success: false };
      }

      // Convert indices to player IDs
      const proposedPlayerIds = pending.playerIndices
        .map(idx => {
          const player = gameWithDetails.players.find(p => p.index === idx);
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

      // Get the created proposal
      const createdProposal = await prisma.teamProposal.findFirst({
        where: {
          roundId: pending.roundId,
          proposerId: leader.id,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (!createdProposal) {
        logger.error(`[TeamProposalService] Failed to find created proposal`);
        return { isConfirmation: true, success: false };
      }

      // Prepare team members list for voting card
      const teamMembers = gameWithDetails.players
        .filter(p => pending.playerIndices.includes(p.index))
        .map(p => ({
          index: p.index,
          displayName: p.user.displayName,
        }))
        .sort((a, b) => a.index - b.index);

      // Send confirmation to group
      const playerNumbers = pending.playerIndices.map(idx => idx + 1).join("、");
      await LineService.pushMessage(pending.groupId, [{
        type: "text",
        text: `✅ 隊長已確認出隊：${playerNumbers} 號\n現在開始投票階段！`,
      }]);

      // Send voting card to all players
      const votingCard = FlexMessageFactory.createVotingCard(
        createdProposal.id,
        round.roundNumber,
        leader.user.displayName,
        teamMembers,
        round.requiredPlayers
      );

      await LineService.pushMessage(pending.groupId, [{
        type: "flex",
        altText: "投票階段",
        contents: votingCard as any, // Type assertion to handle FlexContainer type mismatch
      }]);

      // Note: Mission cards will be sent after voting passes (handled in VoteService)

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

