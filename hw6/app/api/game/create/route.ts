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
/**
 * Validate LINE Group ID format
 * LINE Group IDs should start with 'C' followed by 32 hexadecimal characters (33 chars total)
 * UUID format (with dashes) is NOT a valid LINE Group ID
 */
function isValidLineGroupId(id: string): boolean {
  // LINE Group ID: C + 32 hex chars = 33 chars total, no dashes
  const lineGroupIdPattern = /^C[0-9a-fA-F]{32}$/;
  return lineGroupIdPattern.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const { lineGroupId, hostUserId } = await req.json();
    console.log(`[API create] Request to create for groupId: ${lineGroupId}, host: ${hostUserId}`);
    console.log(`[API create] lineGroupId details: length=${lineGroupId?.length || 0}, startsWithC=${lineGroupId?.startsWith("C") || false}, isUUID=${lineGroupId?.includes("-") || false}, type=${typeof lineGroupId}`);
    
    if (!lineGroupId || !hostUserId) {
      console.error(`[API create] Missing fields: lineGroupId=${!!lineGroupId}, hostUserId=${!!hostUserId}`);
      throw new Error("Missing required fields");
    }
    
    // Validate LINE Group ID format
    if (!isValidLineGroupId(lineGroupId)) {
      const isUUID = lineGroupId.includes("-") && lineGroupId.length === 36;
      const errorMsg = isUUID 
        ? `Invalid LINE Group ID: Received UUID format instead of LINE Group ID. This indicates a LIFF configuration issue. Expected: C + 32 hex chars (33 total). Received: ${lineGroupId.substring(0, 20)}...`
        : `Invalid LINE Group ID format. Expected: C + 32 hex chars (33 total). Received: ${lineGroupId.substring(0, 20)}... (length: ${lineGroupId.length})`;
      
      console.error(`[API create] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const game = await GameService.createGame(lineGroupId, hostUserId);
    console.log(`[API create] Successfully created game: ${game.id} with lineGroupId: ${game.lineGroupId}`);
    return NextResponse.json(game);
  } catch (error) {
    console.error(`[API create] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

