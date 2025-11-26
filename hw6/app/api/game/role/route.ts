import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/game/role:
 *   get:
 *     summary: Get player role information
 *     description: Retrieve role information for a specific player in a game (e.g., role name, known info).
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: LINE User ID
 *     responses:
 *       200:
 *         description: Player role info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                 description:
 *                   type: string
 *                 knownInfo:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Missing parameters or error
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const gameId = req.nextUrl.searchParams.get("gameId");

  if (!userId || !gameId) return NextResponse.json({ error: "Missing userId or gameId" }, { status: 400 });

  try {
    const info = await GameService.getPlayerRoleInfo(gameId, userId);
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

