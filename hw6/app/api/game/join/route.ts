import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/join:
 *   post:
 *     summary: Join a game
 *     description: Add a player to an existing game session.
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
 *                 description: The ID of the game to join
 *               userId:
 *                 type: string
 *                 description: The LINE User ID of the player joining
 *     responses:
 *       200:
 *         description: Player joined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 gameId:
 *                   type: string
 *                 index:
 *                   type: integer
 *       400:
 *         description: Invalid request or unable to join
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId } = await req.json();
    if (!gameId || !userId) throw new Error("Missing required fields");

    const player = await GameService.joinGame(gameId, userId);
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

