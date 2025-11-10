# Pusher 設定指南

本指南將幫助你設定 Pusher 以啟用即時更新功能。

## 步驟 1: 註冊 Pusher 帳號

1. 前往 [Pusher 官網](https://pusher.com/)
2. 點擊右上角的 "Sign up" 註冊新帳號
3. 可以使用 GitHub、Google 帳號快速註冊，或使用 Email 註冊

## 步驟 2: 建立 Channels App

1. 登入後，前往 [Dashboard](https://dashboard.pusher.com/)
2. 點擊 "Create app" 或 "Channels apps" > "Create Channels app"
3. 填寫應用程式資訊：
   - **App name**: 輸入應用程式名稱（例如：`mp-app`）
   - **Cluster**: 選擇最接近你伺服器位置的 cluster（例如：`ap3` 適合亞太地區）
   - **Front-end tech**: 選擇 "React"
   - **Back-end tech**: 選擇 "Node.js"
4. 點擊 "Create app"

## 步驟 3: 取得憑證

建立應用程式後，你會看到 "Keys" 頁面，包含以下資訊：

- **App ID**: 應用程式 ID
- **Key**: 公開金鑰（用於客戶端）
- **Secret**: 私密金鑰（用於伺服器端，**不要分享**）
- **Cluster**: 你選擇的 cluster（例如：`ap3`）

**重要**：請妥善保管 Secret，不要將它提交到公開的程式碼庫中。

## 步驟 4: 設定環境變數

### 開發環境

在你的專案根目錄建立或編輯 `.env.dev` 檔案：

```env
# Pusher Configuration
PUSHER_APP_ID=your-app-id-here
PUSHER_KEY=your-key-here
PUSHER_SECRET=your-secret-here
PUSHER_CLUSTER=ap3

# Client-side Pusher (必須使用 NEXT_PUBLIC_ 前綴)
NEXT_PUBLIC_PUSHER_KEY=your-key-here
NEXT_PUBLIC_PUSHER_CLUSTER=ap3
```

**注意**：
- `PUSHER_KEY` 和 `NEXT_PUBLIC_PUSHER_KEY` 使用相同的值（Key）
- `PUSHER_CLUSTER` 和 `NEXT_PUBLIC_PUSHER_CLUSTER` 使用相同的值（Cluster）
- `NEXT_PUBLIC_` 前綴的變數會暴露給瀏覽器，所以只能放公開資訊

### 生產環境（Vercel）

1. 前往 Vercel Dashboard
2. 選擇你的專案
3. 前往 **Settings** > **Environment Variables**
4. 新增以下環境變數：

| Name | Value | Environment |
|------|-------|-------------|
| `PUSHER_APP_ID` | 你的 App ID | Production, Preview, Development |
| `PUSHER_KEY` | 你的 Key | Production, Preview, Development |
| `PUSHER_SECRET` | 你的 Secret | Production, Preview, Development |
| `PUSHER_CLUSTER` | 你的 Cluster（例如：`ap3`） | Production, Preview, Development |
| `NEXT_PUBLIC_PUSHER_KEY` | 你的 Key（與 PUSHER_KEY 相同） | Production, Preview, Development |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | 你的 Cluster（與 PUSHER_CLUSTER 相同） | Production, Preview, Development |

**重要**：
- 確保所有環境變數都已設定（Production、Preview、Development）
- 設定完成後，需要重新部署專案才會生效

## 步驟 5: 驗證設定

### 檢查 Server-side 設定

啟動開發伺服器後，檢查 console 是否有 Pusher 相關的警告訊息：

- **如果看到警告**：表示 Pusher 未正確配置
- **如果沒有警告**：表示 Pusher 已正確配置

### 檢查 Client-side 設定

1. 開啟瀏覽器的開發者工具（F12）
2. 前往 Console 標籤
3. 如果看到 "Pusher credentials not configured" 警告，表示客戶端環境變數未設定
4. 如果沒有警告，表示設定正確

### 測試即時功能

1. 開啟兩個瀏覽器視窗（或使用無痕模式）
2. 兩個視窗都登入並開啟首頁
3. 在一個視窗中按讚或轉發一篇貼文
4. 另一個視窗應該會即時看到計數更新（不需要重新整理）

## 常見問題

### Q: 為什麼需要兩個不同的環境變數（PUSHER_KEY 和 NEXT_PUBLIC_PUSHER_KEY）？

A: Next.js 的環境變數有兩種：
- **Server-side**：只在伺服器端可用（`PUSHER_KEY`）
- **Client-side**：會暴露給瀏覽器（`NEXT_PUBLIC_PUSHER_KEY`）

由於 Pusher 需要在客戶端建立 WebSocket 連線，所以需要 `NEXT_PUBLIC_` 前綴的變數。

### Q: Pusher 免費方案有什麼限制？

A: Pusher 提供免費方案（Sandbox）：
- 最多 100 個同時連線
- 每天最多 200,000 條訊息
- 單一頻道最多 10 個訂閱者

對於開發和小型應用程式來說通常足夠。如果需要更多，可以升級到付費方案。

### Q: 如何選擇 Cluster？

A: 選擇最接近你伺服器位置的 cluster：
- `ap3`：亞太地區（新加坡）
- `us2`：美國東部
- `us3`：美國西部
- `eu`：歐洲
- `ap1`：亞太地區（孟買）
- `ap2`：亞太地區（雪梨）

選擇錯誤的 cluster 不會導致錯誤，但可能會增加延遲。

### Q: 設定完成後還是沒有即時更新？

A: 檢查以下幾點：
1. 確認所有環境變數都已正確設定
2. 確認已重新啟動開發伺服器（或重新部署）
3. 檢查瀏覽器 Console 是否有錯誤訊息
4. 檢查 Network 標籤，確認 WebSocket 連線是否成功建立
5. 確認 Pusher Dashboard 中的 "Debug Console" 是否有收到事件

### Q: 如何查看 Pusher 事件日誌？

A: 在 Pusher Dashboard 中：
1. 選擇你的應用程式
2. 前往 "Debug Console" 標籤
3. 這裡會顯示所有即時事件和連線狀態

## 安全注意事項

1. **永遠不要**將 `PUSHER_SECRET` 提交到 Git 或公開的程式碼庫
2. 使用 `.env` 檔案管理本地開發環境變數，並確保 `.env` 在 `.gitignore` 中
3. 在 Vercel 等部署平台使用環境變數設定，而不是硬編碼在程式碼中
4. 定期輪換 Secret（在 Pusher Dashboard 中可以重新產生）

## 下一步

設定完成後，你的應用程式將具備以下即時功能：
- ✅ 即時按讚/取消讚更新
- ✅ 即時轉發/取消轉發更新
- ✅ 即時新回覆通知
- ✅ 即時新貼文通知

享受即時互動的體驗！

