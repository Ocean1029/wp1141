import { Client, ClientConfig, middleware } from "@line/bot-sdk";
import { config } from "@/config/env";
import { LineBotContext, isMessageEvent, isTextMessage, isFollowEvent } from "../domain/lineBot.types";
import { createChatCompletion } from "@/lib/openai";
import { getMessage } from "@/config/messages";
import { logger } from "@/lib/logger";
import { ExternalServiceError } from "@/lib/errors";

/**
 * LINE Bot service
 * 
 * Handles LINE Bot operations including message processing,
 * event handling, and response generation.
 */
export class LineBotService {
  private client: Client;

  constructor() {
    const clientConfig: ClientConfig = {
      channelAccessToken: config.line.channelAccessToken,
      channelSecret: config.line.channelSecret,
    };

    this.client = new Client(clientConfig);
  }

  /**
   * Get LINE Bot client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Create middleware for webhook signature verification
   */
  createMiddleware() {
    return middleware({
      channelSecret: config.line.channelSecret,
    });
  }

  /**
   * Handle incoming webhook event
   * 
   * @param context - LINE Bot context containing event information
   */
  async handleEvent(context: LineBotContext): Promise<void> {
    const { event } = context;

    try {
      if (isMessageEvent(event) && isTextMessage(event)) {
        await this.handleTextMessage(event);
      } else if (isFollowEvent(event)) {
        await this.handleFollowEvent(event);
      }
      // Add more event handlers as needed
    } catch (error) {
      logger.error("Error handling LINE event", {
        eventType: event.type,
        userId: context.userId,
      }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Handle text message events
   * 
   * @param event - Message event from LINE
   */
  private async handleTextMessage(event: any): Promise<void> {
    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // Get message from externalized message system
    const responseMessage = getMessage("events.message.echo", {
      message: userMessage,
    });

    await this.replyText(replyToken, responseMessage);
  }

  /**
   * Handle follow events (when user adds the bot as friend)
   * 
   * @param event - Follow event from LINE
   */
  private async handleFollowEvent(event: any): Promise<void> {
    const replyToken = event.replyToken;
    
    // Get message from externalized message system
    const welcomeMessage = getMessage("events.follow.welcome");
    
    await this.replyText(replyToken, welcomeMessage);
  }

  /**
   * Reply with text message
   * 
   * @param replyToken - Reply token from the event
   * @param text - Text message to send
   */
  async replyText(replyToken: string, text: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: "text",
      text,
    });
  }

  /**
   * Reply with text message using OpenAI
   * 
   * @param replyToken - Reply token from the event
   * @param userMessage - User's message
   */
  async replyWithOpenAI(replyToken: string, userMessage: string): Promise<void> {
    try {
      const completion = await createChatCompletion([
        {
          role: "user",
          content: userMessage,
        },
      ]);

      const aiResponse =
        completion.choices[0]?.message?.content ||
        getMessage("errors.openai.failed");
      
      await this.replyText(replyToken, aiResponse);
    } catch (error) {
      logger.error("OpenAI API error", {
        replyToken,
        userMessage,
      }, error instanceof Error ? error : new Error(String(error)));

      // Use externalized error message
      const errorMessage = getMessage("errors.openai.failed");
      await this.replyText(replyToken, errorMessage);

      // Re-throw as ExternalServiceError for proper error handling
      throw new ExternalServiceError(
        "Failed to generate OpenAI response",
        "OpenAI",
        { userMessage }
      );
    }
  }

  /**
   * Reply with Flex Message
   * 
   * @param replyToken - Reply token from the event
   * @param altText - Alternative text for devices that don't support Flex
   * @param contents - Flex Container object
   */
  async replyFlex(replyToken: string, altText: string, contents: any): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: "flex",
      altText,
      contents,
    });
  }

  /**
   * Push message to user
   * 
   * @param userId - LINE user ID
   * @param message - Message to send
   */
  async pushMessage(userId: string, message: string): Promise<void> {
    await this.client.pushMessage(userId, {
      type: "text",
      text: message,
    });
  }

  /**
   * Get user profile
   * 
   * @param userId - LINE user ID
   * @returns User profile information
   */
  async getUserProfile(userId: string) {
    return await this.client.getProfile(userId);
  }
}

/**
 * Singleton instance of LineBotService
 */
let lineBotServiceInstance: LineBotService | null = null;

/**
 * Get or create LineBotService instance
 */
export function getLineBotService(): LineBotService {
  if (!lineBotServiceInstance) {
    lineBotServiceInstance = new LineBotService();
  }
  return lineBotServiceInstance;
}

