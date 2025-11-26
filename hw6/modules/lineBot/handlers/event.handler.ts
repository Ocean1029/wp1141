import { WebhookEvent } from "@line/bot-sdk";
import { ChatService } from "../services/chat.service";
import { logger } from "@/lib/logger";

/**
 * Handle incoming LINE webhook events
 * 
 * @param events - Array of webhook events
 */
export async function handleLineEvents(events: WebhookEvent[]): Promise<void> {
  // Process events in parallel
  await Promise.all(
    events.map(async (event) => {
      try {
        // Log event type for debugging
        logger.info(`Processing event: ${event.type}`, { 
            type: event.type, 
            userId: event.source?.userId 
        });

        // Dispatch to ChatService
        // Currently ChatService handles both business logic and routing
        // In Phase 3, we might want to split Message vs Postback here
        await ChatService.processEvent(event);
        
    } catch (error) {
        // Catch individual event errors so one failure doesn't stop others
        logger.error(`Failed to process event ${event.type}`, {}, error instanceof Error ? error : new Error(String(error)));
    }
    })
  );
}
