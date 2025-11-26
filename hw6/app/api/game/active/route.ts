import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/modules/lineBot/repositories/game.repository";
import { GameService } from "@/modules/lineBot/services/game.service";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/game/active:
 *   get:
 *     summary: Get active game by Group ID
 *     description: Retrieve the active game session for a specific LINE group.
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: LINE Group ID
 *     responses:
 *       200:
 *         description: Active game status or null
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               nullable: true
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing groupId
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  console.log(`[API active] Query groupId: ${groupId}`);
  
  if (!groupId) return NextResponse.json({ error: "Missing groupId" }, { status: 400 });

  try {
    const game = await GameRepository.findActiveGame(groupId);
    console.log(`[API active] Found game: ${game?.id || "null"} for group: ${groupId}`);
    
    if (!game) return NextResponse.json(null); // No active game is fine, return null

    // Use Service to format return data same as getLobbyStatus
    const status = await GameService.getLobbyStatus(game.id);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

