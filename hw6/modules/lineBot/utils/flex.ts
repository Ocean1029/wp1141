import { FlexContainer } from "@line/bot-sdk";
import { config } from "@/config/env";

export class FlexMessageFactory {
  /**
   * Create the main Avalon game lobby card
   * @param groupId - Optional LINE Group ID to pass via URL parameter
   *                   This is a fallback when getContext().groupId is not available
   */
  static createAvalonLobby(groupId?: string): FlexContainer {
    const baseUrl = config.baseUrl;
    // Use a dark theme hero image or fallback
    const heroImageUrl = `${baseUrl}/Images/Card_Image.jpg`;
    // Include groupId in URL as query parameter if provided
    // This ensures we can get the correct Group ID even if getContext() fails
    const liffUrl = groupId 
      ? `https://liff.line.me/${config.line.liffId}/game/lobby?groupId=${encodeURIComponent(groupId)}`
      : `https://liff.line.me/${config.line.liffId}/game/lobby`;
    
    // Log for debugging
    console.log(`[FlexMessageFactory] Creating lobby with groupId: ${groupId || "NONE"}, LIFF URL: ${liffUrl}`);

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

  /**
   * Create quest configuration and status message
   * @param questConfig - Array of required players for each quest
   * @param currentRound - Current round number
   * @param rounds - Array of rounds with results (isSuccess field)
   */
  static createQuestStatusMessage(questConfig: number[], currentRound: number, rounds: Array<{ roundNumber: number; isSuccess: boolean | null }> = []): FlexContainer {
    const questItems = questConfig.map((requiredPlayers, index) => {
      const roundNumber = index + 1;
      const round = rounds.find(r => r.roundNumber === roundNumber);
      const isSuccess = round?.isSuccess;
      
      // First round (roundNumber === 1) should not have any result marker
      let resultText = "";
      let resultColor = "#C6A666";
      
      if (roundNumber > 1 && isSuccess !== null && isSuccess !== undefined) {
        if (isSuccess) {
          resultText = " 🔵 藍方勝";
          resultColor = "#4A90E2";
        } else {
          resultText = " 🔴 紅方勝";
          resultColor = "#E24A4A";
        }
      }
      
      const contents: any[] = [
        {
          type: "text" as const,
          text: `任務 ${roundNumber}`,
          size: "sm" as const,
          color: "#ffffff",
          flex: 2,
          weight: "bold" as const
        },
        {
          type: "text" as const,
          text: `${requiredPlayers} 人`,
          size: "sm" as const,
          color: "#C6A666",
          flex: 1,
          align: "end" as const,
          weight: "bold" as const
        }
      ];
      
      if (resultText) {
        contents.push({
          type: "text" as const,
          text: resultText,
          size: "xs" as const,
          color: resultColor,
          flex: 0,
          margin: "sm" as const,
          weight: "bold" as const
        });
      }
      
      return {
        type: "box" as const,
        layout: "baseline" as const,
        margin: "sm" as const,
        contents
      };
    });

    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📋 任務配置",
            weight: "bold",
            size: "lg",
            color: "#C6A666",
            align: "center"
          }
        ],
        backgroundColor: "#1a1c30",
        paddingAll: "md"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "每次任務所需人數：",
            size: "sm",
            color: "#aaaaaa",
            margin: "md"
          },
          ...questItems,
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: `目前進度：第 ${currentRound} 輪`,
            size: "sm",
            color: "#ffffff",
            weight: "bold",
            align: "center",
            margin: "md"
          }
        ],
        backgroundColor: "#272946"
      }
    };
  }

  /**
   * Create current round and leader message
   * @param currentRound - Current round number
   * @param leaderName - Current leader's display name
   * @param totalRounds - Total number of rounds
   * @param players - Array of players with index and display name
   * @param requiredPlayers - Number of players required for this round's mission
   */
  static createRoundLeaderMessage(
    currentRound: number, 
    leaderName: string, 
    totalRounds: number = 5,
    players: Array<{ index: number; displayName: string }> = [],
    requiredPlayers?: number
  ): FlexContainer {
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⚔️ 遊戲進度",
            weight: "bold",
            size: "lg",
            color: "#C6A666",
            align: "center"
          }
        ],
        backgroundColor: "#1a1c30",
        paddingAll: "md"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "第",
                size: "md",
                color: "#aaaaaa",
                flex: 0
              },
              {
                type: "text",
                text: `${currentRound}`,
                size: "3xl",
                color: "#C6A666",
                weight: "bold",
                flex: 0,
                margin: "sm"
              },
              {
                type: "text",
                text: "輪",
                size: "md",
                color: "#aaaaaa",
                flex: 0
              },
              {
                type: "text",
                text: `/ ${totalRounds}`,
                size: "md",
                color: "#666666",
                flex: 0,
                margin: "sm"
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "👑 隊長：",
                size: "sm",
                color: "#aaaaaa",
                flex: 0
              },
              {
                type: "text",
                text: leaderName,
                size: "md",
                color: "#ffffff",
                weight: "bold",
                flex: 1,
                margin: "sm"
              }
            ]
          },
          ...(requiredPlayers !== undefined ? [
            {
              type: "separator" as const,
              margin: "lg" as const
            },
            {
              type: "box" as const,
              layout: "baseline" as const,
              margin: "md" as const,
              contents: [
                {
                  type: "text" as const,
                  text: "📋 本輪需要：",
                  size: "sm" as const,
                  color: "#aaaaaa",
                  flex: 0
                },
                {
                  type: "text" as const,
                  text: `${requiredPlayers} 人出隊`,
                  size: "md" as const,
                  color: "#C6A666",
                  weight: "bold" as const,
                  flex: 1,
                  margin: "sm" as const
                }
              ]
            }
          ] : []),
          {
            type: "separator" as const,
            margin: "lg" as const
          },
          {
            type: "text",
            text: "玩家列表：",
            size: "sm",
            color: "#aaaaaa",
            margin: "md"
          },
          ...players.map(player => ({
            type: "box" as const,
            layout: "baseline" as const,
            margin: "xs" as const,
            contents: [
              {
                type: "text" as const,
                text: `${player.index + 1}`,
                size: "sm" as const,
                color: "#C6A666",
                flex: 0,
                weight: "bold" as const,
                margin: "sm" as const
              },
              {
                type: "text" as const,
                text: player.displayName,
                size: "sm" as const,
                color: "#ffffff",
                flex: 1,
                margin: "sm" as const
              }
            ]
          }))
        ],
        backgroundColor: "#272946"
      }
    };
  }

  /**
   * Create team proposal notification card for selected players
   */
  static createTeamProposalNotification(
    gameId: string,
    groupId: string,
    roundNumber: number,
    requiredPlayers: number
  ): FlexContainer {
    const liffId = config.line.liffId;
    const liffUrl = `https://liff.line.me/${liffId}/game/mission?gameId=${gameId}&groupId=${encodeURIComponent(groupId)}&roundNumber=${roundNumber}`;

    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⚔️ 你被選中出隊！",
            weight: "bold",
            size: "lg",
            color: "#C6A666",
            align: "center"
          }
        ],
        backgroundColor: "#1a1c30",
        paddingAll: "md"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `第 ${roundNumber} 輪任務`,
            size: "md",
            color: "#ffffff",
            weight: "bold",
            align: "center",
            margin: "md"
          },
          {
            type: "text",
            text: `本輪需要 ${requiredPlayers} 人出隊`,
            size: "sm",
            color: "#aaaaaa",
            align: "center",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "請點擊下方按鈕選擇任務結果",
            size: "sm",
            color: "#C6A666",
            align: "center",
            margin: "md"
          }
        ],
        backgroundColor: "#272946"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "選擇任務結果",
              uri: liffUrl
            },
            style: "primary",
            color: "#C6A666",
            height: "md"
          }
        ],
        backgroundColor: "#1a1c30"
      }
    };
  }

  /**
   * Create voting card for team proposal
   */
  static createVotingCard(
    proposalId: string,
    roundNumber: number,
    leaderName: string,
    teamMembers: Array<{ index: number; displayName: string }>,
    requiredPlayers: number
  ): FlexContainer {
    const memberList = teamMembers.map(m => `${m.index + 1}. ${m.displayName}`).join("\n");
    
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🗳️ 投票階段",
            weight: "bold",
            size: "lg",
            color: "#C6A666",
            align: "center"
          }
        ],
        backgroundColor: "#1a1c30",
        paddingAll: "md"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `第 ${roundNumber} 輪任務`,
            size: "md",
            color: "#ffffff",
            weight: "bold",
            align: "center",
            margin: "md"
          },
          {
            type: "text",
            text: `隊長 ${leaderName} 提出出隊名單：`,
            size: "sm",
            color: "#aaaaaa",
            align: "center",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: memberList,
            size: "sm",
            color: "#ffffff",
            align: "start",
            margin: "md",
            wrap: true
          },
          {
            type: "text",
            text: `（需要 ${requiredPlayers} 人）`,
            size: "xs",
            color: "#C6A666",
            align: "center",
            margin: "sm"
          }
        ],
        backgroundColor: "#272946"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "button",
                action: {
                  type: "postback",
                  label: "✅ 同意",
                  data: `vote:${proposalId}:APPROVE`,
                  displayText: "我投票：同意"
                },
                style: "primary",
                color: "#4CAF50",
                flex: 1,
                height: "md"
              },
              {
                type: "button",
                action: {
                  type: "postback",
                  label: "❌ 反對",
                  data: `vote:${proposalId}:REJECT`,
                  displayText: "我投票：反對"
                },
                style: "primary",
                color: "#F44336",
                flex: 1,
                height: "md"
              }
            ]
          }
        ],
        backgroundColor: "#1a1c30"
      }
    };
  }

  /**
   * Create mission result announcement card
   */
  static createMissionResultCard(
    roundNumber: number,
    isSuccess: boolean,
    successCount: number,
    failCount: number,
    requiredPlayers: number
  ): FlexContainer {
    const resultText = isSuccess ? "成功" : "失敗";
    const resultEmoji = isSuccess ? "✅" : "❌";
    const backgroundColor = isSuccess ? "#1a3a2e" : "#3a1a1a";
    const accentColor = isSuccess ? "#4CAF50" : "#F44336";
    
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `${resultEmoji} 任務結果`,
            weight: "bold",
            size: "xl",
            color: accentColor,
            align: "center"
          }
        ],
        backgroundColor: backgroundColor,
        paddingAll: "md"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "第",
                size: "md",
                color: "#aaaaaa",
                flex: 0
              },
              {
                type: "text",
                text: `${roundNumber}`,
                size: "3xl",
                color: accentColor,
                weight: "bold",
                flex: 0,
                margin: "sm"
              },
              {
                type: "text",
                text: "輪",
                size: "md",
                color: "#aaaaaa",
                flex: 0
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "結果：",
                size: "md",
                color: "#aaaaaa",
                flex: 0
              },
              {
                type: "text",
                text: resultText,
                size: "2xl",
                color: accentColor,
                weight: "bold",
                flex: 1,
                margin: "sm"
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            margin: "lg",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "✅ 成功：",
                    size: "sm",
                    color: "#4CAF50",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: `${successCount} 票`,
                    size: "md",
                    color: "#ffffff",
                    weight: "bold",
                    flex: 1,
                    margin: "sm"
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "❌ 失敗：",
                    size: "sm",
                    color: "#F44336",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: `${failCount} 票`,
                    size: "md",
                    color: "#ffffff",
                    weight: "bold",
                    flex: 1,
                    margin: "sm"
                  }
                ]
              },
              {
                type: "text",
                text: `（需要 ${requiredPlayers} 人出隊）`,
                size: "xs",
                color: "#aaaaaa",
                align: "center",
                margin: "sm"
              }
            ]
          }
        ],
        backgroundColor: "#272946"
      }
    };
  }

  /**
   * Create usage guide card for friend users (not in group)
   * This card instructs users to add the bot to a group to play the game
   */
  static createUsageGuideCard(): FlexContainer {
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
            color: "#aa8f66",
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
            margin: "sm",
            color: "#aa8f66"
          }
        ],
        paddingAll: "10px",
        backgroundColor: "#1a1c30"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "md",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "歡迎使用阿瓦隆遊戲 Bot！",
                size: "md",
                color: "#ffffff",
                align: "center"
              },
              {
                type: "text",
                text: "本 Bot 需要在 LINE 群組中才能進行遊戲",
                size: "sm",
                color: "#ffffff",
                align: "center",
                wrap: true
              },
              {
                type: "separator",
                margin: "lg",
                color: "#444444"
              },
              {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      {
                        type: "text",
                        text: "1️⃣",
                        flex: 0,
                        size: "sm"
                      },
                      {
                        type: "text",
                        text: "建立或開啟一個 LINE 群組",
                        size: "sm",
                        color: "#ffffff",
                        margin: "sm",
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      {
                        type: "text",
                        text: "2️⃣",
                        flex: 0,
                        size: "sm"
                      },
                      {
                        type: "text",
                        text: "將此 Bot 加入群組",
                        size: "sm",
                        color: "#ffffff",
                        margin: "sm",
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      {
                        type: "text",
                        text: "3️⃣",
                        flex: 0,
                        size: "sm"
                      },
                      {
                        type: "text",
                        text: "在群組中輸入「開始遊戲」或「/start」",
                        size: "sm",
                        color: "#ffffff",
                        margin: "sm",
                        wrap: true
                      }
                    ]
                  }
                ]
              },
              {
                type: "separator",
                margin: "lg",
                color: "#444444"
              }
            ]
          }
        ],
        backgroundColor: "#1a1c30",
        paddingAll: "2px"
      }
    };
  }
}
