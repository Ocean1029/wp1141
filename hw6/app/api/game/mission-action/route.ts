import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/modules/lineBot/repositories/game.repository";
import { prisma } from "@/lib/prisma";
import { MissionResult } from "@prisma/client";
import { MissionService } from "@/modules/lineBot/services/mission.service";

export const dynamic = "force-dynamic";

/**
 * Submit mission action (SUCCESS or FAIL)
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, roundNumber, userId, result } = await req.json();
    
    if (!gameId || !roundNumber || !userId || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (result !== "SUCCESS" && result !== "FAIL") {
      return NextResponse.json({ error: "Invalid result. Must be SUCCESS or FAIL" }, { status: 400 });
    }

    // Get game data
    const game = await GameRepository.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "PLAYING") {
      return NextResponse.json({ error: "Game is not in PLAYING status" }, { status: 400 });
    }

    // Find player
    const player = game.players.find(p => p.user.lineId === userId);
    if (!player || !player.role) {
      return NextResponse.json({ error: "Player not found or role not assigned" }, { status: 404 });
    }

    // Find current round
    const round = game.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // Find approved team proposal for this round
    const proposal = round.proposals.find((p: any) => p.isApproved === true);
    if (!proposal) {
      return NextResponse.json({ error: "No approved team proposal found for this round" }, { status: 400 });
    }

    // Check if player is in the team
    if (!proposal.proposedTeam.includes(player.id)) {
      return NextResponse.json({ error: "You are not in the mission team" }, { status: 403 });
    }

    // Check if already submitted
    const existingAction = await prisma.missionAction.findUnique({
      where: {
        proposalId_playerId: {
          proposalId: proposal.id,
          playerId: player.id,
        },
      },
    });

    if (existingAction) {
      return NextResponse.json({ error: "You have already submitted your mission action" }, { status: 400 });
    }

    // Validate: Good team players cannot submit FAIL
    const isGoodTeam = player.role === "MERLIN" || player.role === "PERCIVAL" || player.role === "SERVANT";
    if (isGoodTeam && result === "FAIL") {
      return NextResponse.json({ error: "Good team players cannot submit FAIL" }, { status: 403 });
    }

    // Create mission action
    await prisma.missionAction.create({
      data: {
        proposalId: proposal.id,
        playerId: player.id,
        result: result as MissionResult,
      },
    });

    // Check if all players have submitted and announce result
    const groupId = game.lineGroupId;
    if (groupId) {
      // Run asynchronously to not block the response
      MissionService.checkAndAnnounceResult(proposal.id, gameId, groupId).catch(error => {
        console.error("Error checking mission result:", error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting mission action:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

