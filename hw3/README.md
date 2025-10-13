# 📔 Sisyphean

> *一個結合 AI 主題分類的反思日記應用程式*

Sisyphean 是一個全端網頁應用程式，協助使用者記錄日常思緒與情緒，並透過 AI 驅動的自動分段與主題分類，進行更深層的自我反思。

![Picture1.png](Picture1.png)

在 Diaries 頁面中，你可以像是用 Apple Notes 一樣，在側邊欄中用 + 號創建 Notes 和資料夾，在上面隨意的紀錄你的想法，你每次打字時，隔一小段時間沒有其他操作，App 會自動存擋，把資料存進資料庫，讓他們永久儲存。

![Picture2.png](Picture2.png)


在每一篇 Diary 裡面，你可以任意選取其中一段文字（Segements），點擊星星按鈕，把他加到其中一個主題，並在主題頁面中瀏覽。

![Picture3.png](Picture3.png)

在主題頁中，你也可以導覽所有該主題的 segments，以及點擊 segments 回去原本的那篇 Diary。

會這樣設計是因為：我是一個喜歡寫日記的人，每一篇日記中可能會有我那天對不同主題的想法，而當日期一多，這些內容就很分散，為了方便記錄與整理，把他們收集在一個地方會很大程度的改善我的使用體驗。


## 🏗️ 技術架構

### 前端
- **React 18** 搭配 TypeScript
- **React Router** 用於導航
- **React Markdown** 支援 GFM
- **CSS3** 現代化佈局（Grid、Flexbox）

### 後端
- **Node.js 20+** 搭配 TypeScript
- **Express 4** 用於 REST API
- **Prisma 5** 作為 ORM（型別安全的資料庫存取）
- **Zod** 用於結構驗證
- **Swagger/OpenAPI** 用於 API 文件

### 資料庫
- **PostgreSQL 15**（Alpine）
- **Prisma Migrate** 用於結構管理

### DevOps
- **Docker & Docker Compose** 容器化
- **Make** 簡化指令
- **Nodemon** 熱重載開發

## 🚀 快速開始

### 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org/) 與 [PostgreSQL 15+](https://www.postgresql.org/) 用於本地開發

### 選項一：Docker（建議）

1. **複製儲存庫**
   ```bash
   git clone <repository-url>
   cd homework/hw3
   ```

2. **啟動所有服務**
   ```bash
   make dev
   ```

3. **存取應用程式**
   - 前端：http://localhost:3000
   - 後端 API：http://localhost:3001
   - API 文件：http://localhost:3001/api-docs
   - 健康檢查：http://localhost:3001/health

4. **填充資料庫**
   ```bash
   make docker-seed
   ```

### 選項二：本地開發

1. **設定環境**
   ```bash
   make local-setup
   ```

2. **啟動資料庫**（在 Docker 中）
   ```bash
   docker-compose up db
   ```

3. **執行後端與前端**
   ```bash
   make local-dev
   ```

## 📖 開發指令

### Docker 指令

| 指令 | 說明 |
|---------|-------------|
| `make dev` | 使用 Docker 啟動所有服務 |
| `make stop` | 停止所有 Docker 容器 |
| `make build` | 重新建置所有 Docker 映像 |
| `make logs` | 查看容器日誌（追蹤模式）|
| `make shell-backend` | 在後端容器開啟 Shell |
| `make shell-frontend` | 在前端容器開啟 Shell |
| `make docker-seed` | 在 Docker 中填充資料庫 |
| `make docker-db` | 在 Docker 中開啟 PostgreSQL CLI |

### 本地開發指令

| 指令 | 說明 |
|---------|-------------|
| `make local-setup` | 設定本地環境 |
| `make local-dev` | 本地執行後端與前端 |
| `make local-backend` | 僅執行後端（埠號 3001）|
| `make local-frontend` | 僅執行前端（埠號 3000）|
| `make local-seed` | 填充本地資料庫 |
| `make local-db` | 開啟本地 PostgreSQL CLI |

### 共用指令

| 指令 | 說明 |
|---------|-------------|
| `make install` | 安裝所有依賴套件 |
| `make seed` | 填充資料庫（自動偵測 Docker/本地）|
| `make db` | 開啟 PostgreSQL CLI（自動偵測）|
| `make clean` | 清理 node_modules 與 Docker 卷冊 |
| `make help` | 顯示所有可用指令 |

## 🗂️ 專案結構

