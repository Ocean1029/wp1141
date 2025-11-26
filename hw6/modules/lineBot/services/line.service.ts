import { messagingApi } from "@line/bot-sdk";
import { config } from "@/config/env";

const { MessagingApiClient } = messagingApi;

export class LineService {
  private static client = new MessagingApiClient({
    channelAccessToken: config.line.channelAccessToken,
  });

  /**
   * Reply to a message using replyToken
   */
  static async replyText(replyToken: string, text: string) {
    try {
      await this.client.replyMessage({
        replyToken,
        messages: [{ type: "text", text }],
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      throw error;
    }
  }

  /**
   * Reply with multiple messages (e.g. text + sticker)
   */
  static async replyMessages(replyToken: string, messages: messagingApi.Message[]) {
    try {
      await this.client.replyMessage({
        replyToken,
        messages,
      });
    } catch (error) {
      console.error("Error sending reply messages:", error);
      throw error;
    }
  }

  /**
   * Push message to a user or group
   */
  static async pushMessage(to: string, messages: messagingApi.Message[]) {
    try {
      await this.client.pushMessage({
        to,
        messages,
      });
    } catch (error) {
      console.error("Error pushing message:", error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    try {
      return await this.client.getProfile(userId);
    } catch (error) {
      console.error("Error getting profile:", error);
      return null;
    }
  }

    /**
   * Get group member profile
   */
    static async getGroupMemberProfile(groupId: string, userId: string) {
      try {
        return await this.client.getGroupMemberProfile(groupId, userId);
      } catch (error) {
        console.error("Error getting group member profile:", error);
        return null;
      }
    }
}


