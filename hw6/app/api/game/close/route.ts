import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/close:
 *   post:
 *     summary: Close/Abort the game room
 *     description: Close the game room. Only the host can close the game.
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
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The ID of the game to close
 *               userId:
 *                 type: string
 *                 description: The LINE User ID of the player closing the game (must be the host)
 *     responses:
 *       200:
 *         description: Game closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Cannot close game (e.g., not the host)
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId } = await req.json();
    if (!gameId || !userId) throw new Error("Missing required fields");

    await GameService.closeGame(gameId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

