import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/modules/lineBot/services/game.service";
import { Role } from "@prisma/client";

/**
 * @swagger
 * /api/game/update-roles:
 *   post:
 *     summary: Update active roles configuration
 *     description: Update the active roles for the game. Only host can update, and role count must match maxPlayers.
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
 *               - activeRoles
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The ID of the game
 *               userId:
 *                 type: string
 *                 description: The LINE User ID of the player updating roles (must be the host)
 *               activeRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [MERLIN, PERCIVAL, SERVANT, MORGANA, ASSASSIN, MINION, OBERON, MORDRED]
 *                 description: Array of roles to use in the game
 *     responses:
 *       200:
 *         description: Roles updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Cannot update roles (e.g., not the host, invalid count, or missing required roles)
 */
export async function POST(req: NextRequest) {
  try {
    const { gameId, userId, activeRoles } = await req.json();
    if (!gameId || !userId || !activeRoles) {
      throw new Error("Missing required fields");
    }

    // Validate activeRoles is an array
    if (!Array.isArray(activeRoles)) {
      throw new Error("activeRoles must be an array");
    }

    // Convert string array to Role enum array
    const roles = activeRoles.map((r: string) => r as Role);

    await GameService.updateActiveRoles(gameId, roles, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

