# Project Development Roadmap: AI Avalon Moderator

這份文件詳細列出了開發「AI 阿瓦隆法官」LINE Bot 的完整路徑。專案將分為五個主要階段進行，從基礎建設到完整的使用者體驗。

## Phase 1: 資料庫與基礎建設 (Database & Infrastructure)

**目標**: 建立穩固的資料儲存層，確保能記錄玩家資訊、遊戲狀態與對話歷史。

- [ ] **1. 定義 Prisma Schema**
  - 設計 `User` 模型：儲存 LINE ID、顯示名稱、大頭貼。
  - 設計 `Game` 模型：儲存遊戲狀態 (WAITING, PLAYING, FINISHED)、當前任務進度。
  - 設計 `Player` 模型：連結 User 與 Game，儲存該局的身分 (Role) 與陣營。
  - 設計 `Message` 模型：儲存對話紀錄 (Log)，包含 User 輸入與 Bot/AI 回覆。
- [ ] **2. 資料庫設定與遷移**
  - 設定 `DATABASE_URL` 環境變數。
  - 執行 `prisma migrate dev` 建立資料庫結構。
- [ ] **3. 基礎專案設定**
  - 確保 `.env` 檔案包含 LINE 與 OpenAI 的必要金鑰。
  - 設定 TypeScript 型別定義。

## Phase 2: LINE Bot 核心與 AI 串接 (Core Bot & AI)

**目標**: 讓機器人能夠接收訊息、記錄對話，並透過 AI 進行有角色的互動。

- [ ] **4. Webhook 實作**
  - 建立 `/api/webhook` 路由。
  - 實作 LINE Signature Validation (安全性驗證)。
  - 處理基本的 Webhook Event (MessageEvent, PostbackEvent)。
- [ ] **5. 訊息持久化 (Message Logging)**
  - 實作 `ChatService`。
  - 在收到使用者訊息時寫入 DB。
  - 在 Bot 回覆時寫入 DB。
- [ ] **6. OpenAI 整合**
  - 實作 `LLMService`。
  - 設計 System Prompt：「你現在是阿瓦隆的湖中女神...」。
  - 實作 Context Management：將最近 5 則對話紀錄帶入 Prompt。
  - 實作 Error Handling：當 AI 失敗時的優雅降級回應。

## Phase 3: 遊戲邏輯引擎 (Game Engine)

**目標**: 實作阿瓦隆的規則邏輯，不依賴前端介面也能運作。

- [ ] **7. 遊戲大廳系統**
  - 處理 `/join` (加入遊戲) 指令。
  - 處理 `/start` (開始遊戲) 指令，檢查人數是否符合規則 (6人局)。
- [ ] **8. 角色分配系統**
  - 實作 Fisher-Yates Shuffle 演算法進行隨機分配。
  - 根據人數配置對應角色 (例如 6人: 梅林, 派西維爾, 忠臣x2 vs 莫甘娜, 刺客)。
- [ ] **9. 遊戲狀態機 (State Machine)**
  - 管理當前階段：`TeamBuild` (組隊) -> `Voting` (投票) -> `Mission` (任務) -> `Assassination` (刺殺)。
  - 記錄每個任務的結果 (成功/失敗)。

## Phase 4: LIFF 前端介面 (Frontend & LIFF)

**目標**: 利用 LIFF 解決「私密資訊」顯示與操作的問題。

- [ ] **10. LIFF 整合**
  - 在 Next.js 頁面中引入 LIFF SDK。
  - 實作 `useLiff` Hook 處理初始化與 User Profile 獲取。
- [ ] **11. 身分查看頁面 (/game/role)**
  - 透過 LIFF 取得 User ID。
  - 呼叫 API 查詢當前遊戲的角色。
  - 顯示對應的角色卡片 (梅林看到壞人、派西維爾看到梅林/莫甘娜)。
- [ ] **12. 任務行動頁面 (/game/mission)**
  - 僅限當前任務的執行者進入。
  - 提供「任務成功」與「任務失敗」卡片供選擇。
  - 確保壞人才能出「失敗」，好人強制出「成功」。

## Phase 5: 管理後台 (Admin Dashboard)

**目標**: 滿足作業要求，提供可視化的數據監控介面。

- [ ] **13. 後台 API**
  - 建立 `/api/admin/stats`：回傳總局數、今日訊息量。
  - 建立 `/api/admin/logs`：回傳分頁的對話紀錄。
- [ ] **14. Dashboard UI**
  - 使用 Tailwind CSS 刻畫簡單的儀表板。
  - 顯示即時訊息列表 (Live Logs)。
  - 提供基本的篩選功能 (依 User ID 或日期)。

---

### 開發順序建議

建議依照 **Phase 1 -> Phase 2 -> Phase 5 -> Phase 3 -> Phase 4** 的順序進行。
先確保 **資料庫** 與 **Bot 基礎對話/Log** 功能正常 (滿足 Must Have)，再進行複雜的遊戲邏輯與 LIFF 開發。

