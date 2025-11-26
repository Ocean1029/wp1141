import { GameRepository } from "../repositories/game.repository";
import { LineService } from "./line.service";
import { FlexMessageFactory } from "../utils/flex";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { TeamVote } from "@prisma/client";

export class VoteService {
  /**
   * Handle vote submission
   */
  static async handleVote(
    proposalId: string,
    userId: string,
    groupId: string,
    decision: TeamVote
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Find proposal
      const proposal = await prisma.teamProposal.findUnique({
        where: { id: proposalId },
        include: {
          round: {
            include: {
              game: {
                include: {
                  players: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!proposal) {
        return { success: false, message: "找不到提議" };
      }

      const game = proposal.round.game;
      if (game.status !== "PLAYING") {
        return { success: false, message: "遊戲未進行中" };
      }

      // Check if proposal already has result
      if (proposal.isApproved !== null) {
        return { success: false, message: "投票已結束" };
      }

      // Find player
      const player = game.players.find(p => p.user.lineId === userId);
      if (!player) {
        return { success: false, message: "找不到玩家" };
      }

      // Check if already voted
      const existingVote = await prisma.vote.findUnique({
        where: {
          proposalId_playerId: {
            proposalId,
            playerId: player.id,
          },
        },
      });

      if (existingVote) {
        // Update existing vote
        await prisma.vote.update({
          where: {
            proposalId_playerId: {
              proposalId,
              playerId: player.id,
            },
          },
          data: { decision },
        });
      } else {
        // Create new vote
        await prisma.vote.create({
          data: {
            proposalId,
            playerId: player.id,
            decision,
          },
        });
      }

      // Check if all players have voted
      const totalPlayers = game.players.length;
      const voteCount = await prisma.vote.count({
        where: { proposalId },
      });

      // Send confirmation to player
      await LineService.pushMessage(groupId, [{
        type: "text",
        text: `✅ ${player.user.displayName} 已投票：${decision === TeamVote.APPROVE ? "同意" : "反對"}\n（${voteCount}/${totalPlayers} 人已投票）`,
      }]);

      // If all players have voted, calculate result
      if (voteCount >= totalPlayers) {
        await this.calculateVoteResult(proposalId, groupId, game.id);
      }

      return { success: true };
    } catch (error) {
      logger.error("Error handling vote:", {}, error instanceof Error ? error : new Error(String(error)));
      return { success: false, message: String(error) };
    }
  }

  /**
   * Calculate vote result and proceed accordingly
   */
  private static async calculateVoteResult(
    proposalId: string,
    groupId: string,
    gameId: string
  ) {
    const proposal = await prisma.teamProposal.findUnique({
      where: { id: proposalId },
      include: {
        votes: true,
        round: {
          include: {
            game: {
              include: {
                players: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!proposal) return;

    const approveCount = proposal.votes.filter(v => v.decision === TeamVote.APPROVE).length;
    const rejectCount = proposal.votes.filter(v => v.decision === TeamVote.REJECT).length;
    const totalPlayers = proposal.round.game.players.length;
    const isApproved = approveCount > rejectCount; // Simple majority

    // Update proposal
    await prisma.teamProposal.update({
      where: { id: proposalId },
      data: { isApproved },
    });

    // If not approved, rotate to next leader
    if (!isApproved) {
      const game = proposal.round.game;
      const totalPlayers = game.players.length;
      const currentLeaderIndex = game.currentLeaderIndex ?? 0;
      const nextLeaderIndex = (currentLeaderIndex + 1) % totalPlayers; // Rotate to next player

      // Update current leader index
      await prisma.game.update({
        where: { id: game.id },
        data: { currentLeaderIndex: nextLeaderIndex },
      });

      const nextLeader = game.players.find(p => p.index === nextLeaderIndex);
      const nextLeaderName = nextLeader?.user?.displayName || "未知";

      // Send result to group
      const resultText = `❌ 投票未通過\n同意：${approveCount} 票\n反對：${rejectCount} 票\n\n輪到 ${nextLeaderName}（${nextLeaderIndex + 1}號）當隊長，請提出新的出隊名單。`;

      await LineService.pushMessage(groupId, [{
        type: "text",
        text: resultText,
      }]);

      // Send game progress message with updated leader
      const playersList = game.players.map(p => ({
        index: p.index,
        displayName: p.user.displayName
      })).sort((a, b) => a.index - b.index);

      const roundProgressMessage = FlexMessageFactory.createRoundLeaderMessage(
        proposal.round.roundNumber,
        nextLeaderName,
        game.questConfig?.length || 5,
        playersList,
        proposal.round.requiredPlayers
      );

      // Add required players info to the message
      const requiredPlayersText = `本輪需要 ${proposal.round.requiredPlayers} 人出隊`;
      
      await LineService.pushMessage(groupId, [
        {
          type: "text",
          text: requiredPlayersText,
        },
        {
          type: "flex",
          altText: "遊戲進度",
          contents: roundProgressMessage as any,
        },
      ]);
    } else {
      // Send result to group (approved)
      const resultText = `✅ 投票通過！\n同意：${approveCount} 票\n反對：${rejectCount} 票\n\n被選中的玩家請執行任務！`;

      await LineService.pushMessage(groupId, [{
        type: "text",
        text: resultText,
      }]);
    }

    // If approved, send mission cards to selected players
    if (isApproved) {
      const selectedPlayerIds = proposal.proposedTeam;
      const selectedPlayers = proposal.round.game.players.filter(p =>
        selectedPlayerIds.includes(p.id)
      );

      for (const player of selectedPlayers) {
        try {
          const notificationFlex = FlexMessageFactory.createTeamProposalNotification(
            gameId,
            groupId,
            proposal.round.roundNumber,
            proposal.round.requiredPlayers
          );

          await LineService.pushMessage(groupId, [
            {
              type: "text",
              text: `@${player.user.displayName} 你被選中出隊！`,
              mention: {
                mentionees: [{
                  index: 0,
                  userId: player.user.lineId,
                }],
              },
            },
            {
              type: "flex",
              altText: "你被選中出隊！",
              contents: notificationFlex,
            },
          ]);
        } catch (error) {
          logger.error(`Failed to send mission card to player ${player.user.lineId}`, {}, error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
  }
}

