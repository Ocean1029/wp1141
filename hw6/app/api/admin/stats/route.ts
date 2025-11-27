import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     description: Retrieve general system statistics including total messages, today's messages, total users, and total games.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMessages:
 *                   type: integer
 *                   description: Total number of messages stored
 *                 todayMessages:
 *                   type: integer
 *                   description: Number of messages created today
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of registered users
 *                 totalGames:
 *                   type: integer
 *                   description: Total number of games played
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const [totalMessages, totalUsers, totalGames] = await Promise.all([
      prisma.message.count(),
      prisma.user.count(),
      prisma.game.count(),
    ]);

    // Get today's message count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    return NextResponse.json({
      totalMessages,
      todayMessages,
      totalUsers,
      totalGames,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch stats", details: errorMessage },
      { status: 500 }
    );
  }
}

