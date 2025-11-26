import OpenAI from "openai";
import { config } from "@/config/env";
import { Message } from "@prisma/client";

export class LLMService {
  private static openai = new OpenAI({
    apiKey: config.openai.apiKey,
    // organization: config.openai.orgId, // Optional
  });

  private static SYSTEM_PROMPT = `
你現在是傳說中的「湖中女神 (Lady of the Lake)」，名字是薇薇安 (Viviane)。
你的職責是引導眾人進行《阿瓦隆 (Avalon)》的試煉。

## 你的能力
1. 解釋阿瓦隆的規則 (例如：梅林要做什麼？刺客怎麼刺殺？)。
2. 協助遊戲流程 (例如：現在是投票階段，請大家盡快決定)。

## 限制
- 如果玩家問及與遊戲無關的現代話題 (如寫程式、股票)，請委婉拒絕，表示你不懂凡間俗事。
- 絕對不要透露任何玩家的真實身分。
- 回答請控制在 200 字以內，避免長篇大論，除非是在解釋複雜規則。
- 請不要出現 markdown 格式。

請根據接下來的對話紀錄，回應玩家的請求。
`;

  /**
   * Generate a response from OpenAI based on conversation history
   */
  static async generateResponse(
    history: Message[], // Recent chat logs from DB
    userInput: string
  ): Promise<string> {
    try {
      // 1. Format history for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: this.SYSTEM_PROMPT },
        ...history.map((msg) => ({
          role: msg.sender === "USER" ? "user" : "assistant",
          content: msg.content,
        } as const)),
        { role: "user", content: userInput },
      ];

      // 2. Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model || "gpt-4o", // Use user preference or fallback
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error("OpenAI returned empty response");
      }

      return responseText;

    } catch (error) {
      console.error("LLM Service Error:", error);
      // Fallback response (Graceful degradation)
      return "（湖面泛起漣漪，女神的聲音似乎被迷霧遮蔽了... 請稍後再試）";
    }
  }

  /**
   * Determine if the user's message is important/relevant to the game rules or gameplay
   * and requires a response from the bot.
   */
  static async isRuleRelated(text: string): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a classifier for the Avalon game bot (Lady of the Lake). 
            Determine if the user's message requires a response. 
            
            It requires a response if:
            1. The user is asking a question about Avalon rules, roles, or gameplay.
            2. The user is directly addressing the bot (e.g., "Hi Lady", "Bot help").
            
            It DOES NOT require a response if:
            1. The user is just chatting with other players (e.g., "I vote approve", "Who is Merlin?").
            2. The message is short and unrelated (e.g., "lol", "ok").
            
            Return strictly 'TRUE' or 'FALSE'.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      const result = completion.choices[0]?.message?.content?.trim().toUpperCase();
      return result === "TRUE";
    } catch (error) {
      console.error("Error in isRuleRelated:", error);
      // Default to false to avoid spam if API fails
      return false;
    }
  }

  /**
   * Determine if the user's message indicates an intent to start or open a new game lobby.
   */
  static async checkStartCommand(text: string): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a classifier. Determine if the user's message indicates they want to START or OPEN a new game lobby.
            Examples of TRUE: "開啟新局", "我要玩阿瓦隆", "start game", "開局", "新的一局", "let's play".
            Examples of FALSE: "怎麼玩？", "開始了嗎？", "規則是什麼", "start", "open".
            Return strictly 'TRUE' or 'FALSE'.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      const result = completion.choices[0]?.message?.content?.trim().toUpperCase();
      return result === "TRUE";
    } catch (error) {
      console.error("Error in checkStartCommand:", error);
      return false;
    }
  }

  /**
   * Parse team proposal command from leader's message
   * Returns null if not a team proposal command, or an object with player indices if it is
   */
  static async parseTeamProposal(
    text: string,
    playerCount: number,
    playerNames: Array<{ index: number; displayName: string }>,
    leaderIndex: number
  ): Promise<{ indices: number[] } | null> {
    try {
      const playerListText = playerNames.map(p => `${p.index + 1}. ${p.displayName}`).join("\n");
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model || "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are parsing a team proposal command in the Avalon game.
The leader (index ${leaderIndex + 1}, name: ${playerNames.find(p => p.index === leaderIndex)?.displayName || "Unknown"}) wants to propose a team for the current quest.

Available players:
${playerListText}

Parse the user's message and extract which player indices (1-based) should be on the team.
Examples:
- "我要選 1, 2, 3" → {"indices": [1, 2, 3]}
- "選 2號和5號" → {"indices": [2, 5]}
- "讓${playerNames[0]?.displayName || "小明"}和${playerNames[1]?.displayName || "小華"}出隊" → find indices by matching names
- "選第一、第二、第三個人" → {"indices": [1, 2, 3]}
- "我要選我自己和2號" → {"indices": [${leaderIndex + 1}, 2]}
- "選我、1號、3號" → {"indices": [${leaderIndex + 1}, 1, 3]}

IMPORTANT: Match player names from the list above. If a name doesn't match exactly, try to find the closest match.

If the message is NOT a team proposal command (e.g., just chatting, asking questions), return {"indices": []}.
Otherwise, return a JSON object with "indices" array containing 1-based player numbers.

Return ONLY valid JSON: {"indices": [1, 2, 3]} or {"indices": []}`,
          },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0]?.message?.content?.trim();
      if (!result) {
        return null;
      }

      const parsed = JSON.parse(result);
      if (parsed.indices && Array.isArray(parsed.indices)) {
        // Convert to 0-based indices and validate
        const indices = parsed.indices
          .map((idx: number) => idx - 1)
          .filter((idx: number) => idx >= 0 && idx < playerCount);
        
        if (indices.length > 0) {
          return { indices };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error in parseTeamProposal:", error);
      return null;
    }
  }

  /**
   * Check if user's message is a confirmation (yes/ok/confirm)
   */
  static async isConfirmation(text: string): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Determine if the user's message is a confirmation (yes, ok, confirm, 是, 好, 確認, etc.).
Return strictly 'TRUE' or 'FALSE'.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      const result = completion.choices[0]?.message?.content?.trim().toUpperCase();
      return result === "TRUE";
    } catch (error) {
      console.error("Error in isConfirmation:", error);
      return false;
    }
  }
}
