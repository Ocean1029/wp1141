# AI Avalon Moderator - Chatbot Design Document

本文件詳細說明「AI 阿瓦隆法官」LINE Bot 的對話設計、功能架構與系統邏輯，旨在滿足作業中對於 chatbot 設計文件的要求。

## 1. 主題與核心概念

**主題**：阿瓦隆 (Avalon) 桌遊 AI 法官
**角色設定**：湖中女神 薇薇安 (Viviane)
**核心價值**：
透過 AI 與自動化流程，解決阿瓦隆遊戲中「上帝視角」法官的需求，讓所有玩家都能參與遊戲（不需要一人當法官而無法遊玩），並透過沉浸式的角色扮演增添遊戲樂趣。

## 2. 功能列表

### 2.1 基礎對話功能
- **規則諮詢**：玩家可隨時詢問阿瓦隆規則，AI 以湖中女神口吻回答。
- **遊戲引導**：AI 根據對話脈絡判斷是否需要介入引導（例如提醒投票、解釋角色能力）。
- **閒聊過濾**：AI 會自動判斷訊息相關性，過濾掉與遊戲無關的閒聊，避免洗版干擾遊戲進行。

### 2.2 遊戲流程管理 (Game Flow)
- **遊戲大廳 (Lobby)**：透過 LIFF 介面管理玩家加入、離開與準備狀態。
- **身份分配 (Role Assignment)**：遊戲開始後，透過私密 LIFF 頁面發送身份卡，確保資訊隱密。
- **即時遊戲狀態**：
  - 自動判斷遊戲人數 (5-10人) 並套用對應規則板型。
  - 記錄任務勝敗、投票結果。
  - 處理刺客刺殺階段與勝負判定。

### 2.3 後台管理系統
- **即時監控**：管理員可查看即時對話日誌與遊戲狀態。
- **數據統計**：統計總遊戲場次、活躍用戶數與訊息量。

## 3. 對話腳本與流程設計

系統結合了 **Rule-based (規則式)** 與 **AI-based (生成式)** 兩種回應模式，以達到最佳的使用者體驗與穩定性。

### 3.1 關鍵字指令 (Rule-based)

為了確保遊戲核心功能的準確性，以下操作採用精確匹配或關鍵字觸發：

| 使用者輸入 | Bot 回應 / 行為 | 形式 |
|-----------|----------------|------|
| `/start`, `/open`, `我要玩阿瓦隆` | 發送「遊戲大廳」入口卡片 | Flex Message |
| `/rules`, `規則說明` | 發送「規則說明」卡片 | Flex Message |
| (加入群組時) | 發送「歡迎來到阿瓦隆」歡迎訊息 | Flex Message |

### 3.2 AI 判斷與回應 (AI-based)

系統使用 LLM 進行兩階段處理：

1. **意圖分類 (Intent Classification)**：
   - 判斷使用者是否意圖「開啟遊戲」（如輸入「開局」、「來玩吧」）。
   - 判斷使用者訊息是否「需要回應」（過濾掉 "OK", "好", 投票訊息等無意義雜訊）。

2. **角色扮演回應 (Role-play Response)**：
   - 若判定需要回應，則將對話歷史 (Context) 傳送給 LLM。
   - LLM 根據 System Prompt 以「湖中女神」身份回應。

### 3.3 LIFF 互動流程 (In-App Browser)

為了處理複雜的遊戲狀態，避免對話視窗過於混亂，核心遊戲操作移至 LIFF 網頁執行：

1. **加入遊戲**：點擊 Flex Message 中的「進入大廳」 -> 開啟 LIFF 大廳頁面 -> 點擊「加入」 -> 頭像顯示於列表。
2. **查看身份**：遊戲開始 -> Bot 發送「查看身份」連結 -> 開啟 LIFF 角色卡 -> 點擊翻轉卡片查看角色與隊友資訊。

## 4. LLM Prompt 設計

### 4.1 System Prompt (角色設定)

```plaintext
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
```

### 4.2 Classifier Prompt (意圖判斷)

為了節省 Token 並避免 AI 過度插話，使用輕量級模型 (gpt-4o-mini) 進行分類：

```plaintext
You are a classifier for the Avalon game bot. 
Determine if the user's message requires a response.

It requires a response if:
1. The user is asking a question about Avalon rules, roles, or gameplay.
2. The user is directly addressing the bot.

It DOES NOT require a response if:
1. The user is just chatting with other players.
2. The message is short and unrelated.

Return strictly 'TRUE' or 'FALSE'.
```

## 5. 資料庫設計

系統使用 PostgreSQL 儲存所有資料，確保遊戲歷程可追溯。

- **User**: 儲存 Line User ID, Display Name, 頭像。
- **Game**: 儲存遊戲狀態 (WAITING, PLAYING, FINISHED)、玩家列表、當前局勢。
- **Message**: 儲存完整對話紀錄 (包含 Sender, Content, Token Usage)。
- **Role/Player**: 關聯 User 與 Game，記錄該局身份與陣營。

## 6. 錯誤處理與降級策略

- **LLM 服務中斷**：若 OpenAI API 回應失敗，Bot 會回覆預設訊息：「（湖面泛起漣漪，女神的聲音似乎被迷霧遮蔽了... 請稍後再試）」，確保程式不會崩潰。
- **LIFF 初始化失敗**：若在非 Line 環境開啟 LIFF 頁面，會顯示錯誤提示並引導使用者回到 Line App。
- **非預期輸入**：對於無法解析的指令，Bot 保持沈默，避免干擾群組對話。

