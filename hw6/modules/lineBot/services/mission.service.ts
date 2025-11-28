import { LineService } from "./line.service";
import { LLMService } from "./llm.service";
import { FlexMessageFactory } from "../utils/flex";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export class MissionService {
  /**
   * Check if all mission actions are submitted and announce result if so
   */
  static async checkAndAnnounceResult(
    proposalId: string,
    _gameId: string,
    groupId: string
  ): Promise<void> {
    try {
      // Get proposal with mission actions
      const proposal = await prisma.teamProposal.findUnique({
        where: { id: proposalId },
        include: {
          missionActions: {
            include: {
              player: {
                include: {
                  user: true,
                },
              },
            },
          },
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

      if (!proposal || !proposal.isApproved) {
        return; // Proposal not approved yet
      }

      const teamSize = proposal.proposedTeam.length;
      const submittedCount = proposal.missionActions.length;

      // Check if all players have submitted
      if (submittedCount < teamSize) {
        logger.info(`[MissionService] Not all players submitted yet: ${submittedCount}/${teamSize}`);
        return;
      }

      // Calculate mission result
      const successCount = proposal.missionActions.filter(a => a.result === "SUCCESS").length;
      const failCount = proposal.missionActions.filter(a => a.result === "FAIL").length;
      const isSuccess = failCount === 0; // Mission succeeds only if no FAIL votes

      // Update round result
      await prisma.round.update({
        where: { id: proposal.roundId },
        data: { isSuccess },
      });

      // Prepare team members info for AI description
      const teamMembers = proposal.missionActions.map(action => ({
        displayName: action.player.user.displayName,
        role: action.player.role || "未知",
      }));

      // Generate personalized result description using AI
      const aiDescription = await LLMService.generateMissionResultDescription(
        proposal.round.roundNumber,
        isSuccess,
        successCount,
        failCount,
        teamMembers
      );

      // Send result announcement to group
      const resultText = isSuccess ? "成功" : "失敗";
      
      // 1. Send AI description text
      await LineService.pushMessage(groupId, [{
        type: "text",
        text: aiDescription,
      }]);

      // 2. Send formal result Flex Message
      const resultCard = FlexMessageFactory.createMissionResultCard(
        proposal.round.roundNumber,
        isSuccess,
        successCount,
        failCount,
        proposal.round.requiredPlayers
      );

      await LineService.pushMessage(groupId, [{
        type: "flex",
        altText: `第 ${proposal.round.roundNumber} 輪任務${resultText}`,
        contents: resultCard as any,
      }]);

      // 3. Send quest status and round progress messages
      const game = proposal.round.game;
      const questConfig = game.questConfig || [];
      const rounds = await prisma.round.findMany({
        where: { gameId: game.id },
        orderBy: { roundNumber: "asc" },
      });
      const roundsWithResults = rounds.map(r => ({
        roundNumber: r.roundNumber,
        isSuccess: r.isSuccess,
      }));

      const questStatusMessage = FlexMessageFactory.createQuestStatusMessage(
        questConfig,
        proposal.round.roundNumber,
        roundsWithResults
      );

      const currentLeaderIndex = game.currentLeaderIndex ?? 0;
      const leader = game.players.find(p => p.index === currentLeaderIndex);
      const leaderName = leader?.user?.displayName || "未知";

      const playersList = game.players.map(p => ({
        index: p.index,
        displayName: p.user.displayName,
      })).sort((a, b) => a.index - b.index);

      const roundProgressMessage = FlexMessageFactory.createRoundLeaderMessage(
        proposal.round.roundNumber,
        leaderName,
        questConfig.length,
        playersList,
        proposal.round.requiredPlayers
      );

      await LineService.pushMessage(groupId, [
        {
          type: "flex",
          altText: "任務配置",
          contents: questStatusMessage as any,
        },
        {
          type: "flex",
          altText: "遊戲進度",
          contents: roundProgressMessage as any,
        },
      ]);

      logger.info(`[MissionService] Mission result announced: Round ${proposal.round.roundNumber}, Success: ${isSuccess}`);

      // Check if we need to advance to next round
      const currentRoundNum = proposal.round.roundNumber;

      // If this is not the last round, advance to next round
      if (currentRoundNum < questConfig.length) {
        const nextRoundNumber = currentRoundNum + 1;

        // Use transaction to atomically check and create next round
        await prisma.$transaction(async (tx) => {
          // Check if next round already exists
          const nextRoundExists = await tx.round.findUnique({
            where: {
              gameId_roundNumber: {
                gameId: game.id,
                roundNumber: nextRoundNumber,
              },
            },
          });

          // Create next round if it doesn't exist
          if (!nextRoundExists) {
            const requiredPlayers = questConfig[nextRoundNumber - 1]; // questConfig is 0-indexed
            if (requiredPlayers === undefined) {
              throw new Error(`Quest config missing for round ${nextRoundNumber}`);
            }
            await tx.round.create({
              data: {
                gameId: game.id,
                roundNumber: nextRoundNumber,
                requiredPlayers,
              },
            });

            logger.info(`[MissionService] Created round ${nextRoundNumber}`);
          }

          // Update current round number
          await tx.game.update({
            where: { id: game.id },
            data: { currentRoundNumber: nextRoundNumber },
          });
        });

        logger.info(`[MissionService] Advanced to round ${nextRoundNumber}`);
      } else {
        // Last round completed, game should end (handled elsewhere)
        logger.info(`[MissionService] Last round completed, game should end`);
      }
    } catch (error) {
      logger.error("Error checking and announcing mission result:", {}, error instanceof Error ? error : new Error(String(error)));
    }
  }
}

