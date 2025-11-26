import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/create:
 *   post:
 *     summary: Create a new game
 *     description: Create a new Avalon game session for a specific LINE group.
 *     tags:
 *       - Game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lineGroupId
 *               - hostUserId
 *             properties:
 *               lineGroupId:
 *                 type: string
 *                 description: The LINE Group ID where the game is played
 *               hostUserId:
 *                 type: string
 *                 description: The LINE User ID of the player creating the game
 *     responses:
 *       200:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 lineGroupId:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid request or game already exists
 */
export async function POST(req: NextRequest) {
  try {
    const { lineGroupId, hostUserId } = await req.json();
    console.log(`[API create] Request to create for groupId: ${lineGroupId}, host: ${hostUserId}`);
    if (!lineGroupId || !hostUserId) throw new Error("Missing required fields");
    
    const game = await GameService.createGame(lineGroupId, hostUserId);
    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

