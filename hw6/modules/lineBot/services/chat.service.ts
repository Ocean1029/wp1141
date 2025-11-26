import { WebhookEvent } from "@line/bot-sdk";
import { UserRepository } from "../repositories/user.repository";
import { MessageRepository } from "../repositories/message.repository";
import { LineService } from "./line.service";
import { LLMService } from "./llm.service";
import { MessageSender } from "@prisma/client";
import { logger } from "@/lib/logger";
import { FlexMessageFactory } from "../utils/flex";
import { getLineBotService } from "./lineBot.service";

export class ChatService {
  /**
   * Process incoming webhook events
   */
  static async processEvent(event: WebhookEvent) {
    logger.info(`[ChatService] Received event: ${event.type}`, { event });

    try {
      switch (event.type) {
        case "message":
          if (event.message.type === "text") {
            await this.handleMessageEvent(event);
          }
          break;
        
        case "join":
          await this.handleJoinEvent(event);
          break;
        
        case "postback":
          // We primarily use LIFF now, but keep this for 'Rules' or legacy buttons
          await this.handlePostbackEvent(event);
          break;
          
        default:
          logger.info(`[ChatService] Unhandled event type: ${event.type}`);
          break;
      }
    } catch (error) {
      logger.error(`Error processing event ${event.type}`, {}, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle Join Event (Bot joins a group)
   */
  private static async handleJoinEvent(event: any) {
    const { replyToken } = event;
    try {
      const flexMessage = FlexMessageFactory.createAvalonLobby();
      const lineBotService = getLineBotService();
      await lineBotService.replyFlex(replyToken, "歡迎來到阿瓦隆！", flexMessage);
    } catch (error) {
      logger.error("Failed to send welcome flex message", {}, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle Text Message Event
   */
  private static async handleMessageEvent(event: any) {
    const { replyToken, source, message } = event;
    const userId = source.userId;
    const groupId = source.type === "group" ? source.groupId : undefined;
    const userText = message.text.trim();

    if (!userId) return;

    await this.syncUserProfile(userId, groupId);

    try {
      // Log User Message
      await MessageRepository.create({
        lineUserId: userId,
        sender: MessageSender.USER,
        content: userText,
      });

      // 1. Check if User wants to Start Game (AI Evaluated)
      // Legacy commands are kept for dev convenience: /start, /open
      const isStartCommand = userText === "/start" || userText === "/open" || await LLMService.checkStartCommand(userText);

      if (isStartCommand) {
        const flexMessage = FlexMessageFactory.createAvalonLobby();
        const lineBotService = getLineBotService();
        await lineBotService.replyFlex(replyToken, "阿瓦隆遊戲大廳", flexMessage);
        return;
      }

      // 2. Trigger Rules Flex (Also serves as "Help")
      if (userText === "規則說明" || userText === "/rules") {
        const rulesFlex = FlexMessageFactory.createRulesMessage();
        const lineBotService = getLineBotService();
        await lineBotService.replyFlex(replyToken, "阿瓦隆遊戲規則", rulesFlex);
        // Do not return here; let the AI check if it should also explain something? 
        // Actually, if they just asked for rules, the card is enough.
        // But if they asked "Explain rules", maybe they want text. 
        // Let's stick to just the card for this exact phrase to avoid duplication.
        return;
      }

      // 3. AI Evaluation: Does this message need a response?
      const isImportant = await LLMService.isRuleRelated(userText);
      
      if (isImportant) {
          const history = await MessageRepository.findRecentByUserId(userId, 5);
          const chronologicalHistory = [...history].reverse();
          const replyText = await LLMService.generateResponse(chronologicalHistory, userText);

          await LineService.replyText(replyToken, replyText);
          await MessageRepository.create({
            lineUserId: userId,
            sender: MessageSender.BOT,
            content: replyText,
          });
          return;
      }

      // If not important, do nothing (silent).

    } catch (error) {
      logger.error("Error in handleMessageEvent:", {}, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle Postback Event
   */
  private static async handlePostbackEvent(event: any) {
    const { replyToken, postback } = event;
    
    // Only handle 'show_rules' here if necessary. 
    // Legacy 'create_game' actions are removed as we use LIFF now.
    if (postback.data === "action=show_rules") {
        const rulesFlex = FlexMessageFactory.createRulesMessage();
        const lineBotService = getLineBotService();
        await lineBotService.replyFlex(replyToken, "阿瓦隆遊戲規則", rulesFlex);
    }
  }

  /**
   * Helper: Sync User Profile
   */
  private static async syncUserProfile(userId: string, groupId?: string) {
    try {
      const profile = groupId 
        ? await LineService.getGroupMemberProfile(groupId, userId)
        : await LineService.getProfile(userId);

      if (profile) {
        await UserRepository.upsert(userId, profile.displayName, profile.pictureUrl);
      }
    } catch (e) {
      // Ignore profile sync errors (non-blocking)
    }
  }
}
