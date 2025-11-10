# Project Plan

整體專案旨在八週內打造一個以 Next.js（基於 React 的全端框架，能同時處理伺服端和客端渲染以及 API 路由）為核心的社群平台，提供使用者從 OAuth（使用第三方身份提供者授權登入的協定）登入到發文、互動、追蹤與個人檔案管理的完整體驗。產品定位為 X 的精簡版，聚焦在登入、貼文、即時互動以及個人首頁兩大情境，並在初版刻意排除長文、影音、進階推薦與通知等功能，以確保範圍可控並能順利於 Vercel（提供伺服器與部署自動化的雲端平台）部署。整體系統從登入後的 userID 註冊流程出發，連貫至 Home feed 的瀏覽、貼文發布、社交互動與個人檔案的編輯，形成可被驗證的最小可行產品。

## 系統架構與技術堆疊

整個平台採單一 Next.js App Router（Next.js 13 以後提供的路由系統，允許 Server Component 與 Client Component 混合運作）的專案結構，由 Server Component 負責資料讀取，Client Component 處理點擊、表單等互動。一切資料存取透過 Prisma（物件關聯映射工具，能將 TypeScript 型別與資料庫 schema 保持同步）操作 PostgreSQL（關聯式資料庫，具備交易與索引能力），建議選用 Neon 或 Supabase 這類託管式服務以享受自動備援與備份。身份驗證交給 NextAuth（支援多種登入策略的 Next.js 驗證框架），整合 Google、GitHub、Facebook 三種提供者。即時互動使用 Pusher（託管式 WebSocket 服務，能在伺服端廣播事件給所有連線客戶端），確保按愛心與留言即時同步。頭像與背景圖等檔案可存放在 Vercel Blob（Vercel 的物件儲存方案）或 Supabase Storage。環境切分為 dev、本機開發；preview、Pull Request 自動部署；prod、正式環境。

## 資料模型與業務邏輯

資料層核心為 User、Post、Like、Repost、Follow 五個模型，再加上 Post 的 parentId 建立遞迴結構以支援留言。User 模型紀錄 userId、姓名、email、頭像、登入 provider 等欄位，其中 userId 在首次登入後由使用者輸入並以正規表達式 `^[a-z0-9](?:_?[a-z0-9]){2,19}$` 驗證，確保長度 3 至 20、以英數字開頭且底線不連續。Post 模型保存貼文文字、作者、是否為草稿、parentId 與互動計數（replyCount、repostCount、likeCount），這些計數在伺服端以交易更新避免不同請求造成資料偏移。Like 與 Repost 模型透過唯一索引限制同一使用者對同一貼文只能存在一筆紀錄，從而用刪除或新增模擬 toggling 行為。Follow 模型記錄 follower 與 following 的雙向關係，支援 Following feed 查詢與統計。

```
model Post {
  id          String   @id @default(cuid())
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  text        String   @db.Text
  isDraft     Boolean  @default(false)
  parentId    String?
  parent      Post?    @relation("PostThread", fields: [parentId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  replies     Post[]   @relation("PostThread")
  reposts     Repost[]
  likes       Like[]
  replyCount  Int      @default(0)
  repostCount Int      @default(0)
  likeCount   Int      @default(0)
  deletedAt   DateTime?
}
```

首次登入流程為：使用者透過任一 OAuth provider 完成認證後，被導向 userID 註冊頁面；輸入通過驗證後寫入 User 模型並建立 Session。Session 採用 JWT（JSON Web Token，一種可攜帶簽章的無狀態憑證格式）策略，設定一小時存活並搭配靜默續期；伺服端在執行 Server Action 之前會驗證 Session 是否有效，並根據登入者身份控制授權。草稿與正式貼文共用同一張表，差異只在 isDraft 欄位，讓草稿列表能快速載入。

## 功能模組與流程

Home 頁面是整體使用者旅程的核心，提供 All 與 Following 兩種 feed。All feed 顯示所有公開貼文，Following feed 透過 Follow 關係查詢追蹤對象的貼文與再分享。列表頂部提供 inline 發文區，當使用者聚焦輸入框時展開完整的發文布局，能直接套用與主 Post Modal 相同的字數檢查與連結解析。字數規則遵循 280 字上限、URL 統一計 23 字、Hashtag（以 # 開頭的標記，常用於主題分類）與 Mention（以 @ 開頭引用其他使用者的語法）不列入計數，前端使用 linkifyjs（能在文字中偵測 URL 的工具套件）與正規表達式進行解析，伺服端再度驗證避免被繞過。草稿行為支援儲存與捨棄確認：捨棄時彈出 ConfirmDiscardDialog，允許 Save-as-draft 或完全刪除。

Profile 頁面分為「本人編輯」與「他人唯讀」兩種狀態。本人檢視時，背景圖右下角顯示 Edit Profile 按鈕，開啟 EditProfileDialog 供使用者更新頭像、背景圖、簡介、外部連結。當瀏覽他人檔案時，按鈕改為 Follow 或 Following，並隱藏 Likes 頁籤以符合需求。頁面上將顯示貼文數、追蹤數、追蹤中數以及貼文列表，Posts 頁籤列出使用者的貼文與再分享，Likes 頁籤僅本人可見並列出愛心過的貼文。點擊貼文或留言會進入 ThreadView，這是一個遞迴路由畫面，左上角提供返回上一層的箭頭與 Post 標題。

## 介面設計與元件命名

