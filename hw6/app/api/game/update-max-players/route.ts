import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/update-max-players:
 *   post:
 *     summary: Update max players count
 *     description: Update the maximum number of players for the game. Only host can update, and maxPlayers must be between 5-10.
 *     tags:
 *       - Game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - userId
 *               - maxPlayers
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The ID of the game
 *               userId:
 *                 type: string
 *                 description: The LINE User ID of the player updating max players (must be the host)
 *               maxPlayers:
 *                 type: number
 *                 description: New maximum number of players (5-10)
 *     responses:
 *       200:
 *         description: Max players updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Cannot update max players (e.g., not the host, invalid range, or less than current players)
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId, maxPlayers } = await req.json();
    if (!gameId || !userId || maxPlayers === undefined) {
      throw new Error("Missing required fields");
    }

    await GameService.updateMaxPlayers(gameId, maxPlayers, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

