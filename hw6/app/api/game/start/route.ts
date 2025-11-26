import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/start:
 *   post:
 *     summary: Start the game
 *     description: Start the game session if player requirements are met.
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
 *                 description: The ID of the game to start
 *               userId:
 *                 type: string
 *                 description: The LINE User ID of the player starting the game (usually the host)
 *     responses:
 *       200:
 *         description: Game started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 config:
 *                   type: object
 *                   description: Game configuration and roles
 *       400:
 *         description: Cannot start game (e.g., not enough players)
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId } = await req.json();
    if (!gameId || !userId) throw new Error("Missing required fields");

    const config = await GameService.startGame(gameId, userId);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

