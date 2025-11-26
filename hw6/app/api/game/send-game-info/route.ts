import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/modules/lineBot/repositories/game.repository";
import { LineService } from "@/modules/lineBot/services/line.service";
import { FlexMessageFactory } from "@/modules/lineBot/utils/flex";

export const dynamic = "force-dynamic";

/**
 * Send game info messages to LINE group when players enter role page
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, groupId } = await req.json();
    
    if (!gameId || !groupId) {
      return NextResponse.json({ error: "Missing gameId or groupId" }, { status: 400 });
    }

    // Get game data
    const game = await GameRepository.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "PLAYING") {
      return NextResponse.json({ error: "Game is not in PLAYING status" }, { status: 400 });
    }

    // Get quest config and current round
    const questConfig = game.questConfig || [];
    const rounds = game.rounds || [];
    // Find the maximum round number
    // Since startGame creates round 1, we should use the max roundNumber
    const maxRoundNumber = rounds.length > 0 
      ? Math.max(...rounds.map(r => r.roundNumber || 0))
      : 0;
    const currentRound = maxRoundNumber; // Current round number
    
    // Prepare rounds data with results for Flex Message
    const roundsWithResults = rounds.map(r => ({
      roundNumber: r.roundNumber,
      isSuccess: r.isSuccess
    }));
    
    // Get current leader
    const currentLeaderIndex = game.currentLeaderIndex ?? 0;
    const leader = game.players[currentLeaderIndex];
    const leaderName = leader?.user?.displayName || "未知";

    // Prepare players list with index and display name
    const playersList = game.players.map(p => ({
      index: p.index,
      displayName: p.user.displayName
    })).sort((a, b) => a.index - b.index); // Sort by index

    // Create Flex Messages
    const questStatusMessage = FlexMessageFactory.createQuestStatusMessage(questConfig, currentRound, roundsWithResults);
    const roundLeaderMessage = FlexMessageFactory.createRoundLeaderMessage(
      currentRound,
      leaderName,
      questConfig.length,
      playersList
    );

    // Send messages to group
    await LineService.pushMessage(groupId, [
      {
        type: "flex",
        altText: "任務配置",
        contents: questStatusMessage,
      },
      {
        type: "flex",
        altText: "遊戲進度",
        contents: roundLeaderMessage,
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending game info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

