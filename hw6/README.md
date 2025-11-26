# AI Avalon Moderator (AI 阿瓦隆法官)

一個整合 Line Messaging API 與 OpenAI 的智慧阿瓦隆桌遊法官機器人。

---

## ❗ Copyright and Ownership Notice

<aside>

關於這個 notion page 以及其包含的所有 pages （以下統稱「本 page」），其著作權與所有權是屬於台大電機系黃鐘揚教授以及其所開設的網路服務程式設計課程之所有助教 (以下統稱「作者們」) 所擁有。

基於推廣技術與服務大眾之精神，本 page 採取 MIT 授權，即任何人皆可因任何目的使用、複製、修改、發布、與再散佈本 page，包括商業用途。不需簽署協議，也不需支付授權費，惟任何的使用與散佈必須包含本著作權與所有權聲明。如有違反本著作權與所有權聲明，本 page 之作者們仍保有相關的法律追朔權利。詳細關於 MIT 授權的規範請見 [OSI 官網](https://opensource.org/license/mit)。

本 page 之內容以「現狀」提供 (provided "as-is")，不附帶任何保證。對於本 page 之內容如有任何疑問或是建議，請來信 [eewebprogramming@googlegroups.com](mailto:eewebprogramming@googlegroups.com).

The copyright and ownership of this Notion page and all pages it contains (hereinafter referred to as "this page") belongs to Professor Chung-Yang Huang of Department of Electrical Engineering, National Taiwan University, and all teaching assistants of this Web Programming course that he teaches.

In the spirit of promoting technology and serving the public, this page adopts the MIT License, meaning anyone can use, copy, modify, publish, and redistribute this page for any purpose, including commercial use. No agreement needs to be signed, and no licensing fee needs to be paid, provided that any distribution must include this copyright and ownership notice. In case of violation of this copyright and ownership notice, the authors of this page still retain the relevant legal right to take retroactive action. For detailed regulations regarding the MIT License, please see the [OSI official website](https://opensource.org/license/mit).

The content of this page is provided "as-is", without any warranty. If you have any questions or suggestions regarding the content of this page, please email [eewebprogramming@googlegroups.com](mailto:eewebprogramming@googlegroups.com).

</aside>

<aside>

🌐 [Web Programming Home](https://www.notion.so/114-1-NTU-Web-Programming-2590e6ef61828035b34dc965adc04382?pvs=21)

</aside>

---

## 部署連結 (Deployment)

- **LINE Bot ID**: `@715dlzwy`
- **Line Bot URL / QR Code**: [請填入你的 Line Bot 加好友連結]
- **管理後台 (Admin Dashboard)**: `[請填入你的 Vercel 部署網址]/admin`
  - *請確保在 .env 中設定了正確的 LINE 與 OpenAI 金鑰以使後台功能正常運作*

## 專案簡介 (Introduction)

本專案是一個基於 Next.js 開發的 LINE Bot，旨在擔任桌遊《阿瓦隆 (Avalon)》的自動化法官。透過 LINE Messaging API 處理群組互動，LIFF (LINE Front-end Framework) 提供視覺化的遊戲大廳與身份卡，並結合 OpenAI 的 LLM 技術，讓 AI 扮演「湖中女神」引導遊戲進行並回答規則問題。

詳細的對話與功能設計請參考根目錄下的：[chatbot-design.md](./chatbot-design.md)

## 功能列表 (Features)

### 核心功能 (Must Have)
- [x] **Line Bot 對話/功能設計**：完整設計了「湖中女神」角色，包含主題、功能列表、對話腳本與 LLM Prompt Template。
- [x] **Line Bot Server**：
    - 串接 Messaging API 接收 Webhook 事件。
    - 實作遊戲大廳、加入遊戲、開始遊戲等邏輯。
    - 結合 OpenAI 判斷使用者意圖並生成適當回應。
- [x] **Line Bot 設定**：支援 Webhook 驗證與 Line 官方帳號設定。
- [x] **資料庫整合**：使用 PostgreSQL + Prisma 完整記錄使用者資訊、遊戲狀態 (Game/Player/Round) 與對話歷程 (Message)。
- [x] **基礎管理後台**：提供 Web 介面 (/admin)，可即時檢視對話紀錄、使用者統計與遊戲場次數據。
- [x] **錯誤處理**：
    - LLM 服務失效時提供優雅降級 (Graceful Degradation) 回覆。
    - LIFF 錯誤處理與引導。
- [x] **即時更新**：管理後台具備 Polling 機制，可即時顯示最新訊息。

### 技術特點
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **AI Integration**: OpenAI API (GPT-4o / GPT-3.5-turbo)
- **Platform**: Vercel Deployment
- **Styling**: Tailwind CSS
- **Validation**: Zod Schema Validation

## 環境設定與本地開發 (Setup & Development)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL Database (Local or Cloud like Supabase/Neon)
- LINE Developer Account (Messaging API Channel & Login Channel for LIFF)
- OpenAI API Key

### 2. Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd hw6
   ```

2. **Install Dependencies**
   ```bash
   make install
   # or
   npm install
   ```

3. **Environment Variables**
   複製 `.env.example` 為 `.env` 並填入以下資訊：
   ```bash
   cp .env.example .env
   ```
   
   需要設定的關鍵變數：
   - `DATABASE_URL`: PostgreSQL 連線字串
   - `LINE_CHANNEL_ACCESS_TOKEN`: Messaging API Token
   - `LINE_CHANNEL_SECRET`: Messaging API Secret
   - `NEXT_PUBLIC_LINE_LIFF_ID`: LIFF App ID (用於 LIFF 頁面)
   - `OPENAI_API_KEY`: OpenAI API Key

### 3. Database Setup

```bash
# Generate Prisma Client
make db-generate

# Push Schema to DB
make db-push
```

### 4. Start Development Server

```bash
make dev
```
Server 將啟動於 `http://localhost:3000`。

### 5. Local Webhook Testing (Optional)
若要在本地測試 LINE Bot，需使用 ngrok 將本地 port 暴露至網際網路：
```bash
ngrok http 3000
```
然後將 ngrok 產生的 HTTPS URL (例如 `https://xxxx.ngrok.io/api/webhook`) 填入 LINE Developer Console 的 Webhook URL 欄位。

## Make Commands

本專案提供 Makefile 簡化常用指令：

- `make dev`: 啟動開發伺服器
- `make build`: 建置專案
- `make start`: 啟動 Production 伺服器
- `make lint`: 執行 ESLint
- `make db-studio`: 開啟 Prisma Studio 檢視資料庫
- `make db-push`: 同步資料庫 Schema
