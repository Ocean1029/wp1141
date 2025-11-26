import { FlexContainer, FlexMessage } from "@line/bot-sdk";
import { config } from "@/config/env";

export class FlexMessageFactory {
  /**
   * Create the main Avalon game lobby card
   */
  static createAvalonLobby(): FlexContainer {
    const baseUrl = config.baseUrl;
    // Use a dark theme hero image or fallback
    const heroImageUrl = `${baseUrl}/Images/Card_Image.jpg`;
    const liffUrl = `https://liff.line.me/${config.line.liffId}/game/lobby`;

    return {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "THE RESISTANCE",
            color: "#aa8f66", // Muted gold
            size: "xs",
            weight: "bold",
            align: "center"
          },
          {
            type: "text",
            text: "AVALON",
            color: "#ffffff",
            size: "3xl",
            weight: "bold",
            align: "center",
            margin: "sm",
            style: "normal"
          },
          {
            type: "separator",
            margin: "lg",
            color: "#aa8f66"
          }
        ],
        paddingAll: "20px",
        backgroundColor: "#272946" // Deep blue/purple
      },
      hero: {
        type: "image",
        url: heroImageUrl,
        size: "full",
        aspectRatio: "20:13", // Square to show more vertical content (head)
        aspectMode: "cover",
        action: {
          type: "uri",
          uri: liffUrl,
          label: "Enter Game"
        }
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "正義與邪惡的戰爭即將開始",
            weight: "bold",
            size: "md",
            align: "center",
            color: "#dddddd"
          }
        ],
        backgroundColor: "#1a1c30" // Darker background for body
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              // Rules Button (Outlined Box - Gold Style)
              {
                type: "box",
                layout: "vertical",
                borderWidth: "1px",
                borderColor: "#C6A666", // Gold border
                cornerRadius: "4px",
                justifyContent: "center",
                alignItems: "center",
                paddingAll: "10px",
                action: {
                  type: "message",
                  label: "規則說明",
                  text: "規則說明"
                },
                contents: [
                  {
                    type: "text",
                    text: "規則說明",
                    color: "#C6A666", // Gold text
                    size: "sm",
                    weight: "bold"
                  }
                ],
                flex: 1
              },
              // Start Game Button (Outlined Box)
              {
                type: "box",
                layout: "vertical",
                borderWidth: "1px",
                borderColor: "#C6A666", // Gold border
                cornerRadius: "4px",
                justifyContent: "center",
                alignItems: "center",
                paddingAll: "10px",
                action: {
                  type: "uri",
                  label: "開始遊戲",
                  uri: liffUrl
                },
                contents: [
                  {
                    type: "text",
                    text: "開始遊戲",
                    color: "#C6A666",
                    size: "sm",
                    weight: "bold"
                  }
                ],
                flex: 1
              }
            ]
          }
        ],
        paddingAll: "20px",
        backgroundColor: "#1a1c30" // Match body background
      },
      styles: {
        footer: {
          separator: false
        }
      }
    };
  }

  /**
   * Create a simple text rule message (Flex)
   */
  static createRulesMessage(): FlexContainer {
    return {
      type: "bubble",
      size: "giga",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📜 阿瓦隆遊戲規則",
            weight: "bold",
            size: "xl",
            color: "#C6A666",
            align: "center"
          },
          {
            type: "separator",
            margin: "md",
            color: "#C6A666"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "🔵", flex: 0, size: "sm" },
                  { type: "text", text: "好人陣營：完成 3 個任務", weight: "bold", margin: "sm", color: "#ffffff", size: "sm" }
                ]
              },
              {
                type: "text",
                text: "角色：梅林 (全知者)、派西維爾 (護衛)、忠臣 ......",
                size: "xs",
                color: "#aaaaaa",
                margin: "xs",
                offsetStart: "24px"
              },
              {
                type: "box",
                layout: "baseline",
                margin: "md",
                contents: [
                  { type: "text", text: "🔴", flex: 0, size: "sm" },
                  { type: "text", text: "壞人陣營：破壞 3 個任務 / 刺殺梅林", weight: "bold", margin: "sm", color: "#ffffff", size: "sm" }
                ]
              },
              {
                type: "text",
                text: "角色：莫甘娜 (假梅林)、刺客、爪牙 ......",
                size: "xs",
                color: "#aaaaaa",
                margin: "xs",
                offsetStart: "24px"
              }
            ]
          },
          {
            type: "separator",
            margin: "lg",
            color: "#444444"
          },
          {
            type: "text",
            text: "流程：組隊 ➔ 投票 ➔ 出任務 ➔ 判定",
            align: "center",
            color: "#dddddd",
            size: "sm",
            margin: "lg",
            weight: "bold"
          }
        ],
        backgroundColor: "#272946"
      }
    };
  }
}
