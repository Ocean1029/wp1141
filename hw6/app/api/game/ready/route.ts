import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/ready:
 *   post:
 *     summary: Toggle player ready status
 *     description: Toggle the ready status of a player in the lobby.
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ready status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isReady:
 *                   type: boolean
 *       400:
 *         description: Invalid request
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId } = await req.json();
    if (!gameId || !userId) throw new Error("Missing required fields");

    const isReady = await GameService.toggleReady(gameId, userId);
    return NextResponse.json({ isReady });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

