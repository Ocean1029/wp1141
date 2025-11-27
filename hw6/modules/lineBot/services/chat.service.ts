import { WebhookEvent } from "@line/bot-sdk";
import { UserRepository } from "../repositories/user.repository";
import { MessageRepository } from "../repositories/message.repository";
import { LineService } from "./line.service";
import { LLMService } from "./llm.service";
import { MessageSender } from "@prisma/client";
import { logger } from "@/lib/logger";
import { FlexMessageFactory } from "../utils/flex";
import { getLineBotService } from "./lineBot.service";
import { TeamProposalService } from "./team-proposal.service";
import { VoteService } from "./vote.service";
import { TeamVote } from "@prisma/client";

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
        
        case "follow":
          await this.handleFollowEvent(event);
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
   * Handle Follow Event (User adds bot as friend)
   */
  private static async handleFollowEvent(event: any) {
    const { replyToken, source } = event;
    const sourceType = source.type;
    
    // Only send usage guide for friend users (not group joins)
    if (sourceType === "user") {
      try {
        const flexMessage = FlexMessageFactory.createUsageGuideCard();
        const lineBotService = getLineBotService();
        await lineBotService.replyFlex(replyToken, "歡迎使用阿瓦隆遊戲 Bot！", flexMessage);
        logger.info(`[ChatService] Sent usage guide to new friend user: ${source.userId}`);
      } catch (error) {
        logger.error("Failed to send usage guide flex message", {}, error instanceof Error ? error : new Error(String(error)));
      }
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
    const sourceType = source.type;
    const groupId = sourceType === "group" ? source.groupId : undefined;
    const roomId = sourceType === "room" ? source.roomId : undefined;
    const userText = message.text.trim();
    
    // Log source information for debugging
    logger.info(`[ChatService] Message event source info`, {
      sourceType,
      userId,
      groupId,
      roomId,
      hasGroupId: !!groupId,
      hasRoomId: !!roomId,
    });

    if (!userId) return;

    // If message is from friend (not in group), send usage guide
    if (sourceType === "user") {
      try {
        const flexMessage = FlexMessageFactory.createUsageGuideCard();
        const lineBotService = getLineBotService();
        await lineBotService.replyFlex(replyToken, "使用說明", flexMessage);
        logger.info(`[ChatService] Sent usage guide to friend user: ${userId}`);
        return;
      } catch (error) {
        logger.error("Failed to send usage guide flex message", {}, error instanceof Error ? error : new Error(String(error)));
        return;
      }
    }

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
        // Log group information for debugging
        logger.info(`[ChatService] Start command received`, {
          userId,
          groupId,
          sourceType: source.type,
          hasGroupId: !!groupId,
          groupIdFormat: groupId ? (groupId.startsWith("C") ? "LINE_GROUP_ID" : groupId.includes("-") ? "UUID" : "UNKNOWN") : "NONE",
        });
        
        // Pass groupId to Flex Message so it can be included in LIFF URL
        // This is a fallback when getContext().groupId is not available or returns invalid format
        const flexMessage = FlexMessageFactory.createAvalonLobby(groupId);
        
        if (!groupId) {
          logger.warn(`[ChatService] No groupId available when creating Flex Message. User may not be in a group.`);
        }
        
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

      // 2.5. Handle team proposal confirmation
      if (groupId) {
        const confirmationResult = await TeamProposalService.handleConfirmation(userId, groupId, userText);
        if (confirmationResult.isConfirmation) {
          if (confirmationResult.success) {
            // Confirmation successful, message already sent to group
            return;
          }
          // Confirmation failed or invalid
          await LineService.replyText(replyToken, "確認失敗，請重新提出隊伍。");
          return;
        }

        // 2.6. Handle team proposal command
        const proposalResult = await TeamProposalService.handleProposalCommand(userId, groupId, userText);
        if (proposalResult.isProposal) {
          if (proposalResult.confirmationMessage) {
            await LineService.replyText(replyToken, proposalResult.confirmationMessage);
            return;
          }
        }
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
    const { replyToken, postback, source } = event;
    const userId = source.userId;
    const groupId = source.type === "group" ? source.groupId : undefined;
    
    if (!groupId) {
      logger.warn(`[ChatService] Postback event without groupId`);
      return;
    }

    const data = postback.data;
    
    // Handle vote postback
    if (data.startsWith("vote:")) {
      const parts = data.split(":");
      if (parts.length === 3) {
        const [, proposalId, decision] = parts;
        const voteDecision = decision === "APPROVE" ? "APPROVE" : "REJECT";
        
        const result = await VoteService.handleVote(
          proposalId,
          userId,
          groupId,
          voteDecision as any
        );

        if (result.success) {
          // Vote handled successfully, confirmation message already sent
          return;
        } else {
          // Send error message
          await LineService.replyText(replyToken, result.message || "投票失敗");
          return;
        }
      }
    }
    
    // Handle other postbacks
    if (data === "action=show_rules") {
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
