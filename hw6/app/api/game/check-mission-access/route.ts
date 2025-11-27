import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/modules/lineBot/repositories/game.repository";

export const dynamic = "force-dynamic";

/**
 * Check if user has access to mission page (is in the approved team)
 */
export async function GET(req: NextRequest) {
  try {
    const gameId = req.nextUrl.searchParams.get("gameId");
    const roundNumber = req.nextUrl.searchParams.get("roundNumber");
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!gameId || !roundNumber || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    const player = game.players.find((p: (typeof game.players)[number]) => p.user.lineId === userId);
    if (!player || !player.role) {
      return NextResponse.json({ error: "Player not found or role not assigned" }, { status: 404 });
    }

    // Find current round
    const round = game.rounds.find((r: (typeof game.rounds)[number]) => r.roundNumber === parseInt(roundNumber, 10));
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // Find approved team proposal for this round
    const proposal = round.proposals.find((p: (typeof round.proposals)[number]) => p.isApproved === true);
    if (!proposal) {
      return NextResponse.json({ 
        hasAccess: false, 
        error: "No approved team proposal found for this round" 
      }, { status: 200 });
    }

    // Check if player is in the team
    const hasAccess = proposal.proposedTeam.includes(player.id);

    return NextResponse.json({ 
      hasAccess,
      error: hasAccess ? null : "You are not in the mission team"
    });
  } catch (error) {
    console.error("Error checking mission access:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

