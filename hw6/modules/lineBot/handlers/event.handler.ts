import { WebhookEvent } from "@line/bot-sdk";
import { getLineBotService } from "../services/lineBot.service";
import { LineBotContext, isMessageEvent, isTextMessage } from "../domain/lineBot.types";
import { logger } from "@/lib/logger";

/**
 * Event handler for LINE Bot webhook events
 * 
 * This module provides handlers for different types of LINE events.
 * Handlers can be extended or customized based on specific requirements.
 */

/**
 * Main event handler function
 * 
 * @param event - Webhook event from LINE
 */
export async function handleLineEvent(event: WebhookEvent): Promise<void> {
  const lineBotService = getLineBotService();
  
  const context: LineBotContext = {
    event,
    replyToken: (event as any).replyToken,
    userId: (event as any).source?.userId,
    groupId: (event as any).source?.groupId,
    roomId: (event as any).source?.roomId,
  };

  await lineBotService.handleEvent(context);
}

/**
 * Handle multiple events from webhook
 * 
 * @param events - Array of webhook events
 */
export async function handleLineEvents(events: WebhookEvent[]): Promise<void> {
  // Process events sequentially to avoid rate limiting
  for (const event of events) {
    try {
      await handleLineEvent(event);
    } catch (error) {
      logger.error(`Error handling event ${event.type}`, {
        eventType: event.type,
        eventId: (event as any).replyToken,
      }, error instanceof Error ? error : new Error(String(error)));
      // Continue processing other events even if one fails
    }
  }
}