```
hw3/
├── backend/                    # 後端服務
│   ├── prisma/
│   │   └── schema.prisma      # 資料庫結構
│   ├── src/
│   │   ├── server.ts          # 應用程式進入點
│   │   ├── config/            # 配置管理
│   │   │   ├── env.ts         # 環境變數（Zod）
│   │   │   ├── prisma.ts      # Prisma 客戶端單例
│   │   │   └── swagger.ts     # Swagger/OpenAPI 配置
│   │   ├── modules/           # 功能模組
│   │   │   └── diaries/       # 日記模組
│   │   │       ├── diary.dto.ts         # DTO 與驗證
│   │   │       ├── diary.repository.ts  # 資料存取層
│   │   │       ├── diary.service.ts     # 業務邏輯
│   │   │       ├── diary.controller.ts  # HTTP 處理器
│   │   │       └── diary.routes.ts      # 路由定義
│   │   ├── shared/            # 共享資源
│   │   │   ├── errors/        # 自訂錯誤類別
│   │   │   └── middleware/    # 全域中介軟體
│   │   └── scripts/           # 工具腳本
│   ├── seed-data/             # 種子資料
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # 前端應用程式
│   ├── src/
│   │   ├── App.tsx            # 主要應用程式元件
│   │   ├── components/        # React 元件
│   │   │   ├── DiaryForm.tsx
│   │   │   ├── DiarySidebar.tsx
│   │   │   ├── DiaryCard.tsx
│   │   │   ├── DiaryDetail.tsx
│   │   │   ├── DiaryList.tsx
│   │   │   ├── DiaryFolderSidebar.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ThemePage.tsx
│   │   │   ├── SegmentCard.tsx
│   │   │   ├── FloatingToolbar.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CreateFolderDialog.tsx
│   │   │   └── DataModeToggle.tsx
│   │   ├── services/          # API 服務
│   │   │   ├── api.ts
│   │   │   ├── diaryService.ts
│   │   │   ├── diaryService.api.ts
│   │   │   ├── diaryService.localStorage.ts
│   │   │   ├── themeService.ts
│   │   │   └── segmentService.ts
│   │   ├── types/             # TypeScript 型別
│   │   ├── styles/            # 元件樣式
│   │   └── utils/             # 工具函式
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # 容器編排
├── Makefile                    # 開發指令
└── README.md
```

## 🗄️ 資料庫結構

### 實體關聯圖

```
┌─────────────┐
│   Diary     │
│   日記      │
├─────────────┤
│ id (PK)     │
│ title       │ 標題
│ content     │ 內容
│ createdAt   │ 建立時間
│ updatedAt   │ 更新時間
└──────┬──────┘
       │ 1
       │
       │ *
┌──────┴──────┐
│  Segment    │
│  段落       │
├─────────────┤
│ id (PK)     │
│ diaryId (FK)│ 日記 ID
│ themeId (FK)│ 主題 ID ──┐
│ content     │ 內容      │
│ order       │ 順序      │
│ createdAt   │ 建立時間  │
│ updatedAt   │ 更新時間  │
└─────────────┘           │ *
                          │
                          │ 1
                   ┌──────┴──────┐
                   │   Theme     │
                   │   主題      │
                   ├─────────────┤
                   │ id (PK)     │
                   │ name        │ 名稱
                   │ description │ 描述
                   │ colorId (FK)│ 顏色 ID ──┐
                   │ createdAt   │ 建立時間  │
                   │ updatedAt   │ 更新時間  │
                   └─────────────┘           │ *
                                             │
                                             │ 1
                                      ┌──────┴──────┐
                                      │   Color     │
                                      │   顏色      │
                                      ├─────────────┤
                                      │ id (PK)     │
                                      │ hexCode     │ 色碼
                                      │ name        │ 名稱
                                      │ meaning     │ 意義
                                      │ createdAt   │ 建立時間
                                      └─────────────┘
```

### 模型說明

**Diary（日記）**
- 儲存日誌條目的主要實體
- 支援選用標題
- 自動記錄建立與更新時間戳記

**Segment（段落）**
- 從日記產生的 AI 文字段落
- 連結至父日記（串聯刪除）
- 選用主題分類
- 依序排列以順序顯示

**Theme（主題）**
- 依情緒/主題內容分類段落
- 顏色標示以視覺區分
- 範例：「拖延」、「自我反思」、「人際關係」

**Color（顏色）**
- 主題的視覺調色盤
- 包含十六進位色碼與語意意義

## 🔌 API 端點

### 日記相關

| 方法 | 端點 | 說明 | 請求主體 | 回應 |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/diaries` | 取得所有日記 | - | `{ success: true, data: Diary[] }` |
| `GET` | `/api/diaries?search=關鍵字` | 搜尋日記 | - | `{ success: true, data: Diary[] }` |
| `GET` | `/api/diaries/:id` | 依 ID 取得日記 | - | `{ success: true, data: Diary }` |
| `POST` | `/api/diaries` | 建立新日記 | `{ title?: string, content: string }` | `{ success: true, data: Diary }` |
| `PUT` | `/api/diaries/:id` | 更新日記 | `{ title?: string, content?: string }` | `{ success: true, data: Diary }` |
| `DELETE` | `/api/diaries/:id` | 刪除日記 | - | `{ success: true, data: { id: string } }` |

### 健康檢查

| 方法 | 端點 | 說明 |
|--------|----------|-------------|
| `GET` | `/health` | 伺服器健康狀態 |
| `GET` | `/api` | API 資訊 |

### 互動式文件

造訪 http://localhost:3001/api-docs 查看互動式 Swagger 文件。

## 🎯 架構設計

### 後端：模組化單體架構

後端採用**模組化單體架構**，清晰分離關注點：

```
請求 → 路由 → 控制器 → 服務 → 儲存庫 → 資料庫
                  ↓
             驗證（DTO）
