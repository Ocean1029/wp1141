# 部署指南 - Vercel

本指南將幫助你將專案部署到 Vercel。

## 前置準備

### 1. 準備資料庫

Vercel 不提供 PostgreSQL 資料庫，你需要使用外部服務：

**推薦選項：**
- **Vercel Postgres**（最簡單，與 Vercel 整合）
- **Supabase**（免費方案可用）
- **Neon**（免費方案可用）
- **Railway**（免費方案可用）
- **PlanetScale**（MySQL，需要調整 Prisma schema）

### 2. 準備 OAuth 應用程式

確保你已經在以下平台建立 OAuth 應用程式：

- **Google**: [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub**: [GitHub Developer Settings](https://github.com/settings/developers)
- **Facebook**: [Facebook Developers](https://developers.facebook.com/)

**重要**：在 OAuth 應用程式中設定正確的回調 URL：
- 開發環境：`http://localhost:3000/api/auth/callback/[provider]`
- 生產環境：`https://your-domain.vercel.app/api/auth/callback/[provider]`

### 3. 準備 Pusher 帳號

1. 前往 [Pusher](https://pusher.com/) 註冊帳號
2. 建立新的 Channels app
3. 記下以下資訊：
   - App ID
   - Key
   - Secret
   - Cluster（例如：ap3）

## 部署步驟

### 步驟 1: 準備 GitHub Repository

```bash
# 確保所有變更都已提交
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 步驟 2: 在 Vercel 建立專案

1. 前往 [Vercel](https://vercel.com/) 並登入
2. 點擊 "Add New Project"
3. 選擇你的 GitHub repository
4. 選擇專案

### 步驟 3: 設定環境變數

在 Vercel 專案設定中，前往 **Settings > Environment Variables**，新增以下變數：

#### 資料庫
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

#### NextAuth
```env
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-random-secret-key-here"
```

**產生 NEXTAUTH_SECRET**：
```bash
openssl rand -base64 32
```

#### OAuth - Google
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### OAuth - GitHub
```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### OAuth - Facebook
```env
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

#### Pusher
```env
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="ap3"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
```

### 步驟 4: 設定 Build 設定

在 Vercel 專案設定中，前往 **Settings > General > Build & Development Settings**：

**Build Command:**
```bash
npx prisma generate && npm run build
```

**Install Command:**
```bash
npm install
```

**Output Directory:**
```
.next
```

### 步驟 5: 設定 Prisma

Vercel 需要在 build 時執行 Prisma migrations。有兩種方式：

#### 方式 A: 使用 Post-Deploy Hook（推薦）

1. 在專案根目錄建立 `vercel.json`：

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm install"
}
```

2. 在 Vercel 設定中，前往 **Settings > Git**，新增 **Post-Deploy Hook**：

```bash
npx prisma migrate deploy
```

#### 方式 B: 手動執行 Migrations

在第一次部署後，連接到你的資料庫並手動執行：

```bash
npx prisma migrate deploy
```

或者使用 Prisma Studio：
```bash
npx prisma studio
```

### 步驟 6: 部署

1. 點擊 "Deploy" 按鈕
2. 等待建置完成
3. 檢查部署日誌是否有錯誤

### 步驟 7: 執行資料庫 Migrations

部署完成後，你需要執行 Prisma migrations：

**選項 1: 使用 Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
```

**選項 2: 直接連接到資料庫**
```bash
# 使用你的 DATABASE_URL
DATABASE_URL="your-database-url" npx prisma migrate deploy
```

**選項 3: 使用 Prisma Studio**
```bash
DATABASE_URL="your-database-url" npx prisma studio
# 然後在 UI 中執行 migrations
```

## 部署後檢查清單

- [ ] 資料庫 migrations 已執行
- [ ] 環境變數都已設定
- [ ] OAuth 回調 URL 已更新為生產環境 URL
- [ ] 網站可以正常訪問
- [ ] 登入功能正常運作
- [ ] 資料庫連線正常
- [ ] Pusher 即時功能正常

## 常見問題

### 問題 1: Build 失敗 - Prisma Client 未生成

**解決方案**：確保 Build Command 包含 `npx prisma generate`

### 問題 2: 資料庫連線錯誤

**解決方案**：
- 檢查 `DATABASE_URL` 是否正確
- 確認資料庫允許來自 Vercel IP 的連線
- 檢查 SSL 設定（通常需要 `?sslmode=require`）

### 問題 3: OAuth 回調失敗

**解決方案**：
- 確認 OAuth 應用程式中的回調 URL 設定為 `https://your-domain.vercel.app/api/auth/callback/[provider]`
- 檢查 `NEXTAUTH_URL` 是否正確

### 問題 4: 環境變數未生效

**解決方案**：
- 確認環境變數已設定在正確的環境（Production/Preview/Development）
- 重新部署專案

## 使用 Vercel Postgres（推薦）

如果你使用 Vercel Postgres，設定會更簡單：

1. 在 Vercel 專案中，前往 **Storage** tab
2. 點擊 "Create Database" > "Postgres"
3. Vercel 會自動設定 `DATABASE_URL` 環境變數
4. 在 **Settings > Environment Variables** 中確認 `DATABASE_URL` 已自動新增

## 持續部署

Vercel 會自動監控你的 GitHub repository，當你 push 新的 commit 時會自動重新部署。

## 監控和日誌

- **Deployments**: 在 Vercel dashboard 查看部署歷史
- **Logs**: 點擊每個 deployment 可以查看建置和運行日誌
- **Analytics**: 在 **Analytics** tab 查看網站流量和效能

## 更新部署

每次更新程式碼後：

1. Push 到 GitHub
2. Vercel 會自動觸發新的部署
3. 如果有資料庫 schema 變更，記得執行 migrations：
   ```bash
   npx prisma migrate deploy
   ```

## 參考資源

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/providers/oauth)

