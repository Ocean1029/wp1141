import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";

/**
 * @swagger
 * /api/game/{id}:
 *   get:
 *     summary: Get game status
 *     description: Retrieve the current status of a game by its ID.
 *     tags:
 *       - Game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal server error
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const status = await GameService.getLobbyStatus(params.id);
    if (!status) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