```

**層級職責：**

- **路由（Routes）**：定義 URL 路徑與 HTTP 方法
- **控制器（Controller）**：處理 HTTP 請求/回應、輸入驗證
- **服務（Service）**：實作業務邏輯、協調儲存庫
- **儲存庫（Repository）**：透過 Prisma 進行資料庫 CRUD 操作
- **DTO**：定義結構與驗證規則（Zod）

**主要優勢：**
- ✅ 端到端型別安全（Prisma + TypeScript + Zod）
- ✅ 高內聚、低耦合
- ✅ 易於測試與維護
- ✅ 需要時可轉換為微服務

### 前端：元件化架構

```
App（路由器）
  ├── DiarySidebar（列表與導航）
  │     ├── SearchBar
  │     ├── CreateFolderDialog
  │     └── DiaryCard[]
  │
  └── DiaryForm（編輯器）
        ├── MarkdownRenderer
        ├── FloatingToolbar
        └── ConfirmDialog
```

**狀態管理**：React hooks（`useState`、`useEffect`、`useCallback`）

**資料流**：服務層 → API/LocalStorage → React State → UI

## 🌱 資料庫種子資料

應用程式包含範例資料供快速測試：

- **30+ 篇日記條目**，內容真實
- **5 種主題**：拖延、自我反思、人際關係、工作生活平衡、個人成長
- **10+ 種顏色**，附心理學意義
- **分段內容**，用於主題展示

填充資料庫：
```bash
make seed              # 自動偵測環境
make docker-seed       # 明確指定 Docker
make local-seed        # 明確指定本地
```

## 🧪 資料模式

Sisyphean 支援兩種資料儲存模式：

1. **API 模式**（預設）：完整後端 API 搭配 PostgreSQL
   - 跨工作階段持久化
   - 支援所有功能（主題、段落等）
   - 需要後端服務

2. **本地儲存模式**：基於瀏覽器的儲存
   - 離線能力
   - 僅限基本日記 CRUD
   - 資料儲存在 `localStorage`

使用標頭中的開關在模式間切換。

## 🔧 配置設定

### 環境變數

**後端**（`.env` 位於 `/backend/`）：
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://diary_user:diary_password@localhost:5432/diary_db
```

**前端**（`.env` 位於 `/frontend/`）：
```env
REACT_APP_API_URL=http://localhost:3001
```

### Docker 環境

所有環境變數已在 `docker-compose.yml` 中預先配置，供容器化開發使用。

## 📝 使用者故事

### Epic 1：日記記錄與瀏覽

- [x] **US 1-1**：新增富文字日記條目
- [x] **US 1-2**：自動儲存並附時間戳記
- [x] **US 1-3**：以卡片方式依日期排序總覽
- [x] **US 1-4**：全文閱讀檢視
- [x] **US 1-5**：依關鍵字、主題或情緒搜尋
- [x] **US 1-6**：編輯與刪除條目

### Epic 2：AI 主題分類

- [ ] **US 2-1**：自動段落分段
- [ ] **US 2-2**：AI 主題分類
- [ ] **US 2-3**：產生視覺化子卡片
- [ ] **US 2-4**：主題聚合檢視
- [ ] **US 2-5**：跳轉回原始條目
- [ ] **US 2-6**：手動編輯主題
- [ ] **US 2-7**：快速主題導航

## 🎨 設計理念

**Sisyphean**（西西弗斯）的靈感來自希臘神話中的薛西弗斯，他被判將巨石推上山頂，卻永遠無法成功。這個隱喻反映了：

- **持續的自我反思**：如同薛西弗斯的永恆任務，自我提升是一段持續的旅程
- **在重複中尋找意義**：日常寫日記在例行公事中找到意義
- **擁抱掙扎**：承認情緒與挑戰是成長的一部分

應用程式透過以下方式體現這個理念：
- 鼓勵持續的每日反思
- 揭示長期思想中的模式
- 將平凡的條目轉化為有意義的洞察

## 🛠️ 開發指南

### 執行測試

```bash
# 前端測試
cd frontend
npm test

# 後端測試（待實作）
cd backend
npm test
```

### 資料庫管理

```bash
# 在瀏覽器中查看資料庫
cd backend
npm run prisma:studio

# 建立遷移
npm run prisma:migrate

# 重置資料庫（⚠️ 刪除所有資料）
npm run db:reset
```

### 產品建置

```bash
# 建置前端
cd frontend
npm run build

# 建置後端
cd backend
npm run build
npm start
```

## 🐛 疑難排解

### 埠號已被使用

```bash
# 尋找使用埠號 3000/3001 的程序
lsof -ti:3000
lsof -ti:3001

# 終止程序
kill -9 <PID>
```

### Docker 問題

```bash
# 清理重啟
make clean
make build

# 查看日誌
make logs

# 重置一切
docker-compose down -v
docker system prune -f
```

### 資料庫連線問題

```bash
# 檢查資料庫狀態
docker-compose ps

# 查看資料庫日誌
docker-compose logs db

# 連線至資料庫
make db
```