整體介面採左右雙欄布局：左欄為 SideNav，右欄為主內容。SideNav 包含自訂品牌圖示、Home、Profile、Post 按鈕以及使用者頭像區塊，所有圖示皆使用 Lucide（開源的向量圖示庫，與 Feather Icons 的 API 相容）提供的 React 元件。Post 按鈕使用亮色主題凸顯為主要行動，其他項目在 hover 時以亮度微調提示互動狀態。樣式遵循 BEM（Block Element Modifier，具層級結構的 CSS 命名規範）命名，例如 `layout__sidenav`、`post-card__footer`、`btn--primary`，確保可讀性與可維護性。共用元件拆分為 SideNav、ComposeBar、PostModal、PostCard、ThreadView、ProfileHeader、EditProfileDialog、ConfirmDiscardDialog 等，並以 shadcn/ui（基於 Radix UI 的 React 元件集合）結合 Tailwind CSS 打造統一視覺。

## 即時互動與事件設計

為達成按愛心、留言、再分享的即時同步，每篇貼文會對應一個 `post-{postId}` Pusher channel。當使用者在瀏覽器 A 按下愛心，伺服端會以交易更新資料庫中的 Like 紀錄與 likeCount，再透過 Pusher 發送 `like:updated` 事件給對應 channel。其他客端收到事件後，只更新該 PostCard 的互動計數，不重繪整個列表，避免打斷正在閱讀的使用者。留言與再分享同樣發送 `reply:created`、`repost:updated` 等事件。若有新貼文出現，Home feed 會收到 `post:new` 事件並在列表上方顯示提示列，例如 “New posts available”，由使用者自行決定何時載入，以維持閱讀連續性。未來若流量倍增，可評估以 Redis（高效的記憶體內資料存放與訊息佇列系統）搭配 Pub/Sub 自建替代方案。

## 安全控管與資料一致性

所有帶副作用的操作，例如發文、刪文、按愛心、追蹤，皆在伺服端執行並由 Session 驗證授權。刪除動作僅限原作者對原創貼文執行，Repost 由於只是引用連結不允許刪除。系統會對發文、留言、互動設置 Rate Limiting（速率限制機制，用於防止濫發或機器人攻擊），可以根據 userId 與 IP 計錄每分鐘次數，超標則暫停操作。輸入資料在儲存前進行字數與字元白名單檢查，渲染時進行 HTML escape（將特殊字元轉換為安全符號的流程）以避免 XSS（Cross-Site Scripting，攻擊者注入惡意腳本竊取資料或篡改畫面）。互動計數的同步利用 Prisma Transaction 保持原子性，確保 replyCount、likeCount、repostCount 與實際紀錄一致。

## 部署流程與營運策略

部署流程以 Vercel 的 CI/CD 為核心：每個 Pull Request 會觸發 Preview Deployment，用於產品、設計與 QA 驗證；合併至 main 後自動部署到 prod。資料庫 migration 採 Prisma Migrate，CI 先執行 `prisma migrate diff` 作為 dry-run，正式環境再由工程師確認後執行，以避免破壞性變更。錯誤監控使用 Sentry（跨平台錯誤追蹤服務，可提供 stack trace 與使用者上下文），流量與互動統計則啟用 Vercel Analytics。每日對資料庫進行備份並保留七日，若使用 Supabase Storage 儲存檔案也啟用版本管理。環境變數如 `NEXTAUTH_SECRET`、`GOOGLE_CLIENT_ID` 透過 Vercel 專案設定維護，避免硬編碼在程式碼庫中。

## 測試策略與品質控管

單元測試選用 Vitest（與 Vite 深度整合的測試框架，語法與 Jest 類似），涵蓋字數計算、URL 解析、Like 與 Follow 的 toggling 邏輯、Draft 儲存與 Pusher 事件資料整合。端對端測試使用 Playwright（可全自動操作瀏覽器並驗證使用者旅程的工具），跑過登入、發文、留言、按愛心、刪文、編輯個人檔案等關鍵流程。靜態分析交給 ESLint（JavaScript/TypeScript 程式風格與錯誤檢查工具）與 Prettier（程式碼格式化工具），並透過 Husky（Git hook 管理工具）與 lint-staged（在 staged 檔案執行 lint 與測試的工具）在 commit 前自動跑檢查。若時間允許，可導入 Storybook（元件展示與範例平台）檢視 UI 變更，確保視覺一致性。

## 里程碑與時程安排

第一階段（週一至週二）完成登入閉環與 All Feed，包括 OAuth、userID 註冊、Session 管理、基本貼文建立與列表呈現，確保能演示「登入、發文、瀏覽」的端到端流程。第二階段（週三至週五）聚焦個人檔案與社交關係，實作 Profile 編輯、Follow/Unfollow、Following feed、Drafts 列表、Hashtag 與 Mention 高亮與導向。第三階段（週六至週七）導入遞迴留言、Pusher 即時互動、刪除貼文與列表留言顯示，同時確保路由遞迴與返回導覽順暢。最後一週進行 Hardening（系統加固：針對速率限制、UX 微調、告警設定、資料庫索引與壓力測試的整備），最終完成 Vercel 正式部署並驗證登入流程。

## 風險評估與緩解策略

主要風險包含 OAuth 供應商審核與設定複雜度，特別是 Facebook 可能需要較長的審核時間；建議先完成 Google 與 GitHub，Facebook 並行申請並預留 Buffer。遞迴留言在展開多層時可能造成效能問題，初版可限制最大展開層數並採延遲載入策略，必要時進行虛擬捲動優化。Pusher 的連線成本需重點監控，可在事件數量與頻寬接近上限時評估升級方案或導入自架 WebSocket 伺服器。資料安全部分，定期演練備份還原流程並設定告警，避免資料遺失。若未來流量大增，再評估加入 Redis 以提供快取與 Pub/Sub 能力，或導入 CDN 優化靜態資產傳遞。

