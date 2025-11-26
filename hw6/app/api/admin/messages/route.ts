import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/messages:
 *   get:
 *     summary: Get chat messages
 *     description: Retrieve a paginated list of chat messages from the database.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       sender:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           displayName:
 *                             type: string
 *                           pictureUrl:
 *                             type: string
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: messages,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

