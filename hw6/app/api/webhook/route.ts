import { NextRequest, NextResponse } from "next/server";
import { handleLineEvents } from "@/modules/lineBot/handlers/event.handler";
import { verifySignature } from "@/modules/lineBot/utils/signature";
import { handleError } from "@/utils/error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api.types";

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: LINE Webhook endpoint
 *     description: |
 *       Receives webhook events from LINE Platform. This endpoint processes
 *       various LINE events such as messages, follows, unfollows, etc.
 *       
 *       The request must include a valid LINE signature in the x-line-signature header
 *       for security verification.
 *     tags:
 *       - LINE Bot
 *     security:
 *       - lineSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               events:
 *                 type: array
 *                 description: Array of webhook events from LINE Platform
 *                 items:
 *                   $ref: '#/components/schemas/WebhookEvent'
 *             required:
 *               - events
 *           example:
 *             events:
 *               - type: message
 *                 timestamp: 1234567890123
 *                 source:
 *                   type: user
 *                   userId: "U1234567890abcdef"
 *                 replyToken: "replyToken123"
 *                 message:
 *                   type: text
 *                   id: "messageId123"
 *                   text: "Hello, bot!"
 *     responses:
 *       200:
 *         description: Webhook events processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponse'
 *             example:
 *               status: "OK"
 *       400:
 *         description: Invalid webhook body format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid webhook body"
 *       401:
 *         description: Missing or invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid signature"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-line-signature");
    if (!signature) {
      throw new AuthenticationError("Missing LINE signature header");
    }

    // Verify that the request is from LINE Platform
    if (!verifySignature(body, signature)) {
      throw new AuthenticationError("Invalid LINE signature");
    }

    // Parse webhook body
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (error) {
      throw new ValidationError("Invalid JSON in webhook body");
    }

    const events = parsedBody.events;
    if (!Array.isArray(events)) {
      throw new ValidationError("Invalid webhook body: events must be an array");
    }

    // Process events
    await handleLineEvents(events);

    // Return success response using standardized format
    const response = createSuccessResponse(
      { status: "OK" },
      200,
      "Webhook events processed successfully"
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // Use centralized error handler
    return handleError(error, "Failed to process webhook request");
  }
}

/**
 * @swagger
 * /api/webhook:
 *   get:
 *     summary: Webhook endpoint verification
 *     description: |
 *       Verifies that the webhook endpoint is active and accessible.
 *       Some LINE Bot implementations may require GET endpoint for verification.
 *     tags:
 *       - LINE Bot
 *     responses:
 *       200:
 *         description: Webhook endpoint is active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookVerificationResponse'
 *             example:
 *               message: "LINE Webhook endpoint is active"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
export async function GET(_req: NextRequest) {
  const response = createSuccessResponse(
    {
      message: "LINE Webhook endpoint is active",
      timestamp: new Date().toISOString(),
    },
    200
  );

  return NextResponse.json(response.data, { status: response.status });
}

